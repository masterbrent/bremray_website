// Render the shared shell around trusted, repository-owned page content.
// Run from the repository root: go run tools/sitegen/main.go [-check]
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type page struct {
	Path            string        `json:"path"`
	Key             string        `json:"key"`
	Home            bool          `json:"home,omitempty"`
	HideContactBand bool          `json:"hideContactBand,omitempty"`
	Scripts         []string      `json:"scripts,omitempty"`
	Head            template.HTML `json:"-"`
	Content         template.HTML `json:"-"`
}

func main() {
	check := flag.Bool("check", false, "verify generated pages without changing files")
	root := flag.String("root", ".", "repository root")
	flag.Parse()
	if err := build(*root, *check); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if *check {
		fmt.Println("Generated pages match the shared template and page sources.")
	} else {
		fmt.Println("Built all pages from site/layout.gohtml.")
	}
}

func build(root string, check bool) error {
	data, err := os.ReadFile(filepath.Join(root, "site/pages.json"))
	if err != nil {
		return err
	}
	var pages []page
	if err = json.Unmarshal(data, &pages); err != nil {
		return err
	}
	if len(pages) == 0 {
		return fmt.Errorf("page manifest is empty")
	}
	seen := map[string]bool{}
	keyPattern := regexp.MustCompile(`^[a-z0-9-]+$`)
	for _, p := range pages {
		clean := filepath.ToSlash(filepath.Clean(p.Path))
		if filepath.IsAbs(p.Path) || clean != p.Path || strings.HasPrefix(p.Path, "../") || !strings.HasSuffix(p.Path, ".html") || !keyPattern.MatchString(p.Key) {
			return fmt.Errorf("invalid page path/key: %q / %q", p.Path, p.Key)
		}
		if seen[p.Path] {
			return fmt.Errorf("duplicate output %q", p.Path)
		}
		seen[p.Path] = true
	}
	tmpl, err := template.ParseGlob(filepath.Join(root, "site/*.gohtml"))
	if err != nil {
		return err
	}
	// Render everything before writing so a missing source cannot leave a partial build.
	outputs := map[string][]byte{}
	for _, p := range pages {
		head, err := os.ReadFile(filepath.Join(root, "site/pages", p.Key+".head.gohtml"))
		if err != nil {
			return err
		}
		content, err := os.ReadFile(filepath.Join(root, "site/pages", p.Key+".body.gohtml"))
		if err != nil {
			return err
		}
		// These are trusted local HTML fragments, not customer input or remote content.
		p.Head = template.HTML(head)
		p.Content = template.HTML(content)
		var output bytes.Buffer
		if err := tmpl.ExecuteTemplate(&output, "layout.gohtml", p); err != nil {
			return fmt.Errorf("render %s: %w", p.Path, err)
		}
		lines := strings.Split(output.String(), "\n")
		for i := range lines {
			lines[i] = strings.TrimRight(lines[i], " \t")
		}
		built := strings.Join(lines, "\n")
		built = strings.Replace(built, "<!doctype html>\n", "<!doctype html>\n<!-- Generated from site/layout.gohtml and site/pages/. Edit sources, then run go run tools/sitegen/main.go. -->\n", 1)
		outputs[p.Path] = []byte(built)
	}
	for _, p := range pages {
		target := filepath.Join(root, filepath.FromSlash(p.Path))
		output := outputs[p.Path]
		if check {
			current, err := os.ReadFile(target)
			if err != nil {
				return fmt.Errorf("%s: %w", p.Path, err)
			}
			if !bytes.Equal(current, output) {
				return fmt.Errorf("%s is stale; run go run tools/sitegen/main.go", p.Path)
			}
		} else {
			if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
				return err
			}
			if err := os.WriteFile(target, output, 0644); err != nil {
				return err
			}
		}
	}
	return nil
}

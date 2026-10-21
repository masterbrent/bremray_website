// Record a reviewed content baseline. Never run to hide an unexplained test failure.
package main

import (
	"crypto/sha256"
	"encoding/json"
	"flag"
	"fmt"
	"html"
	"os"
	"regexp"
	"strings"
)

type snapshot struct {
	Metadata []string `json:"metadata"`
	Schemas  []string `json:"schemas"`
	TextHash string   `json:"main_text_sha256"`
	Links    []string `json:"links"`
}

func main() {
	write := flag.Bool("write", false, "replace the baseline after reviewing intentional content changes")
	flag.Parse()
	if !*write {
		fmt.Fprintln(os.Stderr, "Use -write only after reviewing the changed content, metadata and links.")
		os.Exit(2)
	}
	raw, err := os.ReadFile("site/pages.json")
	must(err)
	var pages []struct {
		Path string `json:"path"`
	}
	must(json.Unmarshal(raw, &pages))
	result := map[string]snapshot{}
	for _, p := range pages {
		raw, err = os.ReadFile(p.Path)
		must(err)
		s := string(raw)
		main := regexp.MustCompile(`(?s)<main\b.*?</main>`).FindString(s)
		text := regexp.MustCompile(`(?s)<!--.*?-->|<(?:script|style)\b[^>]*>.*?</(?:script|style)>`).ReplaceAllString(main, "")
		text = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(text, " ")
		text = strings.Join(strings.Fields(html.UnescapeString(text)), " ")
		result[p.Path] = snapshot{
			Metadata: regexp.MustCompile(`(?s)<title>.*?</title>|<meta\b[^>]*(?:name="(?:description|robots)"|property="og:[^"]*")[^>]*>|<link\b[^>]*rel="canonical"[^>]*>`).FindAllString(s, -1),
			Schemas:  regexp.MustCompile(`(?s)<script type="application/ld\+json">.*?</script>`).FindAllString(s, -1),
			TextHash: fmt.Sprintf("%x", sha256.Sum256([]byte(text))),
			Links:    regexp.MustCompile(`(?:href|src|id)="[^"]*"`).FindAllString(main, -1),
		}
	}
	out, err := json.MarshalIndent(result, "", "  ")
	must(err)
	must(os.WriteFile("tests/fixtures/template-baseline.json", append(out, '\n'), 0644))
	fmt.Printf("Recorded reviewed content for %d pages. Inspect the fixture diff before committing.\n", len(pages))
}
func must(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

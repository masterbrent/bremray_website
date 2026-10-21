package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// This manifest captures the last reviewed page content. Presentation may change
// without silently dropping SEO or intake data. Re-record only after copy review.
func TestProductionContentPreserved(t *testing.T) {
	data, err := os.ReadFile("../../tests/fixtures/template-baseline.json")
	if err != nil {
		t.Fatal(err)
	}
	var baseline map[string]struct {
		Metadata []string `json:"metadata"`
		Schemas  []string `json:"schemas"`
		TextHash string   `json:"main_text_sha256"`
		Links    []string `json:"links"`
	}
	if err := json.Unmarshal(data, &baseline); err != nil {
		t.Fatal(err)
	}
	if len(baseline) != 18 {
		t.Fatal("expected 18 production pages")
	}
	var sharedHeader, sharedFooter string
	for path, b := range baseline {
		raw, err := os.ReadFile(filepath.Join("../..", path))
		if err != nil {
			t.Fatal(err)
		}
		s := string(raw)
		for _, meta := range append(b.Metadata, b.Schemas...) {
			if !strings.Contains(s, meta) {
				t.Errorf("%s lost metadata/schema: %s", path, meta)
			}
		}
		main := regexp.MustCompile(`(?s)<main\b.*?</main>`).FindString(s)
		text := regexp.MustCompile(`(?s)<!--.*?-->|<(?:script|style)\b[^>]*>.*?</(?:script|style)>`).ReplaceAllString(main, "")
		text = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(text, " ")
		text = strings.Join(strings.Fields(html.UnescapeString(text)), " ")
		if fmt.Sprintf("%x", sha256.Sum256([]byte(text))) != b.TextHash {
			t.Errorf("%s content changed", path)
		}
		links := regexp.MustCompile(`(?:href|src|id)="[^"]*"`).FindAllString(main, -1)
		for _, link := range b.Links {
			found := false
			for _, actual := range links {
				if actual == link {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("%s lost %s", path, link)
			}
		}
		header := regexp.MustCompile(`(?s)<header\b.*?</header>`).FindString(s)
		footer := regexp.MustCompile(`(?s)<footer\b.*?</footer>`).FindString(s)
		if sharedHeader == "" {
			sharedHeader = header
			sharedFooter = footer
		}
		if header != sharedHeader || footer != sharedFooter {
			t.Errorf("%s diverges from shared shell", path)
		}
		if strings.Contains(main, `style="`) {
			t.Errorf("%s still has inline styling", path)
		}
		if regexp.MustCompile(`/css/(?:main|design|type|type-content|fonts|adaptive-intake|lead-first-home)\.css`).MatchString(s) {
			t.Errorf("%s loads legacy skin", path)
		}
	}
	if err := build("../..", true); err != nil {
		t.Fatal(err)
	}
}

func fixture(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	files := map[string]string{
		"site/pages.json":                 `[{"path":"index.html","key":"home","home":true},{"path":"services.html","key":"services"}]`,
		"site/layout.gohtml":              `<!doctype html><html><head>{{.Head}}</head><body>{{template "header" .}}{{.Content}}{{template "footer" .}}</body></html>`,
		"site/header.gohtml":              `{{define "header"}}<header>Shared header</header>{{end}}`,
		"site/footer.gohtml":              `{{define "footer"}}<footer>Shared footer</footer>{{end}}`,
		"site/pages/home.head.gohtml":     `<title>Home &amp; work</title><script type="application/ld+json">{"name":"Bremray"}</script>`,
		"site/pages/home.body.gohtml":     `<main><h1>Home</h1><a href="#questions">Start</a></main>`,
		"site/pages/services.head.gohtml": `<title>Services</title>`,
		"site/pages/services.body.gohtml": `<main><h1>Services</h1><p>Existing copy.</p></main>`,
	}
	for name, body := range files {
		p := filepath.Join(root, name)
		os.MkdirAll(filepath.Dir(p), 0755)
		if err := os.WriteFile(p, []byte(body), 0644); err != nil {
			t.Fatal(err)
		}
	}
	return root
}
func TestSharedTemplateAndPageContent(t *testing.T) {
	root := fixture(t)
	if err := build(root, false); err != nil {
		t.Fatal(err)
	}
	if err := build(root, true); err != nil {
		t.Fatal(err)
	}
	home, _ := os.ReadFile(filepath.Join(root, "index.html"))
	services, _ := os.ReadFile(filepath.Join(root, "services.html"))
	if !strings.Contains(string(home), `<title>Home &amp; work</title>`) || !strings.Contains(string(home), `{"name":"Bremray"}`) {
		t.Fatal("metadata/schema changed")
	}
	if !strings.Contains(string(services), "Existing copy.") {
		t.Fatal("page content lost")
	}
	os.WriteFile(filepath.Join(root, "site/header.gohtml"), []byte(`{{define "header"}}<header>One new header</header>{{end}}`), 0644)
	if err := build(root, true); err == nil {
		t.Fatal("check must detect stale output")
	}
	unchanged, _ := os.ReadFile(filepath.Join(root, "index.html"))
	if string(unchanged) != string(home) {
		t.Fatal("check mutated output")
	}
	if err := build(root, false); err != nil {
		t.Fatal(err)
	}
	for _, p := range []string{"index.html", "services.html"} {
		b, _ := os.ReadFile(filepath.Join(root, p))
		if !strings.Contains(string(b), "One new header") {
			t.Fatal("shared edit not applied to", p)
		}
	}
	servicesBefore, _ := os.ReadFile(filepath.Join(root, "services.html"))
	os.WriteFile(filepath.Join(root, "site/pages/home.body.gohtml"), []byte(`<main>Changed home only</main>`), 0644)
	if err := build(root, false); err != nil {
		t.Fatal(err)
	}
	servicesAfter, _ := os.ReadFile(filepath.Join(root, "services.html"))
	if string(servicesBefore) != string(servicesAfter) {
		t.Fatal("page-specific edit leaked")
	}
	os.Remove(filepath.Join(root, "index.html"))
	if err := build(root, true); err == nil {
		t.Fatal("missing output passed")
	}
}
func TestManifestSafety(t *testing.T) {
	for _, manifest := range []string{`[{"path":"../outside.html","key":"home"}]`, `[{"path":"index.html","key":"../outside"}]`, `[{"path":"index.html","key":"home"},{"path":"index.html","key":"services"}]`, `[]`} {
		t.Run(manifest, func(t *testing.T) {
			root := fixture(t)
			os.WriteFile(filepath.Join(root, "site/pages.json"), []byte(manifest), 0644)
			if err := build(root, false); err == nil {
				t.Fatal("invalid manifest accepted")
			}
		})
	}
}

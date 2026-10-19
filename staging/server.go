package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// Remove third-party widgets before the browser receives the HTML.
// Parent-page submit handlers cannot stop a cross-origin form from sending.
var leadEmbed = regexp.MustCompile(`(?s)<!--Start of Housecallpro Lead Capture code-->.*?<!--End of Housecallpro Lead Capture code-->`)

//go:embed lead-form-preview.tmpl
var leadPreview []byte

func previewAddress(value string) (string, error) {
	if value == "" {
		return "127.0.0.1:8766", nil
	}
	host, port, err := net.SplitHostPort(value)
	if err != nil {
		return "", fmt.Errorf("preview address must be a loopback IP and port: %w", err)
	}
	ip := net.ParseIP(host)
	n, err := strconv.Atoi(port)
	if ip == nil || !ip.IsLoopback() || err != nil || n < 1 || n > 65535 {
		return "", fmt.Errorf("preview address must use a loopback IP and a port from 1 to 65535")
	}
	return value, nil
}

func main() {
	addr, err := previewAddress(os.Getenv("BREMRAY_PREVIEW_ADDR"))
	if err != nil {
		log.Fatal(err)
	}
	root, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Robots-Tag", "noindex, nofollow")
		w.Header().Set("Cache-Control", "no-store")
		// Also block an external widget accidentally added outside the markers.
		w.Header().Set("Content-Security-Policy", "frame-src 'none'; object-src 'none'; form-action 'none'; connect-src 'self'; script-src 'self'; base-uri 'self'")
		if r.URL.Path == "/robots.txt" {
			w.Write([]byte("User-agent: *\nDisallow: /\n"))
			return
		}
		p := filepath.Clean("/" + r.URL.Path)
		if p == "/" {
			p = "/index.html"
		}
		if strings.HasPrefix(p, "/.") || strings.HasPrefix(p, "/staging/") || strings.HasPrefix(p, "/tests/") {
			http.NotFound(w, r)
			return
		}
		if strings.HasSuffix(p, ".html") {
			b, err := os.ReadFile(filepath.Join(root, p))
			if err != nil {
				http.NotFound(w, r)
				return
			}
			b = leadEmbed.ReplaceAllLiteral(b, leadPreview)
			b = bytes.ReplaceAll(b, []byte(`<script defer src="/js/analytics.js?v=20261019"></script>`), nil)
			b = bytes.Replace(b, []byte("</head>"), []byte(`<meta name="robots" content="noindex,nofollow"><script defer src="/js/staging.js"></script></head>`), 1)
			b = bytes.ReplaceAll(b, []byte(`action="https://formspree.io/f/xkgwnnqr"`), []byte(`action="#" data-staging-form="true"`))
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.Write(b)
			return
		}
		http.ServeFile(w, r, filepath.Join(root, p))
	})
	log.Printf("Bremray staging: http://%s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

// Build only the three shared assets that have readable authoring copies.
package main

import (
	"bytes"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	check := flag.Bool("check", false, "verify committed assets without changing them")
	flag.Parse()
	if err := build(*check); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func build(check bool) error {
	assets := []string{"css/main.css", "js/analytics.js", "js/generator-tabs.js"}
	outdir := "."
	if check {
		var err error
		outdir, err = os.MkdirTemp("", "bremray-assets-")
		if err != nil {
			return err
		}
		defer os.RemoveAll(outdir)
	}
	args := []string{"run", "github.com/evanw/esbuild/cmd/esbuild@v0.28.2"}
	for _, asset := range assets {
		args = append(args, filepath.Join("assets-src", asset))
	}
	args = append(args, "--outbase=assets-src", "--outdir="+outdir, "--minify",
		"--target=chrome80,edge80,firefox78,safari13", "--charset=utf8", "--legal-comments=inline")
	cmd := exec.Command("go", args...)
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	cmd.Env = os.Environ()
	if os.Getenv("GOMAXPROCS") == "" {
		cmd.Env = append(cmd.Env, "GOMAXPROCS=2")
	}
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("build assets: %w", err)
	}
	if check {
		for _, asset := range assets {
			generated, err := os.ReadFile(filepath.Join(outdir, asset))
			if err != nil {
				return err
			}
			committed, err := os.ReadFile(asset)
			if err != nil {
				return err
			}
			if !bytes.Equal(generated, committed) {
				return fmt.Errorf("%s is stale; run go run tools/build-assets.go", asset)
			}
		}
		fmt.Println("Committed assets match their readable sources.")
	}
	return nil
}

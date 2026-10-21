// Build responsive WebP copies while preserving the reviewed original artwork.
// Requires cwebp (libwebp). Run: go run tools/build-images.go
package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

func main() {
	encoder, err := exec.LookPath("cwebp")
	if err != nil {
		fmt.Fprintln(os.Stderr, "Install libwebp to provide cwebp, then run again.")
		os.Exit(1)
	}
	if err := os.MkdirAll("images/responsive", 0755); err != nil {
		panic(err)
	}
	jobs := make(chan []string)
	errors := make(chan error, 12)
	var wg sync.WaitGroup
	// Two small encodes at a time keeps memory bounded on the owner's Mac.
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for args := range jobs {
				if output, err := exec.Command(encoder, args...).CombinedOutput(); err != nil {
					errors <- fmt.Errorf("%v: %w: %s", args, err, output)
				}
			}
		}()
	}
	for _, name := range []string{"ev-charging", "generator", "panel", "home-phone-v2"} {
		for _, width := range []int{480, 960, 1440} {
			jobs <- []string{"-quiet", "-q", "76", "-resize", fmt.Sprint(width), "0", "-metadata", "none", filepath.Join("images", name+".jpg"), "-o", filepath.Join("images/responsive", fmt.Sprintf("%s-%d.webp", name, width))}
		}
	}
	close(jobs)
	wg.Wait()
	close(errors)
	failed := false
	for err := range errors {
		fmt.Fprintln(os.Stderr, err)
		failed = true
	}
	if failed {
		os.Exit(1)
	}
	fmt.Println("Built 12 responsive images; original images remain unchanged.")
}

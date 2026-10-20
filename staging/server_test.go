package main

import "testing"

func TestPreviewAddressStaysOnLoopback(t *testing.T) {
	for _, input := range []string{"", "127.0.0.1:8767", "[::1]:8767"} {
		got, err := previewAddress(input)
		if err != nil || got == "" {
			t.Fatalf("%q rejected: %v", input, err)
		}
	}
	for _, input := range []string{":8767", "0.0.0.0:8767", "192.168.1.1:8767", "example.com:8767", "127.0.0.1:0", "127.0.0.1:70000", "127.0.0.1:http"} {
		if _, err := previewAddress(input); err == nil {
			t.Fatalf("unsafe address %q accepted", input)
		}
	}
}

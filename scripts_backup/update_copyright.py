import os
import glob

# Find all HTML files
html_files = glob.glob('/Users/brenthall/bremray/website/**/*.html', recursive=True)

for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace 2024 with 2025 in copyright notices
    updated_content = content.replace('© 2024 Bremray Electrical', '© 2025 Bremray Electrical')
    
    if updated_content != content:
        with open(filepath, 'w') as f:
            f.write(updated_content)
        print(f"Updated {filepath}")

print("Copyright year updated to 2025!")
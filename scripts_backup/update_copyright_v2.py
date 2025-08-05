import os
import re

# List all HTML files
html_files = [
    'index.html',
    'about.html',
    'contact.html',
    'services.html',
    'electrical-panel-upgrade.html',
    'ev-charger-installation.html',
    'whole-house-generator.html',
    'residential-electrical.html',
    'privacy.html',
    'get-help.html',
    '404.html',
    'grounding-and-bonding.html',
    'locations/chelsea-electrician.html'
]

for file in html_files:
    filepath = f'/Users/brenthall/bremray/website/{file}'
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace 2024 with 2025
        updated_content = re.sub(r'&copy; 2024', '&copy; 2025', content)
        
        if updated_content != content:
            with open(filepath, 'w') as f:
                f.write(updated_content)
            print(f"Updated {file}")
        else:
            print(f"No changes needed in {file}")

print("\nAll copyright years updated to 2025!")
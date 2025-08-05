import os

# List of all HTML files
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
    'locations/chelsea-electrician.html'
]

def update_logo_and_favicon(filepath, is_subfolder=False):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Update logo path
    if is_subfolder:
        content = content.replace('img/logo.png', '../images/logo.png')
        content = content.replace('../img/logo.png', '../images/logo.png')
    else:
        content = content.replace('img/logo.png', 'images/logo.png')
    
    # Add favicon after the title tag if not already present
    if 'favicon' not in content:
        favicon_path = '../images/favicon.ico' if is_subfolder else 'images/favicon.ico'
        favicon_line = f'    <link rel="icon" type="image/x-icon" href="{favicon_path}">\n'
        
        # Find the title tag and add favicon after it
        title_end = content.find('</title>')
        if title_end != -1:
            insert_pos = content.find('\n', title_end) + 1
            content = content[:insert_pos] + favicon_line + content[insert_pos:]
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Updated {filepath}")

# Update main files
for file in html_files:
    filepath = f'/Users/brenthall/bremray/website/{file}'
    if os.path.exists(filepath):
        is_subfolder = '/' in file
        update_logo_and_favicon(filepath, is_subfolder)

print("All files updated!")
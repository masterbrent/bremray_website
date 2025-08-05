import os

# The new header HTML
new_header = '''    <!-- Header -->
    <header>
        <div class="container">
            <div class="header-content">
                <a href="index.html" class="logo">
                    <img src="img/logo.png" alt="Bremray Electrical">
                </a>
                <nav>
                    <a href="index.html">Home</a>
                    <div class="dropdown">
                        <span class="dropdown-toggle">Services</span>
                        <div class="dropdown-menu">
                            <a href="services.html">All Services</a>
                            <a href="electrical-panel-upgrade.html">Panel Upgrades</a>
                            <a href="ev-charger-installation.html">EV Chargers</a>
                            <a href="whole-house-generator.html">Generators</a>
                            <a href="residential-electrical.html">Residential</a>
                        </div>
                    </div>
                    <a href="about.html">About</a>
                    <a href="contact.html">Contact</a>
                </nav>
                <a href="tel:7342169437" class="phone-cta">
                    <span class="phone-icon">📞</span>
                    <span>(734) 216-9437</span>
                </a>
            </div>
        </div>
    </header>'''

# For files in locations folder, adjust the paths
new_header_locations = '''    <!-- Header -->
    <header>
        <div class="container">
            <div class="header-content">
                <a href="../index.html" class="logo">
                    <img src="../img/logo.png" alt="Bremray Electrical">
                </a>
                <nav>
                    <a href="../index.html">Home</a>
                    <div class="dropdown">
                        <span class="dropdown-toggle">Services</span>
                        <div class="dropdown-menu">
                            <a href="../services.html">All Services</a>
                            <a href="../electrical-panel-upgrade.html">Panel Upgrades</a>
                            <a href="../ev-charger-installation.html">EV Chargers</a>
                            <a href="../whole-house-generator.html">Generators</a>
                            <a href="../residential-electrical.html">Residential</a>
                        </div>
                    </div>
                    <a href="../about.html">About</a>
                    <a href="../contact.html">Contact</a>
                </nav>
                <a href="tel:7342169437" class="phone-cta">
                    <span class="phone-icon">📞</span>
                    <span>(734) 216-9437</span>
                </a>
            </div>
        </div>
    </header>'''

# List of files to update
files = [
    'about.html',
    'contact.html', 
    'electrical-panel-upgrade.html',
    'ev-charger-installation.html',
    'get-help.html',
    'privacy.html',
    'residential-electrical.html',
    'services.html',
    'whole-house-generator.html',
    '404.html'
]

location_files = [
    'locations/chelsea-electrician.html'
]

def update_header(filepath, new_header_content):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find the header section
    start = content.find('<!-- Header -->')
    if start == -1:
        print(f"Header not found in {filepath}")
        return
    
    # Find the end of header
    end = content.find('</header>', start)
    if end == -1:
        print(f"Header end not found in {filepath}")
        return
    
    end = end + len('</header>')
    
    # Replace the header
    new_content = content[:start] + new_header_content + content[end:]
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"Updated {filepath}")

# Update main files
for file in files:
    filepath = f'/Users/brenthall/bremray/website/{file}'
    if os.path.exists(filepath):
        update_header(filepath, new_header)

# Update location files
for file in location_files:
    filepath = f'/Users/brenthall/bremray/website/{file}'
    if os.path.exists(filepath):
        update_header(filepath, new_header_locations)

print("All headers updated!")
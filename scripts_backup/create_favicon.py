from PIL import Image, ImageDraw

# Create a 32x32 favicon with lightning bolt
size = 32
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Lightning bolt shape - simplified for small size
# Using Bremray's orange color (#f39c12)
orange = (243, 156, 18, 255)

# Define lightning bolt points
points = [
    (16, 2),   # Top point
    (10, 14),  # Left middle
    (14, 14),  # Small indent
    (8, 30),   # Bottom point
    (18, 12),  # Right middle
    (14, 12),  # Small indent
    (20, 2),   # Top right
]

# Draw the lightning bolt
draw.polygon(points, fill=orange)

# Add a subtle dark outline for visibility
outline_color = (44, 62, 80, 255)  # Dark blue
outline_points = [
    (16, 1), (9, 14), (13, 14), (7, 31),
    (19, 11), (15, 11), (21, 1), (16, 1)
]
draw.line(outline_points, fill=outline_color, width=1)

# Save as ICO
img.save('/Users/brenthall/bremray/website/images/favicon.ico', 'ICO')

# Also save as PNG for modern browsers
img.save('/Users/brenthall/bremray/website/images/favicon.png', 'PNG')

# Create larger versions for different uses
for size in [16, 48, 64]:
    sized_img = img.resize((size, size), Image.Resampling.LANCZOS)
    sized_img.save(f'/Users/brenthall/bremray/website/images/favicon-{size}.png', 'PNG')

print("Favicon created successfully!")
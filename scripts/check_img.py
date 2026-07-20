from PIL import Image

try:
    img = Image.open("../assets/images/layout/whatsapp-icon.png")
    print("Format:", img.format)
    print("Size:", img.size)
    print("Mode:", img.mode)
    
    # Check if there is an alpha channel and if it has any transparent pixels
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        print("Image has alpha channel / transparency info.")
        # Let's check some pixels
        extrema = img.getextrema()
        print("Extrema:", extrema)
    else:
        print("Image has NO alpha channel.")
except Exception as e:
    print("Error:", e)

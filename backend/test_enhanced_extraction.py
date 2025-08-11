import requests
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import json

def create_test_birth_certificate():
    """Create a simple test birth certificate image"""
    # Create a white image
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic font
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        title_font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()
    
    # Draw a simple birth certificate
    draw.text((200, 50), "REPUBLIC OF THE PHILIPPINES", fill='black', font=title_font)
    draw.text((300, 80), "BIRTH CERTIFICATE", fill='black', font=title_font)
    
    draw.text((50, 150), "Name: DELA CRUZ, JUAN MIGUEL", fill='black', font=font)
    draw.text((50, 180), "Date of Birth: January 15, 1995", fill='black', font=font)
    draw.text((50, 210), "Place of Birth: Manila, Philippines", fill='black', font=font)
    draw.text((50, 240), "Sex: Male", fill='black', font=font)
    draw.text((50, 270), "Citizenship: Filipino", fill='black', font=font)
    draw.text((50, 300), "Father: DELA CRUZ, JOSE ANTONIO", fill='black', font=font)
    draw.text((50, 330), "Mother: SANTOS, MARIA ELENA", fill='black', font=font)
    
    return img

def create_blurry_image():
    """Create a blurry version for testing"""
    from PIL import ImageFilter
    img = create_test_birth_certificate()
    # Add blur and noise
    img = img.filter(ImageFilter.GaussianBlur(radius=1.5))
    return img

def test_extraction(image, test_name):
    """Test the extraction API with an image"""
    print(f"\n=== Testing {test_name} ===")
    
    # Convert image to bytes
    img_bytes = io.BytesIO()
    image.save(img_bytes, format='PNG')
    img_bytes = img_bytes.getvalue()
    
    # Prepare the request
    files = {'document': ('test_birth_cert.png', img_bytes, 'image/png')}
    
    try:
        response = requests.post('http://localhost:5001/api/extract-pdf', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Extraction successful!")
            print("Extracted fields:")
            for key, value in result.items():
                if value and key != 'rawText':
                    print(f"  {key}: {value}")
            
            # Check if we got reasonable results
            has_name = bool(result.get('surname') or result.get('firstName'))
            has_birth_info = bool(result.get('dateOfBirth') or result.get('placeOfBirth'))
            has_gender = bool(result.get('sex'))
            
            score = sum([has_name, has_birth_info, has_gender])
            print(f"Extraction quality score: {score}/3")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print("Testing Enhanced Image Extraction...")
    
    # Test 1: Clear birth certificate
    clear_img = create_test_birth_certificate()
    test_extraction(clear_img, "Clear Birth Certificate")
    
    # Test 2: Blurry birth certificate
    blurry_img = create_blurry_image()
    test_extraction(blurry_img, "Blurry Birth Certificate")
    
    print("\n=== Test Complete ===")

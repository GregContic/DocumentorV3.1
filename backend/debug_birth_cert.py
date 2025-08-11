import requests
import json
import sys

def debug_birth_certificate(image_path):
    """Debug a birth certificate image to see what's being extracted"""
    
    print(f"Debugging birth certificate: {image_path}")
    print("=" * 50)
    
    # Read the image file
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
    except FileNotFoundError:
        print(f"Error: File '{image_path}' not found")
        return
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    # Test the debug endpoint first
    print("🔍 STEP 1: Getting debug information...")
    files = {'document': (image_path, image_data, 'image/jpeg')}
    
    try:
        response = requests.post('http://localhost:5001/api/extract-debug', files=files)
        if response.status_code == 200:
            debug_info = response.json()
            print(f"✅ Raw text extracted: {debug_info['raw_text_length']} characters")
            print(f"✅ Lines detected: {debug_info['lines_count']}")
            print(f"✅ Birth certificate detected: {debug_info['is_birth_certificate']}")
            
            print("\n🔍 First 10 lines of extracted text:")
            for i, line in enumerate(debug_info['first_10_lines'], 1):
                print(f"  {i}: {line}")
            
            print("\n🔍 Detection keywords:")
            for key, value in debug_info['detection_keywords'].items():
                status = "✅" if value else "❌"
                print(f"  {status} {key}: {value}")
                
            print(f"\n🔍 Raw text preview (first 500 chars):")
            print(repr(debug_info['raw_text_preview'][:500]))
            
        else:
            print(f"❌ Debug request failed: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Debug request error: {e}")
        return
    
    # Test the actual extraction
    print("\n🔍 STEP 2: Testing actual extraction...")
    files = {'document': (image_path, image_data, 'image/jpeg')}
    
    try:
        response = requests.post('http://localhost:5001/api/extract-pdf', files=files)
        if response.status_code == 200:
            result = response.json()
            print("✅ Extraction successful!")
            print("\n📋 Extracted fields:")
            
            fields_found = 0
            for key, value in result.items():
                if value and key != 'rawText':
                    print(f"  ✅ {key}: {value}")
                    fields_found += 1
                elif key != 'rawText':
                    print(f"  ❌ {key}: (not found)")
            
            print(f"\n📊 Summary: {fields_found} fields extracted successfully")
            
            if fields_found == 0:
                print("\n🔧 Troubleshooting suggestions:")
                print("1. Check if the image is clear and text is readable")
                print("2. Try uploading a higher resolution image")
                print("3. Make sure the birth certificate text is in English or Filipino")
                print("4. Check the debug output above for OCR issues")
                
        else:
            print(f"❌ Extraction failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Extraction error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python debug_birth_cert.py <path_to_image>")
        print("Example: python debug_birth_cert.py my_birth_cert.jpg")
    else:
        debug_birth_certificate(sys.argv[1])

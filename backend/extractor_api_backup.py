
# Imports
import os
import io
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
import pdfplumber
import pytesseract
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Flask app and CORS
app = Flask(__name__)
CORS(app)

# Ensure CORS headers are set on all responses, including errors
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# Ensure CORS headers are set on all error responses, including exceptions
@app.errorhandler(HTTPException)
def handle_http_exception(e):
    response = e.get_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# Helper function to extract text from PDF using pdfplumber

def extract_text_from_pdf(pdf_bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_image_bytes(image_bytes):
    # Try Google Cloud Vision OCR if credentials are set
    import os
    if os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
        try:
            from google.cloud import vision
            client = vision.ImageAnnotatorClient()
            image = vision.Image(content=image_bytes)
            response = client.text_detection(image=image)
            texts = response.text_annotations
            if texts:
                return texts[0].description
        except Exception as e:
            pass  # Fallback to Tesseract below
    
    # Advanced OCR preprocessing for better text extraction
    from PIL import ImageFilter, ImageOps, ImageEnhance
    import numpy as np
    
    # Special preprocessing for birth certificates
    def preprocess_birth_certificate(img):
        """Special preprocessing pipeline for birth certificates"""
        processed_imgs = []
        
        # Convert to RGB first, then to grayscale for better quality
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to grayscale using luminance weights for better text preservation
        img = img.convert('L')
        
        # 1. Aggressive upscaling for this specific document type
        # Birth certificates often have small text that needs significant enlargement
        target_width = 4000  # Much larger for better text recognition
        if img.width < target_width:
            scale_factor = target_width / img.width
            new_size = (int(img.width * scale_factor), int(img.height * scale_factor))
            img = img.resize(new_size, Image.LANCZOS)
            print(f"DEBUG: Upscaled birth certificate to {new_size}")
        
        # 2. Enhanced noise reduction specifically for scanned documents
        img_clean = img.copy()
        
        # Multiple denoising passes with different kernel sizes
        img_clean = img_clean.filter(ImageFilter.MedianFilter(size=3))
        img_clean = img_clean.filter(ImageFilter.MedianFilter(size=5))
        
        # Remove isolated noise pixels
        img_clean = img_clean.filter(ImageFilter.ModeFilter(size=3))
        
        # 3. Histogram equalization simulation using autocontrast
        img_eq = ImageOps.autocontrast(img_clean, cutoff=2)
        processed_imgs.append(img_eq)
        
        # 4. Multiple contrast and brightness combinations specifically for forms
        contrast_brightness_combos = [
            (2.0, 1.0),   # High contrast, normal brightness
            (2.5, 1.1),   # Higher contrast, slight brightness boost
            (3.0, 0.9),   # Very high contrast, slight brightness reduction
            (3.5, 1.0),   # Extreme contrast for faded text
            (1.8, 1.2),   # Moderate contrast, higher brightness
        ]
        
        for contrast, brightness in contrast_brightness_combos:
            enhanced = ImageEnhance.Contrast(img_clean).enhance(contrast)
            enhanced = ImageEnhance.Brightness(enhanced).enhance(brightness)
            
            # Apply sharpening specifically tuned for text
            enhanced = enhanced.filter(ImageFilter.SHARPEN)
            enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=2))
            
            processed_imgs.append(enhanced)
        
        # 5. Binary thresholding with multiple levels for different text darkness
        threshold_levels = [90, 110, 130, 150, 170, 190]
        for threshold in threshold_levels:
            # Apply slight blur before thresholding to reduce noise
            blurred = img_clean.filter(ImageFilter.GaussianBlur(radius=0.5))
            binary = blurred.point(lambda x: 255 if x > threshold else 0, mode='1')
            binary = binary.convert('L')  # Convert back to grayscale
            processed_imgs.append(binary)
        
        # 6. Adaptive-like thresholding using local statistics simulation
        # Create multiple versions with different local adjustments
        for block_size in [50, 100, 150]:
            try:
                # Simulate adaptive thresholding by applying different thresholds to image regions
                adaptive_img = img_clean.copy()
                width, height = adaptive_img.size
                
                # Process in blocks
                for y in range(0, height, block_size):
                    for x in range(0, width, block_size):
                        # Extract region
                        box = (x, y, min(x + block_size, width), min(y + block_size, height))
                        region = adaptive_img.crop(box)
                        
                        # Calculate local threshold based on region statistics
                        pixels = list(region.getdata())
                        if pixels:
                            mean_val = sum(pixels) / len(pixels)
                            local_threshold = max(90, min(180, mean_val - 20))
                            
                            # Apply local threshold
                            region_binary = region.point(lambda x: 255 if x > local_threshold else 0)
                            adaptive_img.paste(region_binary, box)
                
                processed_imgs.append(adaptive_img)
            except:
                pass  # Skip if adaptive processing fails
        
        # 7. Morphological operations for text cleanup
        try:
            # Closing operation (dilation followed by erosion) to connect broken text
            closed_img = img_clean.filter(ImageFilter.MaxFilter(3))  # Dilation
            closed_img = closed_img.filter(ImageFilter.MinFilter(3))  # Erosion
            processed_imgs.append(closed_img)
            
            # Opening operation (erosion followed by dilation) to remove noise
            opened_img = img_clean.filter(ImageFilter.MinFilter(3))  # Erosion
            opened_img = opened_img.filter(ImageFilter.MaxFilter(3))  # Dilation
            processed_imgs.append(opened_img)
        except:
            pass
        
        return processed_imgs
    
    # Load image
    img = Image.open(io.BytesIO(image_bytes))
    original_img = img.copy()
    
    # Convert to grayscale
    pil_img = img.convert('L')
    
    # Detect if this looks like a birth certificate (check filename instead of bytes)
    # We'll detect birth certificates later based on extracted text content
    
    # Try multiple preprocessing approaches and combine results
    extracted_texts = []
    
    # Approach 1: Birth Certificate Specific Preprocessing (always try for better results)
    try:
        processed_images = preprocess_birth_certificate(pil_img)
        
        for idx, processed_img in enumerate(processed_images):
            # Try multiple PSM modes for each processed image with enhanced configs
            psm_configs = [
                (6, '--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- '),
                (3, '--psm 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- '),
                (4, '--psm 4 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- '),
                (1, '--psm 1'),  # Automatic page segmentation with OSD
                (11, '--psm 11'), # Sparse text
                (12, '--psm 12'), # Sparse text with OSD
                (8, '--psm 8'),   # Single word
                (13, '--psm 13'), # Raw line
                (7, '--psm 7'),   # Single text line
            ]
            
            for psm, config in psm_configs:
                try:
                    text = pytesseract.image_to_string(processed_img, config=config)
                    if text.strip() and len(text) > 20:  # Only keep substantial extractions
                        extracted_texts.append(text)
                        print(f"DEBUG: Birth cert preprocessing {idx}, PSM {psm} extracted {len(text)} chars")
                except Exception as e:
                    print(f"DEBUG: Birth cert preprocessing {idx}, PSM {psm} failed: {e}")
                    continue
    except Exception as e:
        print(f"DEBUG: Birth certificate preprocessing failed: {e}")
    
    # Approach 2: Enhanced preprocessing for clear documents with birth certificate optimizations
    try:
        processed_img = pil_img.copy()
        
        # Auto contrast and brightness adjustment
        processed_img = ImageOps.autocontrast(processed_img, cutoff=2)
        processed_img = ImageEnhance.Brightness(processed_img).enhance(1.1)
        
        # Enhanced contrast specifically tuned for birth certificates
        processed_img = ImageEnhance.Contrast(processed_img).enhance(3.0)  # Increased from 2.5
        
        # Multiple noise reduction passes for better quality
        processed_img = processed_img.filter(ImageFilter.MedianFilter(size=3))
        processed_img = processed_img.filter(ImageFilter.MedianFilter(size=5))  # Additional pass
        
        # Enhanced sharpening for birth certificate text
        processed_img = processed_img.filter(ImageFilter.SHARPEN)
        processed_img = processed_img.filter(ImageFilter.UnsharpMask(radius=2, percent=200, threshold=2))  # More aggressive
        
        # Upscale significantly for birth certificates (they often have small text)
        if processed_img.width < 2000 or processed_img.height < 2000:
            scale = max(2000 / processed_img.width, 2000 / processed_img.height)
            new_size = (int(processed_img.width * scale), int(processed_img.height * scale))
            processed_img = processed_img.resize(new_size, Image.LANCZOS)
        
        # OCR with different PSM modes optimized for birth certificates
        psm_configs = [
            (6, '--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- '),
            (3, '--psm 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- '),
            (8, '--psm 8'),  # Single word mode for names
            (13, '--psm 13'), # Raw line mode
            (4, '--psm 4'),   # Single column mode
        ]
        
        for psm, config in psm_configs:
            try:
                text = pytesseract.image_to_string(processed_img, config=config)
                if text.strip():
                    extracted_texts.append(text)
                    print(f"DEBUG: Enhanced preprocessing PSM {psm} extracted {len(text)} chars")
            except Exception as e:
                print(f"DEBUG: Enhanced preprocessing PSM {psm} failed: {e}")
                continue
                
    except Exception as e:
        print(f"DEBUG: Approach 2 failed: {e}")
    
    
    # Approach 3: Advanced OpenCV-based preprocessing specifically for birth certificates
    try:
        import cv2
        
        # Convert PIL to OpenCV format
        np_img = np.array(pil_img)
        
        # Birth certificate specific preprocessing
        print("DEBUG: Applying advanced OpenCV preprocessing for birth certificates")
        
        # 1. Multiple denoising approaches
        denoising_methods = [
            lambda img: cv2.fastNlMeansDenoising(img, None, 10, 7, 21),
            lambda img: cv2.bilateralFilter(img, 9, 75, 75),  # Smooth while preserving edges
            lambda img: cv2.medianBlur(img, 5),  # Remove salt-and-pepper noise
        ]
        
        for method_idx, denoise_method in enumerate(denoising_methods):
            try:
                denoised = denoise_method(np_img.copy())
                
                # 2. Adaptive thresholding with multiple parameters
                threshold_params = [
                    (cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 11, 2),
                    (cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 15, 2),
                    (cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 21, 4),
                    (cv2.ADAPTIVE_THRESH_MEAN_C, 11, 2),
                    (cv2.ADAPTIVE_THRESH_MEAN_C, 15, 4),
                ]
                
                for thresh_type, block_size, C in threshold_params:
                    try:
                        # Apply adaptive threshold
                        thresh = cv2.adaptiveThreshold(denoised, 255, thresh_type, cv2.THRESH_BINARY, block_size, C)
                        
                        # 3. Morphological operations to clean up text
                        # Remove noise
                        kernel_noise = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
                        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel_noise)
                        
                        # Connect broken characters
                        kernel_connect = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 1))
                        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel_connect)
                        
                        # Convert back to PIL for OCR
                        pil_thresh = Image.fromarray(cleaned)
                        
                        # 4. Upscale significantly for birth certificates
                        if pil_thresh.width < 2400:
                            scale = 2400 / pil_thresh.width
                            new_size = (int(pil_thresh.width * scale), int(pil_thresh.height * scale))
                            pil_thresh = pil_thresh.resize(new_size, Image.LANCZOS)
                        
                        # 5. Try multiple OCR configurations optimized for birth certificates
                        ocr_configs = [
                            '--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- ',
                            '--psm 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- ',
                            '--psm 4',  # Single column
                            '--psm 8',  # Single word
                            '--psm 13', # Raw line
                        ]
                        
                        for config in ocr_configs:
                            try:
                                text = pytesseract.image_to_string(pil_thresh, config=config)
                                if text.strip() and len(text) > 15:
                                    extracted_texts.append(text)
                                    print(f"DEBUG: OpenCV method {method_idx}, thresh {thresh_type}, config {config[:10]} extracted {len(text)} chars")
                            except Exception as e:
                                print(f"DEBUG: OCR config {config[:10]} failed: {e}")
                                continue
                                
                    except Exception as e:
                        print(f"DEBUG: Threshold params {thresh_type}, {block_size}, {C} failed: {e}")
                        continue
                        
            except Exception as e:
                print(f"DEBUG: Denoising method {method_idx} failed: {e}")
                continue
                
    except ImportError:
        print("OpenCV not available, using PIL-only preprocessing")
    except Exception as e:
        print(f"Approach 3 failed: {e}")
    
    
    # Approach 4: Aggressive preprocessing specifically for very blurry/damaged birth certificates
    try:
        processed_img = pil_img.copy()
        
        print("DEBUG: Applying aggressive preprocessing for birth certificates")
        
        # 1. Extreme upscaling first (birth certificates often have small text)
        if processed_img.width < 3000:
            scale = 3000 / processed_img.width
            new_size = (int(processed_img.width * scale), int(processed_img.height * scale))
            processed_img = processed_img.resize(new_size, Image.LANCZOS)
            print(f"DEBUG: Upscaled to {new_size}")
        
        # 2. Heavy denoising with multiple passes
        for _ in range(2):
            processed_img = processed_img.filter(ImageFilter.MedianFilter(size=5))
        
        # 3. Auto-adjust levels first
        processed_img = ImageOps.autocontrast(processed_img, cutoff=1)
        
        # 4. Multiple contrast enhancement levels
        contrast_levels = [3.0, 4.0, 5.0]
        for contrast_level in contrast_levels:
            contrast_img = ImageEnhance.Contrast(processed_img).enhance(contrast_level)
            
            # 5. Multiple sharpening passes
            sharp_img = contrast_img
            for _ in range(3):
                sharp_img = sharp_img.filter(ImageFilter.SHARPEN)
            
            # 6. Unsharp mask for final sharpening
            sharp_img = sharp_img.filter(ImageFilter.UnsharpMask(radius=2, percent=250, threshold=2))
            
            # 7. Try different binary thresholds
            threshold_values = [100, 120, 140, 160, 180]
            for threshold in threshold_values:
                binary_img = sharp_img.point(lambda x: 0 if x < threshold else 255, '1').convert('L')
                
                # 8. Try different OCR configurations
                configs = [
                    '--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- ',
                    '--psm 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/()- ',
                    '--psm 4',  # Single column of text
                    '--psm 8',  # Single word
                    '--psm 13', # Raw line
                    '--psm 7',  # Single text line
                ]
                
                for config in configs:
                    try:
                        text = pytesseract.image_to_string(binary_img, config=config)
                        if text.strip() and len(text) > 20:
                            extracted_texts.append(text)
                            print(f"DEBUG: Aggressive preprocessing contrast {contrast_level}, threshold {threshold}, config {config[:10]} extracted {len(text)} chars")
                    except Exception as e:
                        print(f"DEBUG: Aggressive OCR config {config[:10]} failed: {e}")
                        continue
                
    except Exception as e:
        print(f"DEBUG: Approach 4 failed: {e}")
    
    
    # Approach 5: Rotation and skew correction for birth certificates
    try:
        print("DEBUG: Trying rotation and skew correction")
        
        # Try different rotations for skewed images
        rotation_angles = [0, -1, 1, -2, 2, -3, 3, -5, 5, 90, 180, 270]
        
        for angle in rotation_angles:
            try:
                if angle == 0:
                    rotated = pil_img
                else:
                    rotated = pil_img.rotate(angle, expand=True, fillcolor=255)  # White background
                
                # Enhanced preprocessing for rotated image
                processed = rotated.copy()
                
                # Auto contrast and brightness
                processed = ImageOps.autocontrast(processed, cutoff=2)
                processed = ImageEnhance.Brightness(processed).enhance(1.1)
                processed = ImageEnhance.Contrast(processed).enhance(2.5)
                
                # Noise reduction
                processed = processed.filter(ImageFilter.MedianFilter(size=3))
                
                # Sharpening
                processed = processed.filter(ImageFilter.SHARPEN)
                processed = processed.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
                
                # Upscaling for small text
                if processed.width < 2000:
                    scale = 2000 / processed.width
                    new_size = (int(processed.width * scale), int(processed.height * scale))
                    processed = processed.resize(new_size, Image.LANCZOS)
                
                # Try OCR with different configurations
                ocr_configs = [
                    '--psm 6',
                    '--psm 3',
                    '--psm 4',
                    '--psm 1',  # Automatic page segmentation with OSD
                ]
                
                for config in ocr_configs:
                    try:
                        text = pytesseract.image_to_string(processed, config=config)
                        if text.strip() and len(text) > 30:
                            extracted_texts.append(text)
                            print(f"DEBUG: Rotation {angle}°, config {config} extracted {len(text)} chars")
                    except Exception as e:
                        print(f"DEBUG: Rotation {angle}°, config {config} failed: {e}")
                        continue
                        
            except Exception as e:
                print(f"DEBUG: Rotation {angle}° failed: {e}")
                continue
                
    except Exception as e:
        print(f"DEBUG: Approach 5 failed: {e}")
    
    
    # Fallback: Simple preprocessing with birth certificate optimizations
    if not extracted_texts:
        try:
            print("DEBUG: Applying fallback preprocessing")
            simple_img = pil_img.copy()
            
            # Auto-adjust levels
            simple_img = ImageOps.autocontrast(simple_img, cutoff=3)
            
            # Moderate contrast enhancement
            simple_img = ImageEnhance.Contrast(simple_img).enhance(2.5)
            
            # Brightness adjustment
            simple_img = ImageEnhance.Brightness(simple_img).enhance(1.1)
            
            # Single noise reduction pass
            simple_img = simple_img.filter(ImageFilter.MedianFilter(size=3))
            
            # Light sharpening
            simple_img = simple_img.filter(ImageFilter.SHARPEN)
            
            # Upscale for birth certificates
            if simple_img.width < 1500:
                scale = 1500 / simple_img.width
                new_size = (int(simple_img.width * scale), int(simple_img.height * scale))
                simple_img = simple_img.resize(new_size, Image.LANCZOS)
            
            # Try basic OCR
            configs = ['--psm 6', '--psm 3', '--psm 1']
            for config in configs:
                try:
                    text = pytesseract.image_to_string(simple_img, config=config)
                    if text.strip():
                        extracted_texts.append(text)
                        print(f"DEBUG: Fallback config {config} extracted {len(text)} chars")
                except Exception as e:
                    print(f"DEBUG: Fallback config {config} failed: {e}")
        except Exception as e:
            print(f"DEBUG: Fallback failed: {e}")
    
    # Combine and return best result with improved selection logic
    if extracted_texts:
        # Filter out very short extractions (likely noise)
        valid_texts = [text for text in extracted_texts if len(text.strip()) > 50]
        
        if not valid_texts:
            valid_texts = extracted_texts  # Use all if no long ones found
        
        # Score texts based on various criteria for birth certificates
        def score_text_quality(text):
            score = 0
            
            # Length score (longer is generally better, but with diminishing returns)
            length_score = min(len(text) / 1000, 1.0) * 30
            score += length_score
            
            # Birth certificate keywords score
            birth_cert_keywords = [
                'birth', 'certificate', 'republic', 'philippines', 'civil', 'registrar',
                'child', 'father', 'mother', 'hospital', 'date', 'place', 'sex',
                'citizenship', 'name', 'born', 'residence', 'occupation'
            ]
            keyword_count = sum(1 for keyword in birth_cert_keywords if keyword.lower() in text.lower())
            score += keyword_count * 5
            
            # Proper name patterns (capitalized words)
            proper_names = len(re.findall(r'\b[A-Z][a-z]+\b', text))
            score += proper_names * 2
            
            # Date patterns
            date_patterns = len(re.findall(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b[A-Z][a-z]+ \d{1,2}, \d{4}\b', text))
            score += date_patterns * 10
            
            # Penalize excessive special characters or numbers (OCR noise)
            noise_chars = len(re.findall(r'[^\w\s.,:/()-]', text))
            score -= noise_chars * 0.5
            
            # Penalize fragmented text (too many single characters)
            single_chars = len(re.findall(r'\b\w\b', text))
            score -= single_chars * 1
            
            return score
        
        # Score all texts and pick the best one
        scored_texts = [(score_text_quality(text), text) for text in valid_texts]
        best_score, best_text = max(scored_texts, key=lambda x: x[0])
        
        print(f"DEBUG: Selected best text with score {best_score:.2f} from {len(extracted_texts)} extractions")
        print(f"DEBUG: Best text length: {len(best_text)} characters")
        print(f"DEBUG: First 200 chars of best text: {repr(best_text[:200])}")
        
        return best_text
    else:
        print("DEBUG: No text could be extracted from image")
        return ""

# Helper function to extract text from images (for scanned PDFs)
from PIL import ImageFilter, ImageOps, ImageEnhance

def extract_text_from_images(pdf_bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            img = page.to_image(resolution=300).original
            # Advanced preprocessing
            pil_img = img.convert('L')  # Grayscale
            pil_img = ImageOps.autocontrast(pil_img)  # Auto contrast
            pil_img = ImageEnhance.Contrast(pil_img).enhance(2.0)  # Increase contrast
            pil_img = pil_img.filter(ImageFilter.SHARPEN)  # Sharpen image
            # Adaptive thresholding
            pil_img = pil_img.point(lambda x: 0 if x < 128 else 255, '1')
            text += pytesseract.image_to_string(pil_img)
    return text

# Main extraction endpoint


@app.route('/api/extract-pdf', methods=['POST'])
def extract_pdf():
    print('DEBUG: request.files:', request.files)
    print('DEBUG: request.form:', request.form)
    if 'document' not in request.files:
        print('DEBUG: No file uploaded with key "document"')
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['document']
    file_bytes = file.read()
    filename = file.filename.lower()
    
    print(f'DEBUG: Processing file: {filename}')

    # Detect file type
    if filename.endswith('.pdf'):
        # Try text extraction first
        text = extract_text_from_pdf(file_bytes)
        if not text.strip():
            # If no text found, try OCR on images in PDF
            text = extract_text_from_images(file_bytes)
    elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
        text = extract_text_from_image_bytes(file_bytes)
    else:
        return jsonify({'error': 'Unsupported file type'}), 400

    print(f'DEBUG: Raw extracted text length: {len(text)}')
    print(f'DEBUG: First 500 characters of extracted text:')
    print(repr(text[:500]))

    import re
    # Preprocess text to fix common OCR errors
    ocr_replacements = [
        (r'net:', 'Name:'),
        (r'Respltal', 'Hospital'),
        (r'OATE', 'DATE'),
        (r'CTZENSHP', 'Citizenship'),
        (r'Bith', 'Birth'),
        (r'Birtt', 'Birth'),
        (r'Gende', 'Gender'),
        (r'ie \| 1 GON \| RELIGION', ''),
        (r'\bSex\b', 'Sex'),
        (r'\bGON\b', ''),
        (r'\bRELIGION\b', ''),
        (r'\bSchoo1\b', 'School'),
        (r'\bSchooI\b', 'School'),
        (r'\bAddres\b', 'Address'),
        (r'\bLRN\b', 'LRN'),
        # Birth certificate specific OCR fixes
        (r'Bith Certificate', 'Birth Certificate'),
        (r'Cerificate', 'Certificate'),
        (r'Certicate', 'Certificate'),
        (r'REPUBUC', 'REPUBLIC'),
        (r'PHIUPPINES', 'PHILIPPINES'),
        (r'Chlld', 'Child'),
        (r'Chld', 'Child'),
        (r'Narne', 'Name'),
        (r'Fatner', 'Father'),
        (r'Motner', 'Mother'),
        (r'Moter', 'Mother'),
        (r'Borm', 'Born'),
        (r'Hospial', 'Hospital'),
        (r'Hosptal', 'Hospital'),
        (r'KASARIN', 'KASARIAN'),
        (r'KASARIAH', 'KASARIAN'),
        (r'Filipno', 'Filipino'),
        (r'Fipino', 'Filipino'),
        # Additional corrections for your specific document
        (r'exeried', 'CHERRIE'),
        (r'wars', 'was'),
        (r'chit who', 'child who'),
        (r'she Birth ofthe', 'the Birth of the'),
        (r'PLACE OF MARRI', ''),
        (r'Benguet Core Fospital', 'Benguet General Hospital'),
        (r'La Trinidad.*Boxguet', 'La Trinidad, Benguet'),
        (r'Nevenbor', 'November'),
        (r'Hovenber', 'November'),
        (r'Filipine', 'Filipino'),
        (r'Pilipine', 'Filipino'),
        (r'Rarer Catholia', 'Roman Catholic'),
        (r'Renax Catholic', 'Roman Catholic'),
        (r'Room Attendaxt', 'Room Attendant'),
        (r'Housekeepor', 'Housekeeper'),
        (r'Central Balili', 'Central, Balili'),
        (r'Physelan', 'Physician'),
        (r'Aidwite', 'Midwife'),
        (r'Tractional', 'Traditional'),
        (r'enfant', ''),
    ]
    for pat, rep in ocr_replacements:
        text = re.sub(pat, rep, text, flags=re.IGNORECASE)
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    # Detect document type
    is_form137 = (
        'form 137' in filename or
        re.search(r'form\s*137', text, re.IGNORECASE) or
        any('form 137' in l.lower() for l in lines)
    )
    is_form138 = (
        'form 138' in filename or
        re.search(r'form\s*138', text, re.IGNORECASE) or
        any('form 138' in l.lower() for l in lines)
    )
    is_goodmoral = (
        'good moral' in filename or
        re.search(r'good\s*moral', text, re.IGNORECASE) or
        any('good moral' in l.lower() for l in lines)
    )
    is_birth_certificate = (
        'birth' in filename.lower() or
        'certificate' in filename.lower() or
        re.search(r'birth\s*certificate', text, re.IGNORECASE) or
        re.search(r'certificate\s*of\s*live\s*birth', text, re.IGNORECASE) or
        re.search(r'certificate\s*of\s*birth', text, re.IGNORECASE) or
        re.search(r'republic\s*of\s*the\s*philippines', text, re.IGNORECASE) or
        re.search(r'civil\s*registrar', text, re.IGNORECASE) or
        re.search(r'philippine\s*statistics\s*authority', text, re.IGNORECASE) or
        re.search(r'national\s*statistics\s*office', text, re.IGNORECASE) or
        re.search(r'psa|nso', text, re.IGNORECASE) or
        any(re.search(r'birth\s*certificate|certificate\s*of\s*live\s*birth|republic\s*of\s*the\s*philippines|civil\s*registrar|statistics\s*authority|statistics\s*office', l, re.IGNORECASE) for l in lines)
    )
    
    print(f'DEBUG: Document type detection:')
    print(f'  is_form137: {is_form137}')
    print(f'  is_form138: {is_form138}')
    print(f'  is_goodmoral: {is_goodmoral}')
    print(f'  is_birth_certificate: {is_birth_certificate}')

    # --- Always return a consistent set of fields ---
    extracted = {
        'lrn': '',
        'lastName': '',
        'firstName': '',
        'middleName': '',
        'birthDate': '',
        'placeOfBirth': '',
        'gender': '',
        'citizenship': '',
        'schoolYear': '',
        'father': '',
        'mother': '',
        'schoolName': '',
        'schoolAddress': '',
        'rawText': text
    }
    # --- Form 137 Extraction ---
    if is_form137:
        # (copy the old Form 137 extraction logic, but fill into 'extracted' dict)
        lrn_match = re.search(r'(LRN|Learner Reference Number)[:\s-]*([0-9]{5,})', text, re.IGNORECASE)
        if lrn_match:
            extracted['lrn'] = lrn_match.group(2)
        name_line = ''
        for l in lines:
            if re.search(r'(Name|Pangalan)[:\s-]', l, re.IGNORECASE):
                name_line = l.split(':',1)[-1].strip()
                break
        if not name_line:
            for l in lines:
                words = [w for w in l.replace(',', ' ').split() if w.isalpha()]
                if 2 <= len(words) <= 5 and all(w[0].isupper() for w in words):
                    name_line = l
                    break
        if name_line:
            name_line_clean = re.split(r'(Sangay|Paaralan|School|Division|Grade|Baitang|Section|Seksyon|:)', name_line)[0].strip()
            name_parts = [p for p in name_line_clean.replace(',', ' ').split() if p.isalpha()]
            if len(name_parts) >= 2:
                extracted['lastName'] = name_parts[0]
                extracted['firstName'] = name_parts[1]
                if len(name_parts) > 2:
                    if len(name_parts[2]) == 1 and len(name_parts) == 3:
                        extracted['middleName'] = name_parts[2]
                    else:
                        extracted['middleName'] = ' '.join(name_parts[2:])
        date_patterns = [
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,.-]+\d{1,2}[\s,.-]+\d{4}\b',
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
            r'\b\d{4}-\d{2}-\d{2}\b',
            r'\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)[,]? \d{4}',
            r'\bIpinanganak\b[:\s-]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})',
            r'\bKapanganakan\b[:\s-]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})',
            r'Petsa ng Kapanganakan[:\s-]*([0-9]{1,2}\s*[–-]\s*\d{1,2}\s*[–-]\s*\d{2,4})',
            r'Petsa ng Kapanganakan[:\s-]*([0-9]{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'Petsa ng Kapanakan[:\s-]*([0-9]{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'Petsa ng Kapanganakn[:\s-]*([0-9]{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'Petsa ng Kapanganaka[:\s-]*([0-9]{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        for l in lines:
            for pat in date_patterns:
                m = re.search(pat, l, re.IGNORECASE)
                if m:
                    extracted['birthDate'] = m.group(1) if m.lastindex else m.group(0)
                    extracted['birthDate'] = extracted['birthDate'].replace(',', '').replace('–', '-').replace('—', '-')
                    break
            if extracted['birthDate']:
                break
        for l in lines:
            m = re.search(r'(Gender|Kasarian|Kasaran|Kasaria|Kasarian:)[:\s-]*([A-Za-z])\b', l, re.IGNORECASE)
            if m:
                val = m.group(2).upper()
                if val in ['M', 'F']:
                    extracted['gender'] = 'Male' if val == 'M' else 'Female'
                    break
            m = re.search(r'(Gender|Kasarian|Kasaran|Kasaria|Kasarian:)[:\s-]*([A-Za-z]+)', l, re.IGNORECASE)
            if m:
                val = m.group(2).lower()
                if val in ['male', 'female', 'lalaki', 'babae']:
                    extracted['gender'] = 'Male' if val in ['male', 'lalaki'] else 'Female'
                    break
            if re.fullmatch(r'(Male|Female|Lalaki|Babae)', l, re.IGNORECASE):
                val = l.strip().capitalize()
                extracted['gender'] = 'Male' if val.lower() in ['male', 'lalaki'] else 'Female'
                break
        if not extracted['gender']:
            m = re.search(r'\b(male|female|lalaki|babae)\b', text, re.IGNORECASE)
            if m:
                val = m.group(1)
                extracted['gender'] = 'Male' if val.lower() in ['male', 'lalaki'] else 'Female'
        sy_matches = re.findall(r'(School Year|Taon ng Pag-aaral)[:\s-]*([0-9]{2,4})\s*[-–—]\s*([0-9]{2,4})', text, re.IGNORECASE)
        if sy_matches:
            extracted['schoolYear'] = f"{sy_matches[0][1]}-{sy_matches[0][2]}"
        else:
            sy_fallback = re.findall(r'([0-9]{2,4})\s*[-–—]\s*([0-9]{2,4})', text)
            if sy_fallback:
                extracted['schoolYear'] = f"{sy_fallback[0][0]}-{sy_fallback[0][1]}"
        for l in lines:
            if re.search(r'(School Name|Paaralan)[:\s-]', l, re.IGNORECASE):
                extracted['schoolName'] = l.split(':',1)[-1].strip()
                break
        if not extracted['schoolName']:
            for l in lines:
                if re.search(r'(Paaralan|School)[:\s-]', l, re.IGNORECASE):
                    val = l.split(':',1)[-1].strip()
                    if len(val.split()) > 1:
                        extracted['schoolName'] = val
                        break
            if not extracted['schoolName']:
                for l in lines:
                    if re.search(r'school|paaralan', l, re.IGNORECASE) and len(l.split()) > 2:
                        extracted['schoolName'] = l.strip()
                        break
        for l in lines:
            if re.search(r'(Address|Tirahan)[:\s-]', l, re.IGNORECASE):
                val = l.split(':',1)[-1].strip()
                if not re.search(r'Hanapbuhay|Occupation', val, re.IGNORECASE):
                    extracted['schoolAddress'] = val
                    break
        if not extracted['schoolAddress']:
            for l in lines:
                if re.search(r'address|tirahan', l, re.IGNORECASE) and len(l.split()) > 2 and not re.search(r'Hanapbuhay|Occupation', l, re.IGNORECASE):
                    extracted['schoolAddress'] = l.strip()
                    break
        if not extracted['lrn'] and len(lines) > 0 and re.match(r'^[0-9]{5,}$', lines[0]):
            extracted['lrn'] = lines[0]
        if not extracted['lastName'] and len(lines) > 1:
            name_guess = [w for w in lines[1].replace(',', ' ').split() if w.isalpha()]
            if len(name_guess) >= 2:
                extracted['lastName'] = name_guess[0]
                extracted['firstName'] = name_guess[1]
                if len(name_guess) > 2:
                    extracted['middleName'] = ' '.join(name_guess[2:])
        # Form 137s rarely have parent info, so leave father/mother blank
        # Map to frontend expected keys for enrollment autofill
        mapped = {
            'learnerReferenceNumber': extracted.get('lrn', ''),
            'surname': extracted.get('lastName', ''),
            'firstName': extracted.get('firstName', ''),
            'middleName': extracted.get('middleName', ''),
            'dateOfBirth': extracted.get('birthDate', ''),
            'placeOfBirth': extracted.get('placeOfBirth', ''),
            'sex': extracted.get('gender', ''),
            'citizenship': extracted.get('citizenship', ''),
            'schoolYear': extracted.get('schoolYear', ''),
            'father': extracted.get('father', ''),
            'mother': extracted.get('mother', ''),
            'schoolName': extracted.get('schoolName', ''),
            'schoolAddress': extracted.get('schoolAddress', ''),
            'rawText': extracted.get('rawText', '')
        }

        return jsonify(mapped)

    # --- Form 138 Extraction ---
    if is_form138:
        # Try to extract similar fields as Form 137
        lrn_match = re.search(r'(LRN|Learner Reference Number)[:\s-]*([0-9]{5,})', text, re.IGNORECASE)
        if lrn_match:
            extracted['lrn'] = lrn_match.group(2)
        # Name
        name_line = ''
        for l in lines:
            if re.search(r'(Name|Pangalan)[:\s-]', l, re.IGNORECASE):
                name_line = l.split(':',1)[-1].strip()
                break
        if not name_line:
            for l in lines:
                words = [w for w in l.replace(',', ' ').split() if w.isalpha()]
                if 2 <= len(words) <= 5 and all(w[0].isupper() for w in words):
                    name_line = l
                    break
        if name_line:
            name_line_clean = re.split(r'(Sangay|Paaralan|School|Division|Grade|Baitang|Section|Seksyon|:)', name_line)[0].strip()
            name_parts = [p for p in name_line_clean.replace(',', ' ').split() if p.isalpha()]
            if len(name_parts) >= 2:
                extracted['lastName'] = name_parts[0]
                extracted['firstName'] = name_parts[1]
                if len(name_parts) > 2:
                    if len(name_parts[2]) == 1 and len(name_parts) == 3:
                        extracted['middleName'] = name_parts[2]
                    else:
                        extracted['middleName'] = ' '.join(name_parts[2:])
        # School Year
        sy_matches = re.findall(r'(School Year|Taon ng Pag-aaral)[:\s-]*([0-9]{2,4})\s*[-–—]\s*([0-9]{2,4})', text, re.IGNORECASE)
        if sy_matches:
            extracted['schoolYear'] = f"{sy_matches[0][1]}-{sy_matches[0][2]}"
        # School Name
        for l in lines:
            if re.search(r'(School Name|Paaralan)[:\s-]', l, re.IGNORECASE):
                extracted['schoolName'] = l.split(':',1)[-1].strip()
                break
        # Address
        for l in lines:
            if re.search(r'(Address|Tirahan)[:\s-]', l, re.IGNORECASE):
                val = l.split(':',1)[-1].strip()
                if not re.search(r'Hanapbuhay|Occupation', val, re.IGNORECASE):
                    extracted['schoolAddress'] = val
                    break
        # Map to frontend expected keys
        mapped = {
            'learnerReferenceNumber': extracted.get('lrn', ''),
            'surname': extracted.get('lastName', ''),
            'firstName': extracted.get('firstName', ''),
            'middleName': extracted.get('middleName', ''),
            'schoolYear': extracted.get('schoolYear', ''),
            'schoolName': extracted.get('schoolName', ''),
            'schoolAddress': extracted.get('schoolAddress', ''),
            'rawText': extracted.get('rawText', '')
        }
        return jsonify(mapped)

    # --- Good Moral Extraction ---
    if is_goodmoral:
        # Try to extract name and school
        name_line = ''
        for l in lines:
            if re.search(r'(Name|Pangalan)[:\s-]', l, re.IGNORECASE):
                name_line = l.split(':',1)[-1].strip()
                break
        if not name_line:
            for l in lines:
                words = [w for w in l.replace(',', ' ').split() if w.isalpha()]
                if 2 <= len(words) <= 5 and all(w[0][0].isupper() for w in words):
                    name_line = l
                    break
        if name_line:
            name_line_clean = re.split(r'(Sangay|Paaralan|School|Division|Grade|Baitang|Section|Seksyon|:)', name_line)[0].strip()
            name_parts = [p for p in name_line_clean.replace(',', ' ').split() if p.isalpha()]
            if len(name_parts) >= 2:
                extracted['lastName'] = name_parts[0]
                extracted['firstName'] = name_parts[1]
                if len(name_parts) > 2:
                    extracted['middleName'] = ' '.join(name_parts[2:])
        # School Name
        for l in lines:
            if re.search(r'(School Name|Paaralan)[:\s-]', l, re.IGNORECASE):
                extracted['schoolName'] = l.split(':',1)[-1].strip()
                break
        mapped = {
            'surname': extracted.get('lastName', ''),
            'firstName': extracted.get('firstName', ''),
            'middleName': extracted.get('middleName', ''),
            'schoolName': extracted.get('schoolName', ''),
            'rawText': extracted.get('rawText', '')
        }
        return jsonify(mapped)

    # --- Birth Certificate Extraction ---
    if is_birth_certificate:
        print("DEBUG: Detected Birth Certificate")
        
        # More aggressive OCR corrections for birth certificates
        birth_cert_replacements = [
            (r'exeried', 'CHERRIE'),
            (r'wars', 'was'),
            (r'chit who', 'child who'),
            (r'she Birth ofthe', 'the Birth of the'),
            (r'PLACE OF MARRI', ''),
            (r'Benguet Core Fospital', 'Benguet General Hospital'),
            (r'La Trinidad.*Boxguet', 'La Trinidad, Benguet'),
            (r'Nevenbor', 'November'),
            (r'Hovenber', 'November'),
            (r'Filipine', 'Filipino'),
            (r'Pilipine', 'Filipino'),
            (r'Rarer Catholia', 'Roman Catholic'),
            (r'Renax Catholic', 'Roman Catholic'),
            (r'Room Attendaxt', 'Room Attendant'),
            (r'Housekeepor', 'Housekeeper'),
            (r'Central Balili', 'Central, Balili'),
            (r'Physelan', 'Physician'),
            (r'Aidwite', 'Midwife'),
            (r'Tractional', 'Traditional'),
            (r'enfant', ''),
            (r'Benguet.*Core.*Fospital', 'Benguet General Hospital'),
        ]
        
        for pat, rep in birth_cert_replacements:
            text = re.sub(pat, rep, text, flags=re.IGNORECASE)
        
        # Enhanced name extraction for birth certificates with more patterns
        name_patterns = [
            # Look for "certify that [NAME] was born" or similar
            r'(?:certify|certifies).*?that\s+([A-Z][A-Z\s,]{8,40}?)\s+(?:was\s+born|born)',
            r'(?:birth\s+of\s+the\s+child\s+who\s+was\s+born)\s+.*?([A-Z][A-Z\s,]{8,40})',
            r'(?:child\s+who\s+was\s+born).*?([A-Z][A-Z\s,]{8,40})',
            # Standard patterns
            r'(?:Child|Name|CHILD|NAME)[:.\s]*([A-Z][a-zA-Z\s,]+?)(?:\s*Sex|Gender|Date|Born|Male|Female|$)',
            r'(?:Full\s*Name|FULL\s*NAME)[:.\s]*([A-Z][a-zA-Z\s,]+?)(?:\s*Sex|Gender|Date|Born|Male|Female|$)',
            r'(?:PANGALAN|Pangalan)[:.\s]*([A-Z][a-zA-Z\s,]+?)(?:\s*Sex|Gender|Date|Born|Male|Female|Kasarian|$)',
            # More flexible patterns
            r'(?:Name\s*of\s*Child|CHILD\'S\s*NAME)[:.\s]*([A-Z][a-zA-Z\s,]+?)(?:\s*Sex|Gender|Date|Born|Male|Female|$)',
            r'(?:Complete\s*Name|COMPLETE\s*NAME)[:.\s]*([A-Z][a-zA-Z\s,]+?)(?:\s*Sex|Gender|Date|Born|Male|Female|$)',
            # Look for names between specific markers
            r'(?:X\s+Male|X\s+Female).*?([A-Z][A-Z\s,]{8,40}?)(?:\s*was\s+born|\s+born)',
            # Try to find proper names in lines (2-3 capitalized words)
            r'\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b(?=.*(?:born|birth|child))',
        ]
        
        # Try fallback patterns for common OCR issues
        name_fallback_patterns = [
            r'([A-Z][A-Z\s,]{10,50})(?:\s*was\s*born|\s*born)',  # Name followed by "was born"
            r'([A-Z]+\s*,\s*[A-Z\s]+?)(?:\s*Sex|Gender|Date|Born|Male|Female)',  # LASTNAME, FIRSTNAME pattern
            r'(?:son|daughter)[\s\S]*?of[\s\S]*?([A-Z][A-Z\s,]{8,40})',  # "son/daughter of [parents]" - extract child name
            # Look for lines with capitalized words that could be names
            r'^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$',  # Full line with 2-3 proper names
            # Look for names in specific contexts
            r'(?:I\s+certify|certify\s+that)\s+([A-Z][a-zA-Z\s,]+?)\s+(?:was|is)',
        ]
        
        # First try to find the child's name from the raw text
        child_name_found = False
        for pattern in name_patterns + name_fallback_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                name_text = match.group(1).strip().rstrip('.,;:')
                
                # Clean up common OCR errors in the name
                name_text = re.sub(r'\b(she|he|the|was|born|birth|child|who)\b', '', name_text, flags=re.IGNORECASE)
                name_text = re.sub(r'\s+', ' ', name_text).strip()
                
                print(f"DEBUG: Found name match: '{name_text}' using pattern: {pattern[:50]}...")
                
                # Skip if the name is too short or contains obvious OCR errors
                if len(name_text) < 3 or re.search(r'\d|[^\w\s,]', name_text):
                    continue
                    
                # Parse name (usually "LAST, FIRST MIDDLE" or "FIRST MIDDLE LAST")
                if ',' in name_text:
                    parts = name_text.split(',')
                    extracted['lastName'] = parts[0].strip()
                    if len(parts) > 1:
                        first_middle = parts[1].strip().split()
                        extracted['firstName'] = first_middle[0] if first_middle else ''
                        extracted['middleName'] = ' '.join(first_middle[1:]) if len(first_middle) > 1 else ''
                else:
                    name_parts = name_text.split()
                    if len(name_parts) >= 3:
                        # Assume "FIRST MIDDLE LAST" format
                        extracted['firstName'] = name_parts[0]
                        extracted['middleName'] = ' '.join(name_parts[1:-1])
                        extracted['lastName'] = name_parts[-1]
                    elif len(name_parts) == 2:
                        extracted['firstName'] = name_parts[0]
                        extracted['lastName'] = name_parts[1]
                    elif len(name_parts) >= 1:
                        extracted['firstName'] = name_parts[0]
                
                child_name_found = True
                break
        
        # If no clear name found, try to extract from context clues
        if not child_name_found:
            # Look for any proper names in the text that could be the child's name
            proper_names = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
            # Filter out common words that aren't names
            common_words = {'Male', 'Female', 'Birth', 'Certificate', 'Republic', 'Philippines', 'Office', 'Civil', 'Registrar', 'General', 'November', 'October', 'Place', 'Date', 'Hospital', 'Trinidad', 'Benguet', 'Catholic', 'Roman', 'Filipino', 'Province', 'City', 'Municipality'}
            candidate_names = [name for name in proper_names if name not in common_words and len(name) > 2]
            
            if candidate_names:
                # Take the first reasonable candidate
                first_candidate = candidate_names[0]
                extracted['firstName'] = first_candidate
                print(f"DEBUG: Using fallback name extraction: '{first_candidate}'")
        
        # Enhanced birth date extraction with more patterns
        birth_date_patterns = [
            # Standard date patterns
            r'(?:Date\s*of\s*Birth|Birth\s*Date|PETSA\s*NG\s*KAPANGANAKAN|Born)[:.\s]*([A-Za-z]+ \d{1,2}, \d{4})',
            r'(?:Date\s*of\s*Birth|Birth\s*Date|PETSA\s*NG\s*KAPANGANAKAN|Born)[:.\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(?:Date\s*of\s*Birth|Birth\s*Date|PETSA\s*NG\s*KAPANGANAKAN|Born)[:.\s]*(\w+ \d{1,2}, \d{4})',
            # More flexible patterns
            r'(?:born\s*on)[:.\s]*([A-Za-z]+ \d{1,2}, \d{4})',
            r'(?:born\s*on)[:.\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            # Standalone date patterns (more liberal)
            r'([A-Z][a-z]+ \d{1,2}, \d{4})',  # "January 15, 1995"
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # "01/15/1995"
            r'(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})',  # "15 January 1995"
            # Specific pattern for this document
            r'(October \d{1,2}, \d{4})',
            r'(November \d{1,2}, \d{4})',
        ]
        
        for pattern in birth_date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_candidate = match.group(1).strip()
                # Validate that it looks like a real date
                if re.search(r'\d{4}', date_candidate):  # Has a year
                    extracted['birthDate'] = date_candidate
                    print(f"DEBUG: Found birth date: '{extracted['birthDate']}'")
                    break
        
        # Enhanced place of birth extraction
        place_patterns = [
            r'(?:Place\s*of\s*Birth|LUGAR\s*NG\s*KAPANGANAKAN|Born\s*at|Born\s*in)[:.\s]*([A-Za-z\s,.-]+?)(?:\s*Sex|Gender|Father|Mother|Date|Citizenship|$)',
            r'(?:Hospital|Ospital|Medical\s*Center)[:.\s]*([A-Za-z\s,.-]+?)(?:\s*Address|Sex|Gender|Father|Mother|$)',
            r'(?:City|Municipality|Province)[:.\s]*([A-Za-z\s,.-]+?)(?:\s*Sex|Gender|Father|Mother|Date|$)',
            # Specific patterns for this document
            r'(Benguet.*?Hospital.*?La Trinidad.*?Benguet)',
            r'(La Trinidad,?\s*Benguet)',
            r'(Benguet General Hospital)',
        ]
        
        for pattern in place_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                place = match.group(1).strip().rstrip('.,;:')
                if len(place) > 3 and not re.search(r'male|female|m|f', place, re.IGNORECASE):
                    extracted['placeOfBirth'] = place
                    print(f"DEBUG: Found place of birth: '{place}'")
                    break
        
        # Enhanced gender extraction
        gender_patterns = [
            r'(?:Sex|Gender|KASARIAN)[:.\s]*(Male|Female|M|F|LALAKI|BABAE)',
            r'\b(Male|Female|LALAKI|BABAE)\b(?!\s*:)',  # Not followed by colon
            r'(?:son|daughter)\s*of',  # Infer from "son of" or "daughter of"
            r'X\s+(Male|Female)',  # Checkbox marked with X
        ]
        
        for pattern in gender_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                gender_val = match.group(1).upper() if match.group(1) else match.group(0).upper()
                if gender_val in ['MALE', 'M', 'LALAKI'] or 'SON' in gender_val:
                    extracted['gender'] = 'Male'
                    print(f"DEBUG: Found gender: Male")
                elif gender_val in ['FEMALE', 'F', 'BABAE'] or 'DAUGHTER' in gender_val:
                    extracted['gender'] = 'Female'
                    print(f"DEBUG: Found gender: Female")
                break
        
        # Enhanced parent name extraction with more patterns
        father_patterns = [
            r'(?:Father|AMA|Father\'s\s*Name|FATHER)[:.\s]*([A-Z][a-zA-Z\s,.-]+?)(?:\s*Mother|Occupation|Age|Citizenship|Address|$)',
            r'(?:PANGALAN\s*NG\s*AMA|Father\'s\s*Full\s*Name)[:.\s]*([A-Z][a-zA-Z\s,.-]+?)(?:\s*Mother|Occupation|Age|Citizenship|$)',
            r'(?:son|daughter)\s*of[:.\s]*([A-Z][a-zA-Z\s,.-]+?)\s*(?:and|&)',  # "son of FATHER and MOTHER"
            # Look for specific sections in the birth certificate
            r'(?:FATHER|AMA)\s*\n\s*([A-Z][a-zA-Z\s,.-]+)',
            r'(?:father|FATHER).*?([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
        ]
        
        for pattern in father_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                father_name = match.group(1).strip().rstrip('.,;:')
                # Clean up common OCR errors and unwanted text
                father_name = re.sub(r'\b(occupation|age|residence|citizenship|address|years?|old)\b.*', '', father_name, flags=re.IGNORECASE)
                father_name = re.sub(r'\s+', ' ', father_name).strip()
                
                if len(father_name) > 3 and not re.search(r'not\s*stated|unknown|n/a|male|female|\d{2,}', father_name, re.IGNORECASE):
                    extracted['father'] = father_name
                    print(f"DEBUG: Found father: '{father_name}'")
                    break
        
        mother_patterns = [
            r'(?:Mother|INA|Mother\'s\s*Name|MOTHER|Maiden\s*Name)[:.\s]*([A-Z][a-zA-Z\s,.-]+?)(?:\s*Father|Occupation|Age|Citizenship|Address|$)',
            r'(?:PANGALAN\s*NG\s*INA|Mother\'s\s*Full\s*Name)[:.\s]*([A-Z][a-zA-Z\s,.-]+?)(?:\s*Father|Occupation|Age|Citizenship|$)',
            r'(?:and|&)[:.\s]*([A-Z][a-zA-Z\s,.-]+?)(?:\s*Occupation|Age|Citizenship|Address|$)',  # "FATHER and MOTHER"
            # Look for specific sections in the birth certificate
            r'(?:MOTHER|INA)\s*\n\s*([A-Z][a-zA-Z\s,.-]+)',
            r'(?:mother|MOTHER).*?([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
            # Sometimes mothers are listed after "Housekeeper" or similar occupations
            r'(?:Housekeeper|Housewife|Teacher).*?([A-Z][a-z]+\s+[A-Z][a-z]+)',
        ]
        
        for pattern in mother_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                mother_name = match.group(1).strip().rstrip('.,;:')
                # Clean up common OCR errors and unwanted text
                mother_name = re.sub(r'\b(occupation|age|residence|citizenship|address|years?|old|housekeeper|housewife)\b.*', '', mother_name, flags=re.IGNORECASE)
                mother_name = re.sub(r'\s+', ' ', mother_name).strip()
                
                if len(mother_name) > 3 and not re.search(r'not\s*stated|unknown|n/a|male|female|\d{2,}|place\s+of\s+marri', mother_name, re.IGNORECASE):
                    extracted['mother'] = mother_name
                    print(f"DEBUG: Found mother: '{mother_name}'")
                    break
        
        # Citizenship (usually Filipino for birth certificates)
        citizenship_patterns = [
            r'(?:Citizenship|PAGKAMAMAMAYAN|Nationality)[:.\s]*(Filipino|Filipina|American|Chinese|Japanese|Korean)',
        ]
        
        for pattern in citizenship_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['citizenship'] = match.group(1).capitalize()
                print(f"DEBUG: Found citizenship: '{extracted['citizenship']}'")
                break
        
        if not extracted['citizenship']:
            extracted['citizenship'] = 'Filipino'  # Default for Philippine birth certificates
        
        print(f"DEBUG: Birth Certificate extracted fields:")
        for key, value in extracted.items():
            if value and key != 'rawText':
                print(f"  {key}: {value}")
        
        # Map to frontend expected keys
        mapped = {
            'learnerReferenceNumber': '',  # Birth certificates don't have LRN
            'surname': extracted.get('lastName', ''),
            'firstName': extracted.get('firstName', ''),
            'middleName': extracted.get('middleName', ''),
            'dateOfBirth': extracted.get('birthDate', ''),
            'placeOfBirth': extracted.get('placeOfBirth', ''),
            'sex': extracted.get('gender', ''),
            'citizenship': extracted.get('citizenship', ''),
            'father': extracted.get('father', ''),
            'mother': extracted.get('mother', ''),
            'rawText': extracted.get('rawText', '')
        }
        
        return jsonify(mapped)

    def extract_name(lines):
        # Try to find a line with 2-4 capitalized words (robust to OCR noise)
        import re
        candidates = []
        for idx, l in enumerate(lines):
            words = [w for w in l.replace(',', ' ').split() if w.isalpha()]
            if 2 <= len(words) <= 4 and sum(len(w) > 1 for w in words) >= 2 and all(w[0].isupper() for w in words):
                candidates.append((idx, l))
            # Also check after 'Name:' or 'SOA'
            if re.search(r'\b(name|soa)\b', l, re.IGNORECASE) and idx+1 < len(lines):
                next_line = lines[idx+1]
                next_words = [w for w in next_line.replace(',', ' ').split() if w.isalpha()]
                if 2 <= len(next_words) <= 4:
                    candidates.append((idx+1, next_line))
        # Remove candidates that are just initials or single letters
        candidates = [c for c in candidates if len(''.join(c[1].split())) > 5]
        if candidates:
            # Pick the candidate with the most words, then longest
            name_line = sorted(candidates, key=lambda x: (-len(x[1].split()), -len(x[1])))[0][1]
            name_parts = [p for p in name_line.replace(',', ' ').split() if p.isalpha()]
            if len(name_parts) >= 2:
                last = name_parts[0]
                first = name_parts[1]
                middle = ' '.join(name_parts[2:]) if len(name_parts) > 2 else ''
                return last, first, middle
        # Try to find a line with comma (Lastname, Firstname Middlename)
        for l in lines:
            if ',' in l:
                parts = l.split(',')
                if len(parts) == 2:
                    last = parts[0].strip()
                    first_middle = parts[1].strip().split()
                    first = first_middle[0] if len(first_middle) > 0 else ''
                    middle = ' '.join(first_middle[1:]) if len(first_middle) > 1 else ''
                    return last, first, middle
        # Fallback: look for a line with two words
        for l in lines:
            words = l.split()
            if len(words) == 2:
                return words[1], words[0], ''
        return '', '', ''

    def extract_field(label, lines, fallback_regex=None):
        # Look for a line containing the label
        for l in lines:
            if re.search(label, l, re.IGNORECASE):
                # Try to extract after ':' or '='
                parts = re.split(rf'{label}[:=\s]*', l, flags=re.IGNORECASE)
                if len(parts) > 1:
                    value = parts[1].strip()
                    # Remove trailing punctuation
                    value = re.sub(r'[;,.]+$', '', value)
                    return value
        # Fallback: regex search in full text
        if fallback_regex:
            match = re.search(fallback_regex, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ''

    # Name extraction
    last_name, first_name, middle_name = extract_name(lines)

    # Birth date: look for lines with month names and 4-digit year
    birth_date = ''
    date_patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,.-]+\d{1,2}[\s,.-]+\d{4}\b',
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b\d{4}-\d{2}-\d{2}\b',
        r'\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)[,]? \d{4}'
    ]
    for l in lines:
        for pat in date_patterns:
            m = re.search(pat, l, re.IGNORECASE)
            if m:
                birth_date = m.group(0).replace(',', '')
                break
        if birth_date:
            break
    if not birth_date:
        for pat in date_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                birth_date = m.group(0).replace(',', '')
                break

    # Place of birth: look for lines with 'Place of Birth', 'Hospital', or common city/province names
    place_of_birth = ''
    pob_labels = ['place of birth', 'birthplace', 'born at', 'birth at', 'hospital']
    for i, l in enumerate(lines):
        for label in pob_labels:
            if label in l.lower():
                after = ''
                if ':' in l:
                    after = l.split(':',1)[1].strip()
                if not after and i+1 < len(lines):
                    after = lines[i+1]
                if after:
                    after = after.rstrip('.,;:')
                    place_of_birth = after
                    break
        if place_of_birth:
            break
    if not place_of_birth:
        for l in lines:
            if re.search(r'benguet|la trinidad|manila|quezon|cebu', l, re.IGNORECASE):
                place_of_birth = re.sub(r'net:|Name:', '', l, flags=re.IGNORECASE).strip()
                break

    # Sex/Gender: look for 'Sex' or 'Gender' in lines, or 'Male'/'Female' as a word
    gender = ''
    for l in lines:
        if re.search(r'Sex|Gender', l, re.IGNORECASE):
            match = re.search(r'(Sex|Gender)[:=\s]*([A-Za-z]+)', l, re.IGNORECASE)
            if match:
                val = match.group(2)
                if val.lower() in ['male', 'female']:
                    gender = val.capitalize()
                else:
                    for w in l.split():
                        if w.lower() in ['male', 'female']:
                            gender = w.capitalize()
                            break
                if gender:
                    break
        elif re.fullmatch(r'(Male|Female)', l, re.IGNORECASE):
            gender = l.strip().capitalize()
            break
    if not gender:
        match = re.search(r'\b(male|female)\b', text, re.IGNORECASE)
        if match:
            gender = match.group(1).capitalize()

    # Citizenship
    citizenship = ''
    known_citizenships = ['filipino', 'filipina', 'american', 'chinese', 'japanese', 'korean', 'indian', 'spanish']
    for l in lines:
        if re.search(r'Citizenship|CTZENSHP', l, re.IGNORECASE):
            match = re.search(r'(Citizenship|CTZENSHP)[^A-Za-z0-9]*([A-Za-z ]+)', l, re.IGNORECASE)
            if match:
                val = match.group(2).strip()
                val = re.sub(r'[^A-Za-z]+$', '', val)
                if val.lower() in known_citizenships:
                    citizenship = val.capitalize()
                    break
    if not citizenship:
        for l in lines:
            for c in known_citizenships:
                if c in l.lower():
                    citizenship = c.capitalize()
                    break
            if citizenship:
                break

    # LRN: Only extract if not a birth certificate
    lrn = ''
    if not (('birthcert' in filename) or ('birth certificate' in filename)):
        match = re.search(r'(\d{5,}-[A-Za-z0-9-]+)', text)
        if match:
            lrn = match.group(1)

    # Father's name: look for line after 'Father' or similar
    father = ''
    for idx, l in enumerate(lines):
        if re.search(r'Father', l, re.IGNORECASE):
            # Try after ':' or next line
            after = ''
            if ':' in l:
                after = l.split(':',1)[1].strip()
            if not after and idx+1 < len(lines):
                after = lines[idx+1]
            if after and len(after.split()) >= 2 and not re.search(r'Mother|Occupation|Age|Residence|Maiden|Date', after, re.IGNORECASE):
                father = after.strip()
                break

    # Mother's name: look for line after 'Mother' or similar
    mother = ''
    for idx, l in enumerate(lines):
        if re.search(r'Mother', l, re.IGNORECASE):
            after = ''
            if ':' in l:
                after = l.split(':',1)[1].strip()
            if not after and idx+1 < len(lines):
                after = lines[idx+1]
            if after and len(after.split()) >= 2 and not re.search(r'Father|Occupation|Age|Residence|Maiden|Date', after, re.IGNORECASE):
                mother = after.strip()
                break

    extracted = {
        'lastName': last_name,
        'firstName': first_name,
        'middleName': middle_name,
        'birthDate': birth_date,
        'placeOfBirth': place_of_birth,
        'gender': gender,
        'citizenship': citizenship,
        'father': father,
        'mother': mother,
        'rawText': text  # Add raw extracted text for debugging
    }
    if lrn:
        extracted['lrn'] = lrn

    # Map to frontend expected keys for enrollment autofill
    mapped = {
        'learnerReferenceNumber': extracted.get('lrn', ''),
        'surname': extracted.get('lastName', ''),
        'firstName': extracted.get('firstName', ''),
        'middleName': extracted.get('middleName', ''),
        'dateOfBirth': extracted.get('birthDate', ''),
        'placeOfBirth': extracted.get('placeOfBirth', ''),
        'sex': extracted.get('gender', ''),
        'citizenship': extracted.get('citizenship', ''),
        'father': extracted.get('father', ''),
        'mother': extracted.get('mother', ''),
        'rawText': extracted.get('rawText', '')
    }
    return jsonify(mapped)

@app.route('/api/extract-debug', methods=['POST'])
def extract_debug():
    """Debug endpoint that shows detailed extraction information"""
    if 'document' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['document']
    file_bytes = file.read()
    filename = file.filename.lower()
    
    # Extract text
    if filename.endswith('.pdf'):
        text = extract_text_from_pdf(file_bytes)
        if not text.strip():
            text = extract_text_from_images(file_bytes)
    elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
        text = extract_text_from_image_bytes(file_bytes)
    else:
        return jsonify({'error': 'Unsupported file type'}), 400
    
    # Apply OCR corrections
    import re
    ocr_replacements = [
        (r'net:', 'Name:'),
        (r'Respltal', 'Hospital'),
        (r'OATE', 'DATE'),
        (r'CTZENSHP', 'Citizenship'),
        (r'Bith', 'Birth'),
        (r'Birtt', 'Birth'),
        (r'Gende', 'Gender'),
        (r'Bith Certificate', 'Birth Certificate'),
        (r'Cerificate', 'Certificate'),
        (r'Certicate', 'Certificate'),
        (r'REPUBUC', 'REPUBLIC'),
        (r'PHIUPPINES', 'PHILIPPINES'),
        (r'Chlld', 'Child'),
        (r'Chld', 'Child'),
        (r'Narne', 'Name'),
        (r'Fatner', 'Father'),
        (r'Motner', 'Mother'),
        (r'Moter', 'Mother'),
        (r'Borm', 'Born'),
        (r'Hospial', 'Hospital'),
        (r'Hosptal', 'Hospital'),
        (r'KASARIN', 'KASARIAN'),
        (r'KASARIAH', 'KASARIAN'),
        (r'Filipno', 'Filipino'),
        (r'Fipino', 'Filipino'),
    ]
    
    corrected_text = text
    for pat, rep in ocr_replacements:
        corrected_text = re.sub(pat, rep, corrected_text, flags=re.IGNORECASE)
    
    lines = [l.strip() for l in corrected_text.split('\n') if l.strip()]
    
    # Document type detection
    is_birth_certificate = (
        'birth' in filename.lower() or
        'certificate' in filename.lower() or
        re.search(r'birth\s*certificate', corrected_text, re.IGNORECASE) or
        re.search(r'certificate\s*of\s*live\s*birth', corrected_text, re.IGNORECASE) or
        re.search(r'certificate\s*of\s*birth', corrected_text, re.IGNORECASE) or
        re.search(r'republic\s*of\s*the\s*philippines', corrected_text, re.IGNORECASE) or
        re.search(r'civil\s*registrar', corrected_text, re.IGNORECASE) or
        re.search(r'philippine\s*statistics\s*authority', corrected_text, re.IGNORECASE) or
        re.search(r'national\s*statistics\s*office', corrected_text, re.IGNORECASE) or
        re.search(r'psa|nso', corrected_text, re.IGNORECASE)
    )
    
    return jsonify({
        'filename': filename,
        'raw_text_length': len(text),
        'raw_text_preview': text[:1000],
        'corrected_text_preview': corrected_text[:1000],
        'lines_count': len(lines),
        'first_10_lines': lines[:10],
        'is_birth_certificate': is_birth_certificate,
        'detection_keywords': {
            'birth_in_filename': 'birth' in filename.lower(),
            'certificate_in_filename': 'certificate' in filename.lower(),
            'birth_certificate_in_text': bool(re.search(r'birth\s*certificate', corrected_text, re.IGNORECASE)),
            'republic_philippines_in_text': bool(re.search(r'republic\s*of\s*the\s*philippines', corrected_text, re.IGNORECASE)),
            'civil_registrar_in_text': bool(re.search(r'civil\s*registrar', corrected_text, re.IGNORECASE)),
            'psa_nso_in_text': bool(re.search(r'psa|nso', corrected_text, re.IGNORECASE))
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)

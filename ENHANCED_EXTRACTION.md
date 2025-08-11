# Enhanced Image Extraction Features

## Overview
The document extraction API has been significantly enhanced to better handle birth certificates and blurry/low-quality images.

## New Features

### 1. Advanced Image Preprocessing
- **Multiple OCR approaches**: The system now tries 4 different preprocessing techniques:
  - Enhanced preprocessing for clear documents
  - OpenCV-based preprocessing for noisy/blurry images  
  - Aggressive preprocessing for very blurry images
  - Different rotations and image modes

- **Improved noise reduction**: 
  - Gaussian blur filtering
  - Fast non-local means denoising
  - Morphological operations
  - Multiple adaptive thresholding techniques

- **Better image enhancement**:
  - Extreme upscaling for small images (up to 2000px width)
  - Enhanced contrast (up to 4x)
  - Multiple sharpening passes
  - Unsharp mask filtering

### 2. Birth Certificate Support
- **Automatic detection**: Recognizes birth certificates from filename or content
- **Specialized field extraction**: 
  - Enhanced name parsing (handles "LAST, FIRST MIDDLE" format)
  - Birth date extraction with multiple patterns
  - Place of birth detection
  - Parent name extraction with validation
  - Gender detection (multiple language support)
  - Citizenship detection with Filipino default

### 3. Enhanced OCR Error Correction
- **Birth certificate specific fixes**:
  - "Bith Certificate" → "Birth Certificate"
  - "REPUBUC" → "REPUBLIC" 
  - "PHIUPPINES" → "PHILIPPINES"
  - "Fatner" → "Father"
  - "Motner" → "Mother"
  - And many more common OCR errors

### 4. Multiple OCR Configurations
- **PSM modes**: Tries different page segmentation modes (6, 3, 8, 13)
- **Character whitelisting**: Filters to relevant characters for better accuracy
- **Best result selection**: Returns the longest/most complete extracted text

## Usage

The API endpoint remains the same: `POST /api/extract-pdf`

### Supported Document Types
1. **Form 137** - Student records
2. **Form 138** - Report cards  
3. **Good Moral Certificate**
4. **Birth Certificate** (NEW)
5. **General documents** - Fallback extraction

### Image Formats Supported
- PDF (with OCR fallback for scanned documents)
- PNG, JPG, JPEG, BMP, TIFF

### Quality Improvements
- Works with images as small as 200x200 pixels (upscaled automatically)
- Handles blur, noise, and skewed images
- Better extraction from phone camera photos
- Improved handling of documents with watermarks or stamps

## Testing

Run the test script to verify functionality:
```bash
python test_enhanced_extraction.py
```

This will test both clear and blurry birth certificate extraction.

## Dependencies
- OpenCV (`opencv-python`) - For advanced image preprocessing
- NumPy - For array operations
- PIL/Pillow - For basic image processing
- Tesseract - For OCR (requires system installation)

## Performance Notes
- Multiple preprocessing approaches mean longer processing time for difficult images
- Clear, high-quality images will still process quickly using the first approach
- The system automatically selects the best result from all attempts

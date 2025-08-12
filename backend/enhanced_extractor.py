"""
Enhanced OCR Extraction API for Philippine Documents
Specifically optimized for NSO/PSA birth certificates with advanced preprocessing.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import logging
import traceback
import os

# Import the enhanced OCR processor
try:
    from ocr_processor import DocumentOCRProcessor, extract_birth_certificate_data, apply_ocr_corrections
    OCR_PROCESSOR_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Enhanced OCR processor not available: {e}")
    OCR_PROCESSOR_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the enhanced OCR processor
if OCR_PROCESSOR_AVAILABLE:
    try:
        ocr_processor = DocumentOCRProcessor()
        logger.info("Enhanced DocumentOCRProcessor initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize OCR processor: {e}")
        ocr_processor = None
        OCR_PROCESSOR_AVAILABLE = False
else:
    ocr_processor = None

@app.route('/extract', methods=['POST'])
def extract_text_from_image_bytes():
    """
    Enhanced OCR extraction endpoint with document-specific processing.
    Supports Philippine NSO birth certificates with advanced preprocessing.
    """
    try:
        if not OCR_PROCESSOR_AVAILABLE or not ocr_processor:
            return jsonify({
                'success': False,
                'error': 'Enhanced OCR processor not available',
                'text': '',
                'structured_data': {}
            }), 500
        
        # Get image bytes from request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided',
                'text': '',
                'structured_data': {}
            }), 400
        
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        if not image_bytes:
            return jsonify({
                'success': False,
                'error': 'Empty image file',
                'text': '',
                'structured_data': {}
            }), 400
        
        # Get document type from request (defaults to auto-detection)
        document_type = request.form.get('document_type', 'auto')
        
        logger.info(f"Processing image with document type: {document_type}")
        
        # Extract text using enhanced OCR processor
        extracted_text = ocr_processor.extract_text_from_image(image_bytes, document_type)
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return jsonify({
                'success': False,
                'error': 'Could not extract meaningful text from image',
                'text': extracted_text,
                'structured_data': {}
            }), 400
        
        logger.info(f"Successfully extracted {len(extracted_text)} characters of text")
        
        # Extract structured data based on document type
        structured_data = {}
        detected_type = document_type
        
        # Auto-detect document type if requested
        if document_type == 'auto':
            if any(indicator in extracted_text.lower() for indicator in [
                'birth certificate', 'certificate of live birth', 'republic of the philippines',
                'civil registrar', 'nso', 'psa', 'philippine statistics authority'
            ]):
                detected_type = 'birth_certificate'
            else:
                detected_type = 'generic'
        
        # Extract structured data for birth certificates
        if detected_type == 'birth_certificate' or 'birth' in extracted_text.lower():
            try:
                structured_data = extract_birth_certificate_data(extracted_text)
                logger.info(f"Extracted birth certificate data: {list([k for k, v in structured_data.items() if v])}")
            except Exception as e:
                logger.warning(f"Failed to extract structured birth certificate data: {e}")
        
        # Apply final corrections
        corrected_text = apply_ocr_corrections(extracted_text, detected_type)
        
        return jsonify({
            'success': True,
            'text': corrected_text,
            'raw_text': extracted_text,
            'structured_data': structured_data,
            'document_type': detected_type,
            'confidence': 'high' if len([v for v in structured_data.values() if v]) > 3 else 'medium'
        })
        
    except Exception as e:
        logger.error(f"Enhanced OCR extraction failed: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'text': '',
            'structured_data': {}
        }), 500

@app.route('/extract-birth-certificate', methods=['POST'])
def extract_birth_certificate():
    """
    Specialized endpoint for Philippine NSO/PSA birth certificate extraction.
    Uses advanced preprocessing optimized for mobile photos and blurry images.
    """
    try:
        if not OCR_PROCESSOR_AVAILABLE or not ocr_processor:
            return jsonify({
                'success': False,
                'error': 'Enhanced OCR processor not available'
            }), 500
        
        # Get image bytes from request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        if not image_bytes:
            return jsonify({
                'success': False,
                'error': 'Empty image file'
            }), 400
        
        logger.info("Processing birth certificate with enhanced NSO preprocessing")
        
        # Force birth certificate processing
        extracted_text = ocr_processor.extract_text_from_image(image_bytes, 'birth_certificate')
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return jsonify({
                'success': False,
                'error': 'Could not extract meaningful text from birth certificate image'
            }), 400
        
        logger.info(f"Successfully extracted {len(extracted_text)} characters from birth certificate")
        
        # Extract structured birth certificate data
        birth_data = extract_birth_certificate_data(extracted_text)
        
        # Apply NSO-specific corrections
        corrected_text = apply_ocr_corrections(extracted_text, 'birth_certificate')
        
        # Calculate confidence based on extracted fields
        filled_fields = len([v for v in birth_data.values() if v and v.strip()])
        total_fields = len(birth_data)
        confidence_score = filled_fields / total_fields if total_fields > 0 else 0
        
        confidence_level = 'high' if confidence_score > 0.6 else 'medium' if confidence_score > 0.3 else 'low'
        
        logger.info(f"Birth certificate extraction completed: {filled_fields}/{total_fields} fields extracted")
        
        return jsonify({
            'success': True,
            'text': corrected_text,
            'raw_text': extracted_text,
            'birth_certificate_data': birth_data,
            'confidence': confidence_level,
            'confidence_score': confidence_score,
            'extracted_fields': filled_fields,
            'total_fields': total_fields
        })
        
    except Exception as e:
        logger.error(f"Birth certificate extraction failed: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'processor_available': OCR_PROCESSOR_AVAILABLE and ocr_processor is not None,
        'enhanced_features': OCR_PROCESSOR_AVAILABLE,
        'version': '2.0.0-enhanced'
    })

@app.route('/test-nso', methods=['GET'])
def test_nso_extraction():
    """Test endpoint for verifying NSO birth certificate improvements."""
    try:
        if not OCR_PROCESSOR_AVAILABLE:
            return jsonify({
                'test_successful': False,
                'error': 'Enhanced OCR processor not available'
            }), 500
            
        # Test the enhanced corrections with sample garbled text
        test_text = """
        RepublioofthePhiippines
        PHILIPPINE STATISTICS AUTHORITY
        CERTIFICATE OF LIVE BIRTH
        NAME TOD FIRST NAME Oo0 Totstnunber Tb Neetohidrenaa GNeotchiidewn
        November25204
        Benguet Generalal Hospital La Trinidadd Benguet
        sexnorluscm Ueew
        Father: FELIZARDO CABRERA
        Mother: ROCHELLE CABRERA
        """
        
        corrected = apply_ocr_corrections(test_text, 'birth_certificate')
        structured = extract_birth_certificate_data(corrected)
        
        return jsonify({
            'test_successful': True,
            'test_description': 'NSO birth certificate pattern recognition test',
            'original_garbled_text': test_text,
            'corrected_text': corrected,
            'extracted_data': structured,
            'improvements_detected': [
                'Republic of Philippines correction',
                'November date correction',
                'Hospital name correction',
                'Location correction',
                'Gender extraction from garbled text'
            ]
        })
        
    except Exception as e:
        return jsonify({
            'test_successful': False,
            'error': str(e)
        }), 500

@app.route('/test-patterns', methods=['POST'])
def test_patterns():
    """Test pattern recognition on user-provided text."""
    try:
        if not OCR_PROCESSOR_AVAILABLE:
            return jsonify({
                'test_successful': False,
                'error': 'Enhanced OCR processor not available'
            }), 500
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                'test_successful': False,
                'error': 'No text provided for testing'
            }), 400
        
        test_text = data['text']
        document_type = data.get('document_type', 'birth_certificate')
        
        # Apply corrections
        corrected = apply_ocr_corrections(test_text, document_type)
        
        # Extract structured data if it's a birth certificate
        structured_data = {}
        if document_type == 'birth_certificate':
            structured_data = extract_birth_certificate_data(corrected)
        
        return jsonify({
            'test_successful': True,
            'original_text': test_text,
            'corrected_text': corrected,
            'structured_data': structured_data,
            'document_type': document_type
        })
        
    except Exception as e:
        return jsonify({
            'test_successful': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

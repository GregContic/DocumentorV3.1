from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from backend.ocr_processor import process_document
except ImportError:
    process_document = None

app = Flask(__name__)
CORS(app)

def handler(event, context):
    """Vercel serverless function handler"""
    if not process_document:
        return {
            'statusCode': 500,
            'body': jsonify({'error': 'OCR processor not available'})
        }
    
    try:
        if request.method == 'POST':
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            result = process_document(file)
            
            return jsonify({
                'success': True,
                'data': result
            }), 200
        else:
            return jsonify({'error': 'Method not allowed'}), 405
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# For Vercel
app = app

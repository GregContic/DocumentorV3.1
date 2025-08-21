const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Pickup Stub Generation Service
 * Generates PDF pickup stubs with QR codes for approved Form 137 requests
 */

class PickupStubService {
  constructor() {
    this.stubsDirectory = path.join(__dirname, '../uploads/pickup-stubs');
    this.ensureDirectoryExists();
  }

  /**
   * Ensure the pickup stubs directory exists
   */
  ensureDirectoryExists() {
    if (!fs.existsSync(this.stubsDirectory)) {
      fs.mkdirSync(this.stubsDirectory, { recursive: true });
    }
  }

  /**
   * Generate QR code for pickup verification
   * @param {Object} requestData - The document request data
   * @returns {Promise<string>} - Base64 encoded QR code
   */
  async generateQRCode(requestData) {
    try {
      const qrData = {
        requestId: requestData._id,
        studentName: `${requestData.firstName || requestData.givenName} ${requestData.surname}`,
        documentType: requestData.documentType,
        pickupDateTime: requestData.pickupSchedule?.scheduledDateTime,
        timeSlot: requestData.pickupSchedule?.timeSlot,
        verificationCode: this.generateVerificationCode(requestData._id)
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate verification code for the request
   * @param {string} requestId - The request ID
   * @returns {string} - Verification code
   */
  generateVerificationCode(requestId) {
    const timestamp = Date.now().toString();
    const idString = requestId.toString(); // Convert to string in case it's an ObjectId
    const idHash = idString.substring(idString.length - 6);
    return `${idHash}-${timestamp.substring(timestamp.length - 4)}`;
  }

  /**
   * Generate PDF pickup stub
   * @param {Object} requestData - The document request data
   * @param {string} qrCodeDataURL - Base64 encoded QR code
   * @param {string} verificationCode - Verification code for the request
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generatePickupStubPDF(requestData, qrCodeDataURL, verificationCode) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(20).fillColor('#2563eb').text('EASTERN LA TRINIDAD NATIONAL HIGH SCHOOL', { align: 'center' });
        doc.fontSize(14).fillColor('#64748b').text('Document Pickup Stub', { align: 'center' });
        doc.moveDown(1);

        // Add a line separator
        doc.strokeColor('#e2e8f0').lineWidth(1)
           .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // Request Information Section
        doc.fontSize(16).fillColor('#1e293b').text('Pickup Information', { underline: true });
        doc.moveDown(0.5);
        
        const leftCol = 50;
        const rightCol = 300;
        const currentY = doc.y;
        
        // Left column
        doc.fontSize(12).fillColor('#374151');
        doc.text(`Request ID: #${requestData._id.toString().slice(-6)}`, leftCol, currentY);
        doc.text(`Student Name: ${requestData.studentName || 'N/A'}`, leftCol, currentY + 20);
        doc.text(`Document Type: ${requestData.documentType || 'N/A'}`, leftCol, currentY + 40);
        doc.text(`Purpose: ${requestData.purpose || 'N/A'}`, leftCol, currentY + 60);
        
        // Right column
        if (requestData.pickupSchedule) {
          const scheduledDate = requestData.pickupSchedule.scheduledDateTime 
            ? new Date(requestData.pickupSchedule.scheduledDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })
            : 'Not specified';
          const timeSlot = requestData.pickupSchedule.timeSlot || 'Not specified';
          
          doc.text(`Pickup Date: ${scheduledDate}`, rightCol, currentY);
          doc.text(`Time Slot: ${timeSlot}`, rightCol, currentY + 20);
          doc.text(`Status: Approved - Ready for Pickup`, rightCol, currentY + 40);
        }
        
        doc.y = currentY + 100;
        
        // QR Code Section
        doc.fontSize(16).fillColor('#1e293b').text('Verification', { underline: true });
        doc.moveDown(0.5);
        
        // Convert base64 QR code to buffer and add to PDF
        const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        const qrSize = 120;
        doc.image(qrCodeBuffer, leftCol, doc.y, { width: qrSize, height: qrSize });
        
        // Verification code next to QR
        doc.fontSize(12).fillColor('#374151')
           .text('Verification Code:', leftCol + qrSize + 20, doc.y + 10)
           .fontSize(16).fillColor('#dc2626').font('Helvetica-Bold')
           .text(verificationCode, leftCol + qrSize + 20, doc.y + 5)
           .font('Helvetica');
        
        doc.y += qrSize + 20;
        
        // Instructions Section
        doc.fontSize(16).fillColor('#1e293b').text('Pickup Instructions', { underline: true });
        doc.moveDown(0.5);
        
        const instructions = [
          '• Present this pickup stub and a valid ID to the registrar\'s office',
          '• Arrive during your scheduled time slot to avoid delays',
          '• If someone else is picking up for you, they must bring:',
          '  - This pickup stub',
          '  - Your authorization letter',
          '  - Their valid ID and your ID (photocopy)',
          '• The QR code will be scanned for verification',
          '• Keep this stub until you receive your document'
        ];
        
        doc.fontSize(11).fillColor('#374151');
        instructions.forEach(instruction => {
          doc.text(instruction, { indent: 10 });
          doc.moveDown(0.3);
        });
        
        // Footer
        doc.moveDown(1);
        doc.strokeColor('#e2e8f0').lineWidth(1)
           .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        
        doc.fontSize(10).fillColor('#64748b')
           .text('Generated on: ' + new Date().toLocaleString(), leftCol)
           .text('Eastern Leyte National High School - Registrar\'s Office', rightCol, doc.y - 12);
        
        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }
  generatePickupStubHTML(requestData, qrCodeDataURL) {
    const formatDate = (date) => {
      if (!date) return 'Not specified';
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (date) => {
      if (!date) return 'Not specified';
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Document Pickup Stub - ${requestData.surname}, ${requestData.firstName || requestData.givenName}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .stub-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 30px;
            }
            .info-section {
                margin-bottom: 25px;
            }
            .info-section h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 18px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 5px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }
            .info-item {
                background: #f8f9ff;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            .info-item label {
                font-weight: 600;
                color: #555;
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
            }
            .info-item span {
                color: #333;
                font-size: 16px;
            }
            .qr-section {
                text-align: center;
                background: #f8f9ff;
                padding: 25px;
                border-radius: 12px;
                border: 2px dashed #667eea;
                margin: 25px 0;
            }
            .qr-code {
                margin: 15px 0;
            }
            .verification-code {
                background: #667eea;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                letter-spacing: 2px;
                margin-top: 15px;
                display: inline-block;
            }
            .instructions {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin-top: 25px;
            }
            .instructions h4 {
                color: #856404;
                margin: 0 0 15px 0;
                font-size: 16px;
            }
            .instructions ul {
                margin: 0;
                padding-left: 20px;
                color: #856404;
            }
            .instructions li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
            @media print {
                body { background: white; }
                .stub-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="stub-container">
            <div class="header">
                <h1>📄 Document Pickup Stub</h1>
                <p>Form 137 / SF10 Transfer Record</p>
            </div>
            
            <div class="content">
                <div class="info-section">
                    <h3>👤 Student Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Full Name:</label>
                            <span>${requestData.surname}, ${requestData.firstName || requestData.givenName} ${requestData.middleName || ''}</span>
                        </div>
                        <div class="info-item">
                            <label>LRN:</label>
                            <span>${requestData.learnerReferenceNumber || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Last Grade Level:</label>
                            <span>${requestData.lastGradeLevel || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Request ID:</label>
                            <span>${requestData._id}</span>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h3>📅 Pickup Schedule</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Pickup Date:</label>
                            <span>${formatDate(requestData.pickupSchedule?.scheduledDateTime)}</span>
                        </div>
                        <div class="info-item">
                            <label>Pickup Time:</label>
                            <span>${requestData.pickupSchedule?.timeSlot || formatTime(requestData.pickupSchedule?.scheduledDateTime)}</span>
                        </div>
                        <div class="info-item">
                            <label>Status:</label>
                            <span style="color: #28a745; font-weight: bold;">✅ APPROVED</span>
                        </div>
                        <div class="info-item">
                            <label>Request Date:</label>
                            <span>${formatDate(requestData.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <div class="qr-section">
                    <h3 style="margin-top: 0; color: #667eea;">🔍 Pickup Verification</h3>
                    <p style="margin: 0 0 15px 0; color: #666;">Present this QR code to the admin for verification</p>
                    <div class="qr-code">
                        <img src="${qrCodeDataURL}" alt="QR Code" style="width: 180px; height: 180px;">
                    </div>
                    <div class="verification-code">${this.generateVerificationCode(requestData._id)}</div>
                </div>

                <div class="instructions">
                    <h4>📋 Pickup Instructions</h4>
                    <ul>
                        <li><strong>Bring this printed stub</strong> with the QR code to the registrar's office</li>
                        <li><strong>Arrive during your scheduled time slot</strong> to avoid delays</li>
                        <li><strong>Bring valid ID</strong> (School ID or Government-issued ID)</li>
                        <li><strong>Authorization letter required</strong> if someone else will pick up the document</li>
                        <li><strong>Contact the office</strong> if you need to reschedule your pickup time</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <p>Document Management System • Keep this stub until document pickup is complete</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate pickup stub PDF for an approved request
   * @param {Object} requestData - The document request data
   * @returns {Promise<Object>} - Stub generation result
   */
  async generatePickupStub(requestData) {
    try {
      console.log('Generating pickup stub for request:', requestData._id);

      // Generate QR code
      const qrCodeDataURL = await this.generateQRCode(requestData);
      
      // Generate verification code
      const verificationCode = this.generateVerificationCode(requestData._id);
      
      // Generate PDF content
      const pdfBuffer = await this.generatePickupStubPDF(requestData, qrCodeDataURL, verificationCode);
      
      // Generate filename
      const timestamp = Date.now();
      const studentName = requestData.studentName 
        ? requestData.studentName.replace(/[^a-zA-Z0-9]/g, '_')
        : `${requestData.surname || 'student'}_${requestData.firstName || requestData.givenName || ''}`.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `pickup_stub_${studentName}_${timestamp}.pdf`;
      const filePath = path.join(this.stubsDirectory, filename);
      
      // Save PDF file
      fs.writeFileSync(filePath, pdfBuffer);
      
      console.log('Pickup stub PDF generated successfully:', filename);
      
      return {
        success: true,
        stubPath: filePath,
        filename: filename,
        qrCode: qrCodeDataURL,
        verificationCode: verificationCode,
        message: 'Pickup stub PDF generated successfully'
      };
      
    } catch (error) {
      console.error('Error generating pickup stub:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate pickup stub'
      };
    }
  }

  /**
   * Verify QR code data for pickup
   * @param {string} qrData - QR code data
   * @returns {Object} - Verification result
   */
  async verifyQRCode(qrData) {
    try {
      console.log('Verifying QR data:', qrData);
      
      // Try to parse QR data as JSON
      let data;
      try {
        data = JSON.parse(qrData);
      } catch (parseError) {
        console.log('QR data is not JSON, treating as verification code:', qrData);
        // If not JSON, treat as verification code
        return {
          valid: false,
          message: 'QR code format not recognized'
        };
      }
      
      // Validate required fields
      if (!data.requestId || !data.verificationCode) {
        return {
          valid: false,
          message: 'Invalid QR code: missing required fields'
        };
      }
      
      // Additional validation for timestamp
      if (data.timestamp) {
        const qrTimestamp = new Date(data.timestamp);
        const currentTime = new Date();
        const daysDiff = (currentTime - qrTimestamp) / (1000 * 60 * 60 * 24);
        
        // QR code expires after 30 days for security
        if (daysDiff > 30) {
          return {
            valid: false,
            message: 'QR code has expired (older than 30 days)'
          };
        }
      }
      
      return {
        valid: true,
        requestId: data.requestId,
        verificationCode: data.verificationCode,
        timestamp: data.timestamp,
        message: 'QR code verified successfully'
      };
      
    } catch (error) {
      console.error('Error verifying QR code:', error);
      return {
        valid: false,
        message: 'Error verifying QR code'
      };
    }
  }

  /**
   * Get pickup stub path for a request
   * @param {string} requestId - The request ID
   * @returns {string|null} - File path or null if not found
   */
  getPickupStubPath(requestId) {
    try {
      const files = fs.readdirSync(this.stubsDirectory);
      const stubFile = files.find(file => file.includes(requestId));
      return stubFile ? path.join(this.stubsDirectory, stubFile) : null;
    } catch (error) {
      console.error('Error finding pickup stub:', error);
      return null;
    }
  }
}

module.exports = new PickupStubService();

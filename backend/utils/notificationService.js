const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async notifyStatusChange(user, request, oldStatus, newStatus) {
    const statusMessages = {
      'submitted': 'Your document request has been submitted and is awaiting review.',
      'pending': 'Your document request is pending review by our admin team.',
      'processing': 'Your document request is now being processed.',
      'approved': 'Great news! Your document request has been approved.',
      'rejected': 'Your document request has been rejected. Please check the details for more information.',
      'completed': 'Your document is ready! You can now download it or pick it up.',
      'ready-for-pickup': 'Your document is ready for pickup at the school office.'
    };

    const documentTypes = {
      'form137': 'Form 137 (Transfer Credentials)',
      'form138': 'Form 138 (Report Card)', 
      'goodMoral': 'Certificate of Good Moral Character',
      'diploma': 'Diploma',
      'transcript': 'Transcript of Records'
    };

    const subject = `Document Request Update - ${documentTypes[request.documentType]}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1>DocumentorV3 - Request Update</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2>Hello ${user.firstName} ${user.lastName},</h2>
          
          <p>Your document request status has been updated:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Request Details</h3>
            <p><strong>Document Type:</strong> ${documentTypes[request.documentType]}</p>
            <p><strong>Purpose:</strong> ${request.purpose}</p>
            <p><strong>Previous Status:</strong> <span style="color: #666;">${oldStatus}</span></p>
            <p><strong>New Status:</strong> <span style="color: #1976d2; font-weight: bold;">${newStatus}</span></p>
            ${request.estimatedCompletionDate ? `<p><strong>Expected Completion:</strong> ${new Date(request.estimatedCompletionDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>What's next?</strong></p>
            <p>${statusMessages[newStatus]}</p>
            ${request.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${request.rejectionReason}</p>` : ''}
            ${request.reviewNotes ? `<p><strong>Admin Notes:</strong> ${request.reviewNotes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/user/requests" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Request Details
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions, please contact our admin team or use the chatbot on our website.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from DocumentorV3. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async notifyProcessingStepUpdate(user, request, step) {
    const subject = `Processing Update - ${request.documentType}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1>Processing Update</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2>Hello ${user.firstName} ${user.lastName},</h2>
          
          <p>Your document request has reached a new processing milestone:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${step.step}</h3>
            <p><strong>Status:</strong> <span style="color: #4caf50;">${step.status}</span></p>
            ${step.notes ? `<p><strong>Notes:</strong> ${step.notes}</p>` : ''}
            <p><strong>Completed:</strong> ${new Date(step.completedAt).toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/user/requests" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Track Progress
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from DocumentorV3. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async notifyAdminNewRequest(request, user) {
    const subject = `New Document Request - ${request.documentType}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center;">
          <h1>New Document Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2>New Request Submitted</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Request Details</h3>
            <p><strong>Student:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
            <p><strong>Document Type:</strong> ${request.documentType}</p>
            <p><strong>Purpose:</strong> ${request.purpose}</p>
            <p><strong>Priority:</strong> ${request.priority}</p>
            <p><strong>Submitted:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
            ${request.estimatedCompletionDate ? `<p><strong>Est. Completion:</strong> ${new Date(request.estimatedCompletionDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/documents" 
               style="background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Review Request
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from DocumentorV3. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // Send to all admin users
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    
    const promises = adminEmails.map(email => 
      this.sendEmail(email.trim(), subject, html)
    );
    
    return Promise.all(promises);
  }

  async notifyOverdueRequests(overdueRequests) {
    if (overdueRequests.length === 0) return;

    const subject = `Overdue Document Requests - ${overdueRequests.length} request(s)`;
    
    const requestsList = overdueRequests.map(req => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${req.user.firstName} ${req.user.lastName}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${req.documentType}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${req.status}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(req.estimatedCompletionDate).toLocaleDateString()}</td>
      </tr>
    `).join('');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
          <h1>Overdue Document Requests</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2>Alert: ${overdueRequests.length} request(s) are overdue</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Student</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Document Type</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Status</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Due Date</th>
                </tr>
              </thead>
              <tbody>
                ${requestsList}
              </tbody>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/documents" 
               style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Review Overdue Requests
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from DocumentorV3. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    
    const promises = adminEmails.map(email => 
      this.sendEmail(email.trim(), subject, html)
    );
    
    return Promise.all(promises);
  }
}

module.exports = new NotificationService();

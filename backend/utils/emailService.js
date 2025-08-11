const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For development, use a test account or configure with real SMTP settings
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password',
    },
  });
};

// Email templates
const enrollmentApprovedTemplate = (enrollmentData) => {
  return {
    subject: 'Enrollment Approved - Eastern Laguna Technical NHS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1>Eastern Laguna Technical NHS</h1>
          <h2>Enrollment Approved</h2>
        </header>
        
        <main style="padding: 20px;">
          <p>Dear ${enrollmentData.firstName} ${enrollmentData.surname},</p>
          
          <p>Congratulations! Your enrollment application has been <strong>approved</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Enrollment Details:</h3>
            <p><strong>Student Name:</strong> ${enrollmentData.firstName} ${enrollmentData.middleName || ''} ${enrollmentData.surname}</p>
            <p><strong>LRN:</strong> ${enrollmentData.learnerReferenceNumber}</p>
            <p><strong>Grade Level:</strong> ${enrollmentData.gradeToEnroll}</p>
            <p><strong>Track:</strong> ${enrollmentData.track || 'N/A'}</p>
            <p><strong>Enrollment Number:</strong> ${enrollmentData.enrollmentNumber}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Log in to your student portal to download your enrollment confirmation</li>
            <li>Print the confirmation and bring it during enrollment day</li>
            <li>Prepare the original copies of your submitted documents</li>
            <li>Wait for further instructions regarding class schedules</li>
          </ol>
          
          <p>If you have any questions, please contact the school registrar.</p>
          
          <p>Welcome to Eastern Laguna Technical NHS!</p>
        </main>
        
        <footer style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666;">
          <p>Eastern Laguna Technical National High School</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </footer>
      </div>
    `
  };
};

const enrollmentRejectedTemplate = (enrollmentData, reason) => {
  return {
    subject: 'Enrollment Update - Eastern Laguna Technical NHS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
          <h1>Eastern Laguna Technical NHS</h1>
          <h2>Enrollment Update</h2>
        </header>
        
        <main style="padding: 20px;">
          <p>Dear ${enrollmentData.firstName} ${enrollmentData.surname},</p>
          
          <p>We regret to inform you that your enrollment application requires additional review.</p>
          
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3>Application Details:</h3>
            <p><strong>Student Name:</strong> ${enrollmentData.firstName} ${enrollmentData.middleName || ''} ${enrollmentData.surname}</p>
            <p><strong>LRN:</strong> ${enrollmentData.learnerReferenceNumber}</p>
            <p><strong>Grade Level:</strong> ${enrollmentData.gradeToEnroll}</p>
          </div>
          
          ${reason ? `
          <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Review Notes:</h3>
            <p>${reason}</p>
          </div>
          ` : ''}
          
          <p><strong>What to do next:</strong></p>
          <ol>
            <li>Review your submitted information and documents</li>
            <li>Contact the school registrar for clarification</li>
            <li>Submit any additional required documents</li>
            <li>Reapply if necessary</li>
          </ol>
          
          <p>Please contact the school registrar office for more information.</p>
        </main>
        
        <footer style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666;">
          <p>Eastern Laguna Technical National High School</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </footer>
      </div>
    `
  };
};

// Send enrollment status email
const sendEnrollmentStatusEmail = async (enrollmentData, status, reviewNotes = '') => {
  try {
    const transporter = createTransporter();
    
    let emailTemplate;
    if (status === 'approved') {
      emailTemplate = enrollmentApprovedTemplate(enrollmentData);
    } else if (status === 'rejected') {
      emailTemplate = enrollmentRejectedTemplate(enrollmentData, reviewNotes);
    } else {
      throw new Error('Invalid status for email notification');
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@eltechnical.edu.ph',
      to: enrollmentData.emailAddress,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendEnrollmentStatusEmail,
  testEmailConfiguration,
};

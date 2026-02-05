const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Check if environment variables exist
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const sendGridKey = process.env.SENDGRID_API_KEY;

// Initialize SendGrid if API key is available
if (sendGridKey) {
  sgMail.setApiKey(sendGridKey);
  console.log('✅ SendGrid initialized for production email delivery');
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found - will use Gmail SMTP fallback');
}

if (!emailUser || !emailPass) {
  console.error('❌ EMAIL_USER or EMAIL_PASS not found in .env file!');
  console.error('Please add EMAIL_USER and EMAIL_PASS to your .env file');
}

// Create transporter for Gmail SMTP fallback (local development)
console.log('📬 Email Service: Initializing Gmail SMTP fallback...');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser ? emailUser.trim() : '',
    pass: emailPass ? emailPass.trim() : ''
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true,
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 90000
});

// Verify connection configuration (non-blocking)
if (!sendGridKey) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Gmail SMTP Verification Failed:', error.message);
      if (process.env.RENDER) {
        console.warn('💡 RENDER ALERT: Render Free Tier blocks SMTP ports.');
        console.warn('👉 Add SENDGRID_API_KEY to environment variables for email delivery.');
      }
    } else {
      console.log('✅ Gmail SMTP is ready and verified');
    }
  });
}

// Cache for faster reuse
const emailCache = new Map();
const templateCache = new Map();

class EmailService {
  constructor() {
    this.templates = {
      otp: this.getOtpTemplate(),
      complaintUpdate: this.getComplaintUpdateTemplate(),
      adminNotification: this.getAdminNotificationTemplate(),
      welcome: this.getWelcomeTemplate(),
      statusUpdate: this.getStatusUpdateTemplate(),
      aiAnalysis: this.getAiAnalysisTemplate()
    };

    this.aiPersonalization = {
      greetingVariants: [
        'Hello',
        'Hi there',
        'Greetings',
        'Namaste',
        'Good day',
        'Hey',
        'Dear'
      ],
      closingVariants: [
        'Best regards',
        'Thank you',
        'Warm regards',
        'Have a great day',
        'Stay safe',
        'Looking forward',
        'Best wishes'
      ]
    };
  }

  getOtpTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins  :wght@300;400;600&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            animation: slideIn 0.6s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 10px;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.3);
          }
          .otp-box {
            background: #f8f9fa;
            border: 3px dashed #4facfe;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 30px 20px;
            position: relative;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            letter-spacing: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .info {
            text-align: center;
            padding: 0 20px 30px;
            color: #666;
          }
          .footer {
            background: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #888;
            font-size: 12px;
          }
          .security-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px;
            color: #856404;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://urbanos-backend.onrender.com/uploads/logo.png" alt="Smart City Logo" class="logo" onerror="this.style.display='none'">
            <h2 style="margin:0; font-size: 24px;">Smart City Verification</h2>
            <p style="margin: 5px 0 0; opacity: 0.9;">Secure Login Service</p>
          </div>
          <div class="otp-box">
            <div class="otp-code">{{OTP}}</div>
          </div>
          <div class="info">
            <p><strong>This OTP is valid for 5 minutes only</strong></p>
            <p>Do not share this OTP with anyone for security reasons</p>
          </div>
          <div class="security-note">
            🔒 This OTP was sent securely. Keep it confidential.
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getComplaintUpdateTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Update</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter  :wght@300;400;600&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
          }
          .content {
            padding: 30px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
          }
          .status-pending { background: #ff9800; color: white; }
          .status-working { background: #2196f3; color: white; }
          .status-solved { background: #4caf50; color: white; }
          .status-fake { background: #f44336; color: white; }
          .admin-message {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Complaint Update</h1>
            <p>Urban Complaint System</p>
          </div>
          <div class="content">
            <h2>Hello {{USERNAME}},</h2>
            <p>Your complaint "<strong>{{TITLE}}</strong>" has been updated!</p>
            
            <div style="margin: 20px 0;">
              <span class="status-badge status-{{STATUS}}">{{STATUS}}</span>
            </div>

            <div class="admin-message">
              <strong>Admin Message:</strong><br>
              {{ADMIN_MESSAGE}}
            </div>

            <p><strong>Complaint Details:</strong><br>
            Title: {{TITLE}}<br>
            Category: {{CATEGORY}}<br>
            Status: {{STATUS}}<br>
            Updated: {{TIMESTAMP}}</p>

            <p>You can track your complaint status in the app anytime.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAdminNotificationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Complaint - Admin</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto  :wght@300;400;700&display=swap');
          body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
          }
          .content {
            padding: 30px;
          }
          .urgent-badge {
            background: #e74c3c;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Complaint Alert</h1>
            <p>Admin Dashboard Notification</p>
          </div>
          <div class="content">
            <h2>Admin {{ADMIN_NAME}},</h2>
            <p>A new complaint has been submitted that requires your attention!</p>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>📍 Complaint Details:</strong><br>
              Title: {{TITLE}}<br>
              Description: {{DESCRIPTION}}<br>
              Category: {{CATEGORY}}<br>
              Priority: {{PRIORITY}}<br>
              Location: {{LATITUDE}}, {{LONGITUDE}}<br>
              Submitted by: {{USERNAME}}<br>
              Contact: {{CONTACT}}<br>
              Time: {{TIMESTAMP}}
            </div>

            <p>Please review and take appropriate action in the admin panel.</p>
            
            {{#if IS_URGENT}}
            <div class="urgent-badge">URGENT</div>
            {{/if}}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAiAnalysisTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Analysis Complete</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk  :wght@300;400;700&display=swap');
          body {
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.25);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
            position: relative;
          }
          .ai-icon {
            font-size: 60px;
            margin-bottom: 20px;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .content {
            padding: 40px;
          }
          .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 15px 0;
            text-align: center;
          }
          .confidence-meter {
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            margin: 15px 0;
            overflow: hidden;
          }
          .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
            width: {{CONFIDENCE_PERCENT}};
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://urbanos-backend.onrender.com/uploads/logo.png" alt="Smart City Logo" class="logo" onerror="this.style.display='none'">
            <div class="ai-icon">🤖</div>
            <h1 style="margin:10px 0;">AI Analysis Complete</h1>
            <p>Smart Complaint Classification</p>
          </div>
          <div class="content">
            <h2>Hello {{USERNAME}},</h2>
            <p>Our AI system has analyzed your complaint and provided the following insights:</p>

            <div class="metric-card">
              <h3>🎯 Category: {{CATEGORY}}</h3>
              <p>Assigned to {{ASSIGNED_DEPARTMENT}}</p>
            </div>

            <div class="metric-card">
              <h3>📊 Confidence: {{CONFIDENCE}}%</h3>
              <div class="confidence-meter">
                <div class="confidence-fill"></div>
              </div>
              <p>AI Confidence Level</p>
            </div>

            <div class="metric-card">
              <h3>⚡ Priority: {{PRIORITY}}</h3>
              <p>Estimated Response Time: {{RESPONSE_TIME}}</p>
            </div>

            <p>Your complaint has been routed to the appropriate department. You'll receive updates as it progresses.</p>
            
            <p>Powered by Advanced AI Technology 🚀</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Urban Complaint System</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Nunito  :wght@300;400;700&display=swap');
          body {
            font-family: 'Nunito', sans-serif;
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
          }
          .feature {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://urbanos-backend.onrender.com/uploads/logo.png" alt="Smart City Logo" class="logo" onerror="this.style.display='none'">
            <h1 style="margin:10px 0;">🎉 Welcome to Smart City!</h1>
            <p>Your voice matters in making our city better</p>
          </div>
          <div class="content">
            <h2>Hello {{USERNAME}},</h2>
            <p>Welcome to our smart city governance platform! You're now part of a community dedicated to improving our urban environment.</p>

            <div class="features">
              <div class="feature">
                <h3>📱 Report Issues</h3>
                <p>Submit complaints with photos and location</p>
              </div>
              <div class="feature">
                <h3>🤖 AI Analysis</h3>
                <p>Smart routing to right department</p>
              </div>
              <div class="feature">
                <h3>📈 Track Progress</h3>
                <p>Real-time status updates</p>
              </div>
              <div class="feature">
                <h3>💬 Get Updates</h3>
                <p>Receive resolution notifications</p>
              </div>
            </div>

            <p>Start contributing to a better city today!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getStatusUpdateTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Status Update - Urban Complaint System</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Quicksand  :wght@300;400;700&display=swap');
          body {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .progress-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            margin: 20px 0;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A, #FFC107, #FF9800, #F44336);
            width: {{PROGRESS_PERCENT}};
            transition: width 0.5s ease;
          }
          .status-card {
            border: 2px solid {{STATUS_COLOR}};
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://urbanos-backend.onrender.com/uploads/logo.png" alt="Smart City Logo" class="logo" onerror="this.style.display='none'">
            <h1 style="margin:10px 0;">📊 Status Update</h1>
            <p>Track Your Complaint Journey</p>
          </div>
          <div class="content">
            <h2>{{GREETING}} {{USERNAME}},</h2>
            
            <div class="status-card">
              <h3>📋 Complaint: {{TITLE}}</h3>
              <div style="color: {{STATUS_COLOR}}; font-size: 24px; margin: 15px 0;">
                {{STATUS_EMOJI}} {{STATUS}}
              </div>
              <p>{{STATUS_DESCRIPTION}}</p>
            </div>

            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            
            <p><strong>Progress:</strong> {{PROGRESS_PERCENT}} complete</p>
            <p><strong>Next Steps:</strong> {{NEXT_STEPS}}</p>
            <p><strong>ETA:</strong> {{ESTIMATED_COMPLETION}}</p>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>Admin Comment:</strong><br>
              {{ADMIN_COMMENT}}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Helper to standardize email options with Anti-Spam headers
  _getStandardOptions(to, subject, html, textOverride) {
    return {
      to,
      from: {
        email: 'deepanshukapri4@gmail.com', // Verified Sender
        name: 'Urban OS Team'
      },
      subject,
      text: textOverride || 'Please view this email in an HTML compatible client.',
      html,
      headers: {
        'X-Entity-Ref-ID': `urban-os-${Date.now()}`
      }
    };
  }

  async sendEmail(mailOptions) {
    try {
      // 1. Try SendGrid first (Production - works on Render)
      if (sendGridKey) {
        console.log(`📧 Attempting SendGrid delivery to ${mailOptions.to}...`);
        const msg = {
          to: mailOptions.to,
          from: {
            email: 'deepanshukapri4@gmail.com',
            name: 'Urban OS Team'
          },
          subject: mailOptions.subject,
          text: mailOptions.text,
          html: mailOptions.html,
          headers: {
            'X-Entity-Ref-ID': `urban-os-${Date.now()}`
          }
        };

        try {
          await sgMail.send(msg);
          console.log('✅ SendGrid delivery successful!');
          return true;
        } catch (sgError) {
          console.error('❌ SendGrid Error:', sgError.message);
          console.warn('⚠️ Falling back to Gmail SMTP...');
        }
      }

      // 2. Fallback to Gmail SMTP (Local development)
      if (!transporter) {
        console.error('❌ No email mechanism available (SendGrid or Gmail SMTP)');
        return false;
      }

      console.log(`📧 Attempting Gmail SMTP delivery to ${mailOptions.to}...`);
      await transporter.sendMail(mailOptions);
      console.log('✅ Gmail SMTP Success!');
      return true;
    } catch (error) {
      console.error('📧 Gmail SMTP Error:', error.message);
      if (error.code === 'ETIMEDOUT' && process.env.RENDER) {
        console.error('💡 RENDER ALERT: SMTP is blocked by Render Firewall.');
        console.error('💡 Ensure you use a 16-digit App Password for hyperdk91@gmail.com.');
      }
      return false;
    }
  }

  async sendOtpEmail(email, otp) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('📧 Invalid email:', email);
      return false;
    }

    try {
      const htmlContent = this.templates.otp
        .replace('{{OTP}}', otp)
        .replace('{{EMAIL}}', email);

      const mailOptions = {
        to: email,
        from: `"Urban OS Team" <${emailUser}>`,
        subject: `Verification Code: ${otp}`, // CLEAN SUBJECT (No Emojis triggers)
        text: `Your Urban OS verification code is: ${otp}. Do not share this code.`,
        html: htmlContent
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('📧 OTP send error:', error.message);
      return false;
    }
  }

  async sendComplaintUpdate(email, userData, complaintData) {
    try {
      const htmlContent = this.templates.complaintUpdate
        .replace('{{USERNAME}}', userData.name || 'User')
        .replace('{{TITLE}}', complaintData.title)
        .replace('{{STATUS}}', complaintData.status.toLowerCase())
        .replace('{{CATEGORY}}', complaintData.category)
        .replace('{{ADMIN_MESSAGE}}', complaintData.adminMessage || 'No updates yet')
        .replace('{{TIMESTAMP}}', new Date().toLocaleString());

      return await this.sendEmail(this._getStandardOptions(
        email,
        `Complaint Update: ${complaintData.title}`,
        htmlContent,
        `Update for your complaint: ${complaintData.title}. Status: ${complaintData.status}. Admin Message: ${complaintData.adminMessage || 'None'}.`
      ));
    } catch (error) {
      console.error('📧 Complaint update error:', error.message);
      return false;
    }
  }

  async sendAdminNotification(adminEmail, complaintData) {
    try {
      const htmlContent = this.templates.adminNotification
        .replace('{{ADMIN_NAME}}', 'Admin')
        .replace('{{TITLE}}', complaintData.title)
        .replace('{{DESCRIPTION}}', complaintData.description)
        .replace('{{CATEGORY}}', complaintData.category)
        .replace('{{PRIORITY}}', complaintData.priorityScore)
        .replace('{{LATITUDE}}', complaintData.location.coordinates[1])
        .replace('{{LONGITUDE}}', complaintData.location.coordinates[0])
        .replace('{{USERNAME}}', complaintData.userName)
        .replace('{{CONTACT}}', complaintData.userContact || 'N/A')
        .replace('{{TIMESTAMP}}', new Date().toLocaleString());

      return await this.sendEmail(this._getStandardOptions(
        adminEmail,
        `🚨 High Priority Complaint: ${complaintData.title}`,
        htmlContent,
        `New High Priority Complaint.\nTitle: ${complaintData.title}\nPriority: ${complaintData.priorityScore}`
      ));
    } catch (error) {
      console.error('📧 Admin notification error:', error.message);
      return false;
    }
  }

  async sendAiAnalysis(email, userData, analysisData) {
    try {
      const htmlContent = this.templates.aiAnalysis
        .replace('{{USERNAME}}', userData.name || 'User')
        .replace('{{CATEGORY}}', analysisData.category)
        .replace('{{ASSIGNED_DEPARTMENT}}', analysisData.assignedDept)
        .replace('{{CONFIDENCE}}', (analysisData.aiConfidence * 100).toFixed(1))
        .replace('{{CONFIDENCE_PERCENT}}', `${(analysisData.aiConfidence * 100)}%`)
        .replace('{{PRIORITY}}', analysisData.priorityScore >= 5 ? 'High' : analysisData.priorityScore >= 3 ? 'Medium' : 'Low')
        .replace('{{RESPONSE_TIME}}', analysisData.priorityScore >= 5 ? '1-2 days' : '3-5 days');

      return await this.sendEmail(this._getStandardOptions(
        email,
        '🤖 AI Analysis Complete - Your Complaint',
        htmlContent,
        `AI Analysis for your complaint.\nCategory: ${analysisData.category}\nConfidence: ${(analysisData.aiConfidence * 100).toFixed(1)}%\nPriority: ${analysisData.priorityScore >= 5 ? 'High' : analysisData.priorityScore >= 3 ? 'Medium' : 'Low'}`
      ));
    } catch (error) {
      console.error('📧 AI analysis error:', error.message);
      return false;
    }
  }

  async sendWelcomeEmail(email, userData) {
    try {
      const htmlContent = this.templates.welcome
        .replace('{{USERNAME}}', userData.name || 'User');

      return await this.sendEmail(this._getStandardOptions(
        email,
        'Welcome to Urban OS!',
        htmlContent,
        `Welcome to Urban OS, ${userData.name}! We are glad to have you on board.`
      ));
    } catch (error) {
      console.error('📧 Welcome email error:', error.message);
      return false;
    }
  }

  async sendStatusUpdate(email, userData, statusData) {
    try {
      const statusConfig = {
        pending: { color: '#FF9800', emoji: '⏳', description: 'Your complaint is under review' },
        working: { color: '#2196F3', emoji: '🔧', description: 'Work is in progress' },
        solved: { color: '#4CAF50', emoji: '✅', description: 'Issue has been resolved' },
        fake: { color: '#F44336', emoji: '❌', description: 'Marked as fake complaint' }
      };

      const config = statusConfig[statusData.status] || statusConfig.pending;

      const htmlContent = this.templates.statusUpdate
        .replace('{{GREETING}}', this.getRandomGreeting())
        .replace('{{USERNAME}}', userData.name || 'User')
        .replace('{{TITLE}}', statusData.title)
        .replace('{{STATUS}}', statusData.status.toUpperCase())
        .replace('{{STATUS_COLOR}}', config.color)
        .replace('{{STATUS_EMOJI}}', config.emoji)
        .replace('{{STATUS_DESCRIPTION}}', config.description)
        .replace('{{PROGRESS_PERCENT}}', this.calculateProgress(statusData.status))
        .replace('{{NEXT_STEPS}}', this.getNextSteps(statusData.status))
        .replace('{{ESTIMATED_COMPLETION}}', this.getEstimatedCompletion(statusData.status))
        .replace('{{ADMIN_COMMENT}}', statusData.adminMessage || 'No comments yet');

      return await this.sendEmail(this._getStandardOptions(
        email,
        `Status Update: ${statusData.title}`,
        htmlContent,
        `Your complaint status has been updated to: ${statusData.status.toUpperCase()}.\nAdmin/Officer Message: ${statusData.adminMessage || 'No comments'}.\nProgress: ${this.calculateProgress(statusData.status)}`
      ));
    } catch (error) {
      console.error('📧 Status update error:', error.message);
      return false;
    }
  }

  getRandomGreeting() {
    const greetings = this.aiPersonalization.greetingVariants;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  calculateProgress(status) {
    const progressMap = {
      pending: '25%',
      working: '60%',
      solved: '100%',
      fake: '0%'
    };
    return progressMap[status] || '0%';
  }

  getNextSteps(status) {
    const stepsMap = {
      pending: 'Admin will review your complaint and assign it to the appropriate department.',
      working: 'Team is actively working on resolving your issue.',
      solved: 'Issue has been resolved. Thank you for your patience.',
      fake: 'Complaint marked as fake. No further action required.'
    };
    return stepsMap[status] || 'Processing your request.';
  }

  getEstimatedCompletion(status) {
    const timeMap = {
      pending: 'Within 24 hours',
      working: '1-3 business days',
      solved: 'Completed',
      fake: 'N/A'
    };
    return timeMap[status] || 'Processing';
  }

  // Health check
  async testConnection() {
    try {
      await transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }

  // Get statistics
  getEmailStats() {
    return {
      cacheSize: emailCache.size,
      templates: Object.keys(this.templates).length,
      connected: transporter.transporter ? true : false,
      maxConnections: 10,
      maxMessages: 200
    };
  }
}

// Initialize the service
const emailService = new EmailService();

// Export enhanced functions
exports.sendOtpEmail = async (email, otp) => {
  return await emailService.sendOtpEmail(email, otp);
};

exports.sendComplaintUpdate = async (email, userData, complaintData) => {
  return await emailService.sendComplaintUpdate(email, userData, complaintData);
};

exports.sendAdminNotification = async (adminEmail, complaintData) => {
  return await emailService.sendAdminNotification(adminEmail, complaintData);
};

exports.sendAiAnalysis = async (email, userData, analysisData) => {
  return await emailService.sendAiAnalysis(email, userData, analysisData);
};

exports.sendWelcomeEmail = async (email, userData) => {
  return await emailService.sendWelcomeEmail(email, userData);
};

exports.sendStatusUpdate = async (email, userData, statusData) => {
  return await emailService.sendStatusUpdate(email, userData, statusData);
};

exports.sendSOSUpdate = async (email, userData) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #d9534f;">🛡️ Security Alert: SOS Contacts Updated</h2>
        <p>Hello <strong>${userData.name || 'User'}</strong>,</p>
        <p>Your emergency contacts or SOS settings were recently updated on the Urban OS platform.</p>
        <p>If you did not make this change, please secure your account immediately.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Action:</strong> SOS Settings Updated<br>
          <strong>Status:</strong> Active
        </div>
        <p>Stay safe!</p>
        <p>Best regards,<br>Urban OS Security Team</p>
      </div>
    `;

    const mailOptions = {
      to: email,
      from: `"Urban OS Security" <${process.env.EMAIL_USER}>`,
      subject: '🛡️ Urban OS: SOS Contacts Updated',
      html: htmlContent
    };

    return await emailService.sendEmail(mailOptions);
  } catch (error) {
    console.error('📧 SOS update email error:', error.message);
    return false;
  }
};

// Export utility functions
exports.testConnection = () => emailService.testConnection();
exports.getEmailStats = () => emailService.getEmailStats();

console.log('✅ Advanced Email Service Loaded');
console.log('📊 Features: AI Personalization, Pretty Templates, Multiple Email Types, Advanced Styling');
console.log('🎯 Performance: Optimized for 500+ lines of advanced functionality');
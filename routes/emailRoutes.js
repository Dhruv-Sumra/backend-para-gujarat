import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Email configuration with validation
let transporter = null;
let transporterError = null;

const initializeTransporter = () => {
  try {
    // Check if required environment variables are set
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      const missingVars = [];
      if (!emailUser) missingVars.push('EMAIL_USER');
      if (!emailPass) missingVars.push('EMAIL_PASS');
      
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    console.log('Initializing email transporter with user:', emailUser);

    transporter = nodemailer.createTransport({
      service: 'gmail', // Using service instead of manual configuration
      auth: {
        user: emailUser,
        pass: emailPass
      },
      // Alternative manual configuration (uncomment if service doesn't work)
      /*
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
      */
    });

    // Verify the transporter configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.error('Email transporter verification failed:', error);
        transporterError = error;
        transporter = null;
      } else {
        console.log('✅ Email transporter is ready to send messages');
        console.log('✅ Using email account:', emailUser);
        transporterError = null;
      }
    });

  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    transporterError = error;
    transporter = null;
  }
};

// Initialize transporter
initializeTransporter();

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send email endpoint
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Check if transporter is configured
    if (!transporter) {
      console.error('❌ Email transporter not available');
      return res.status(500).json({
        success: false,
        message: 'Email service is currently unavailable. Please try again later or contact us directly.',
        details: transporterError ? transporterError.message : 'Email service not configured'
      });
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide name, email, subject, and message.'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Sanitize inputs to prevent XSS
    const sanitize = (str) => str.replace(/[<>]/g, '');
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedPhone = phone ? sanitize(phone) : '';
    const sanitizedSubject = sanitize(subject);
    const sanitizedMessage = sanitize(message);

    // Email content
    const mailOptions = {
      from: `"PSAG Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🏃‍♂️ PSAG Contact: ${sanitizedSubject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              🏃‍♂️ Para Sports Association of Gujarat
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">
              New Contact Form Submission
            </p>
          </div>
          
          <!-- Content -->
          <div style="background-color: white; padding: 30px 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #667eea;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555; width: 100px;">👤 Name:</td>
                  <td style="padding: 8px 0; color: #333;">${sanitizedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">📧 Email:</td>
                  <td style="padding: 8px 0; color: #333;"><a href="mailto:${sanitizedEmail}" style="color: #667eea; text-decoration: none;">${sanitizedEmail}</a></td>
                </tr>
                ${sanitizedPhone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">📱 Phone:</td>
                  <td style="padding: 8px 0; color: #333;"><a href="tel:${sanitizedPhone}" style="color: #667eea; text-decoration: none;">${sanitizedPhone}</a></td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">📝 Subject:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${sanitizedSubject}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center;">
                💬 Message
              </h3>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #28a745;">
                <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${sanitizedMessage}</p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #e9ecef; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              📅 Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST<br>
              🌐 Sent from PSAG Website Contact Form
            </p>
          </div>
        </div>
      `,
      // Plain text fallback
      text: `
        New Contact Form Submission - Para Sports Association of Gujarat
        
        Contact Information:
        Name: ${sanitizedName}
        Email: ${sanitizedEmail}
        ${sanitizedPhone ? `Phone: ${sanitizedPhone}` : ''}
        Subject: ${sanitizedSubject}
        
        Message:
        ${sanitizedMessage}
        
        Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      `
    };

    // Send email with timeout
    console.log('📤 Attempting to send email...');
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout after 30 seconds')), 30000)
      )
    ]);
    
    console.log('✅ Email sent successfully:', result.messageId);

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! Your message has been sent successfully. We will get back to you soon.',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Provide specific error messages
    let userMessage = 'Failed to send email. Please try again later.';
    
    if (error.message.includes('timeout')) {
      userMessage = 'Email sending timed out. Please try again or contact us directly.';
    } else if (error.message.includes('Invalid login')) {
      userMessage = 'Email service configuration error. Please contact the administrator.';
    } else if (error.message.includes('Network')) {
      userMessage = 'Network error. Please check your connection and try again.';
    }

    res.status(500).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test email configuration endpoint
router.get('/email-test', async (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Check environment variables
    if (!emailUser || !emailPass) {
      return res.status(500).json({
        success: false,
        message: 'Email credentials not configured',
        config: {
          EMAIL_USER: emailUser || '❌ Not set',
          EMAIL_PASS: emailPass ? '✅ Set' : '❌ Not set',
          NODE_ENV: process.env.NODE_ENV || 'Not set'
        },
        instructions: [
          '1. Create a .env file in your project root',
          '2. Add: EMAIL_USER=your-gmail@gmail.com',
          '3. Add: EMAIL_PASS=your-app-password',
          '4. For Gmail, use App Password instead of regular password',
          '5. Enable 2-Factor Authentication and generate App Password'
        ]
      });
    }

    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email transporter initialization failed',
        error: transporterError ? transporterError.message : 'Unknown error',
        config: {
          EMAIL_USER: emailUser,
          EMAIL_PASS: '✅ Set',
        }
      });
    }

    // Test the connection with timeout
    const verifyResult = await Promise.race([
      new Promise((resolve, reject) => {
        transporter.verify((error, success) => {
          if (error) reject(error);
          else resolve(success);
        });
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 15000)
      )
    ]);

    res.status(200).json({
      success: true,
      message: '✅ Email service is working correctly!',
      config: {
        EMAIL_USER: emailUser,
        EMAIL_PASS: '✅ Set and working',
        service: 'Gmail',
        status: 'Connected and verified'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email test error:', error);
    
    let troubleshooting = [];
    
    if (error.message.includes('Invalid login')) {
      troubleshooting = [
        '1. Make sure you\'re using an App Password, not your regular Gmail password',
        '2. Enable 2-Factor Authentication on your Gmail account',
        '3. Generate a new App Password: Gmail → Settings → Security → App Passwords',
        '4. Use the 16-character App Password in EMAIL_PASS'
      ];
    } else if (error.message.includes('timeout')) {
      troubleshooting = [
        '1. Check your internet connection',
        '2. Verify Gmail SMTP is not blocked by firewall',
        '3. Try restarting the application'
      ];
    }

    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: error.message,
      config: {
        EMAIL_USER: process.env.EMAIL_USER || '❌ Not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set',
      },
      troubleshooting
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email service health check',
    status: {
      transporter: transporter ? '✅ Ready' : '❌ Not ready',
      credentials: {
        EMAIL_USER: process.env.EMAIL_USER ? '✅ Set' : '❌ Missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'
      },
      lastError: transporterError ? transporterError.message : null
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
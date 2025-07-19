import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'set' : 'not set');

try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'gujaratparasports@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password-here'
    }
  });

  console.log('Transporter created successfully');
  
  // Test the connection
  transporter.verify(function(error, success) {
    if (error) {
      console.log('Error verifying email configuration:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} catch (error) {
  console.error('Failed to create transporter:', error);
} 
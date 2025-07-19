import { generateIdCard } from './utils/idCardGenerator.js';
import { sendIdCardEmail } from './utils/emailService.js';

// Test player data
const testPlayer = {
  playerId: 'PS20250001',
  firstName: 'Bhavana',
  lastName: 'Chaudhary',
  email: 'test@example.com',
  gender: 'Female',
  primarySport: 'Para Athletics',
  dateOfBirth: new Date('1990-01-01'),
  passportNumber: 'A12345678',
  address: {
    street: 'Test Street',
    city: 'Ahmedabad',
    state: 'Gujarat',
    postalCode: '380001',
    country: 'India'
  },
  coachName: 'Test Coach',
  coachContact: '9876543210',
  emergencyContact: {
    name: 'Emergency Contact',
    phone: '9876543211'
  },
  registrationDate: new Date()
};

async function testIdCardGeneration() {
  try {
    console.log('🧪 Testing ID Card Generation...');
    
    // Generate ID card
    const idCardPath = await generateIdCard(testPlayer);
    console.log('✅ ID Card generated successfully:', idCardPath);
    
    // Test email sending
    console.log('📧 Testing Email Sending...');
    const emailResult = await sendIdCardEmail(testPlayer, idCardPath);
    
    if (emailResult.error) {
      console.log('⚠️ Email not sent:', emailResult.error);
    } else {
      console.log('✅ Email sent successfully:', emailResult.messageId);
    }
    
    console.log('🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testIdCardGeneration(); 
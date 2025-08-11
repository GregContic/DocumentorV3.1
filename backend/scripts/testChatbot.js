// Simple test script for chatbot functionality
const { classifyIntent, generateResponse } = require('../utils/simpleAI');

console.log('🤖 Testing Chatbot AI...\n');

// Test cases
const testCases = [
  'Hello there!',
  'How do I request Form 137?',
  'What documents do I need for enrollment?',
  'Tell me a joke',
  'What\'s the weather like?',
  'How much does a diploma cost?',
  'I need help with something',
  'Thank you for your help!',
  'This is a completely random question about quantum physics'
];

testCases.forEach((message, index) => {
  console.log(`\n--- Test ${index + 1} ---`);
  console.log(`User: ${message}`);
  
  const intent = classifyIntent(message);
  console.log(`Intent: ${intent.category}-${intent.type} (confidence: ${intent.confidence})`);
  
  const response = generateResponse(message, intent, [], { pageContext: '/' });
  console.log(`Bot: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);
});

console.log('\n✅ Chatbot AI tests completed!');
console.log('\nTo run this test:');
console.log('cd backend && node scripts/testChatbot.js');

import { checkModeration } from './src/utils/moderation';

const testCases = [
  { text: 'Fresh Organic Tomatoes', expected: null },
  { text: 'Fresh cannabis for sale', expected: 'cannabis' },
  { text: 'High quality Marijuana from the hills', expected: 'marijuana' },
  { text: 'Brown sugar and tea', expected: 'brown sugar' },
];

testCases.forEach(({ text, expected }) => {
  const result = checkModeration(text);
  if (result === expected) {
    console.log(`PASS: "${text}" -> ${result}`);
  } else {
    console.log(`FAIL: "${text}" -> expected ${expected}, got ${result}`);
    process.exit(1);
  }
});

console.log('All moderation tests passed!');

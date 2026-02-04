
require('dotenv').config({ path: '.env.test' });

const chai = require('chai');
const chaiHttp = require('chai-http');

// Configure Chai to use HTTP plugin
chai.use(chaiHttp);

global.expect = chai.expect;


process.env.NODE_ENV = 'test';


if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only-12345';
}
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '1h';
}

if (!process.env.DB_TEST_NAME) {
  process.env.DB_TEST_NAME = 'notes_test_db';
}

console.log('Test environment configured');
console.log(`Database: ${process.env.DB_TEST_NAME}`);
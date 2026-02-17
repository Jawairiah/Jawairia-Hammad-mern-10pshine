// .mocharc.js - Mocha Test Runner Configuration
module.exports = {
  require: ['tests/setup.js'],
  
  timeout: 10000,
  
  exit: true,
  
  recursive: true,
  
  spec: 'tests/**/*.test.js',
  
  color: true,

  reporter: 'spec'
};
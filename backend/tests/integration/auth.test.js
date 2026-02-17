// tests/integration/auth.test.js
// Authentication API Tests - 10 tests total

require('../setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../src/server');
const { testPool, cleanDatabase } = require('../helpers/testDb');

chai.use(chaiHttp);
const { expect } = chai;

describe('Authentication API Tests (10 tests)', () => {
  
  // Clean database before each test
  beforeEach(async () => {
    await cleanDatabase();
  });

  
  describe('POST /api/auth/signup', () => {
    
    // Test 1: Successful user registration
    it('Test 1: should register a new user successfully', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email', 'test@example.com');
          expect(res.body.user).to.have.property('username', 'testuser');
          expect(res.body.user).to.not.have.property('password_hash');
          done();
        });
    });

    // Test 2: Validation - invalid email format
    it('Test 2: should reject signup with invalid email', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'invalid-email-format',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    // Test 3: Duplicate email prevention
    it('Test 3: should reject duplicate email', async () => {
      await chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'user1',
          email: 'test@example.com',
          password: 'password123'
        });

      // Attempt to create user with same email
      const res = await chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'user2',
          email: 'test@example.com',
          password: 'password456'
        });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('already exists');
    });
  });

  // USER LOGIN TESTS (3 tests)
  describe('POST /api/auth/login', () => {
    
    // Create a test user before each login test
    beforeEach(async () => {
      await chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    // Test 4: Successful login
    it('Test 4: should login successfully with correct credentials', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email', 'test@example.com');
          done();
        });
    });

    // Test 5: Wrong password rejection
    it('Test 5: should reject login with incorrect password', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('Invalid email or password');
          done();
        });
    });

    // Test 6: Non-existent user
    it('Test 6: should reject login with non-existent email', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('Invalid email or password');
          done();
        });
    });
  });

  // PROTECTED ROUTE TESTS (2 tests)
  
  describe('GET /api/auth/me (Protected Route)', () => {
    
    let authToken;

    beforeEach(async () => {
      // Create user and get authentication token
      const signupRes = await chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = signupRes.body.token;
    });

    // Test 7: Access with valid token
    it('Test 7: should get current user with valid token', (done) => {
      chai.request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email', 'test@example.com');
          expect(res.body.user).to.have.property('username', 'testuser');
          done();
        });
    });

    // Test 8: Reject without token
    it('Test 8: should reject request without token', (done) => {
      chai.request(app)
        .get('/api/auth/me')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('No token provided');
          done();
        });
    });
  });

  // PASSWORD CHANGE TESTS (2 tests)
  
  describe('PUT /api/auth/change-password', () => {
    
    let authToken;

    beforeEach(async () => {
      // Create user and get authentication token
      const signupRes = await chai.request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = signupRes.body.token;
    });

    // Test 9: Successful password change
    it('Test 9: should change password successfully', (done) => {
      chai.request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.message).to.include('changed successfully');
          done();
        });
    });

    // Test 10: Reject with wrong current password
    it('Test 10: should reject with incorrect current password', (done) => {
      chai.request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('incorrect');
          done();
        });
    });
  });
});
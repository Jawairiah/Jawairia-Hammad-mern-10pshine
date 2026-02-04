require('../setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../src/server');
const { testPool, cleanDatabase } = require('../helpers/testDb');

chai.use(chaiHttp);
const { expect } = chai;

describe('Notes API Tests (10 tests)', () => {
  
  let authToken;      // Token for user 1
  let user2Token;     // Token for user 2 (for isolation tests)

  // Setup: Clean database and create 2 test users before each test
  beforeEach(async () => {
    await cleanDatabase();
    
    // Create first user
    const user1Res = await chai.request(app)
      .post('/api/auth/signup')
      .send({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      });
    authToken = user1Res.body.token;

    // Create second user (for data isolation tests)
    const user2Res = await chai.request(app)
      .post('/api/auth/signup')
      .send({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      });
    user2Token = user2Res.body.token;
  });

  // Cleanup after all tests
  after(async () => {
    await cleanDatabase();
  });

  // CREATE NOTE TESTS (3 tests)
  
  describe('POST /api/notes', () => {
    
    // Test 11: Successful note creation
    it('Test 11: should create a new note successfully', (done) => {
      chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note',
          content: 'This is test content for the note'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('note');
          expect(res.body.note).to.have.property('id');
          expect(res.body.note).to.have.property('title', 'Test Note');
          expect(res.body.note).to.have.property('content', 'This is test content for the note');
          expect(res.body.note).to.have.property('created_at');
          expect(res.body.note).to.have.property('updated_at');
          done();
        });
    });

    // Test 12: Authentication required
    it('Test 12: should reject note creation without authentication', (done) => {
      chai.request(app)
        .post('/api/notes')
        .send({
          title: 'Test Note',
          content: 'Content'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('No token provided');
          done();
        });
    });

    // Test 13: Validation - title required
    it('Test 13: should reject note creation without title', (done) => {
      chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Content without title'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('Validation failed');
          done();
        });
    });
  });

  // GET ALL NOTES TESTS (2 tests)
  
  describe('GET /api/notes', () => {
    
    // Create sample notes before each test
    beforeEach(async () => {
      // User 1 creates 2 notes
      await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'User1 Note 1', content: 'Content 1' });

      await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'User1 Note 2', content: 'Content 2' });

      // User 2 creates 1 note
      await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'User2 Note', content: 'User2 Content' });
    });

    // Test 14: Get all user notes
    it('Test 14: should get all notes for authenticated user', (done) => {
      chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('notes');
          expect(res.body.notes).to.be.an('array');
          expect(res.body.notes).to.have.lengthOf(2);
          expect(res.body).to.have.property('count', 2);
          done();
        });
    });

    // Test 15: Data isolation - users only see their own notes
    it('Test 15: should only return notes belonging to authenticated user', (done) => {
      chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.notes).to.have.lengthOf(2);
          
          // Verify notes belong to user 1
          const titles = res.body.notes.map(note => note.title);
          expect(titles).to.include('User1 Note 1');
          expect(titles).to.include('User1 Note 2');
          expect(titles).to.not.include('User2 Note');
          done();
        });
    });
  });

  // UPDATE NOTE TESTS (2 tests)
  
  describe('PUT /api/notes/:id', () => {
    
    let noteId;
    let user2NoteId;

    beforeEach(async () => {
      // Create note for user 1
      const note1Res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Original Title', content: 'Original Content' });
      noteId = note1Res.body.note.id;

      // Create note for user 2
      const note2Res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'User2 Note', content: 'User2 Content' });
      user2NoteId = note2Res.body.note.id;
    });

    // Test 16: Successful note update
    it('Test 16: should update note successfully', (done) => {
      chai.request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.note).to.have.property('id', noteId);
          expect(res.body.note).to.have.property('title', 'Updated Title');
          expect(res.body.note).to.have.property('content', 'Updated Content');
          done();
        });
    });

    // Test 17: Authorization - cannot update other user's note
    it('Test 17: should not allow user to update another user\'s note', (done) => {
      chai.request(app)
        .put(`/api/notes/${user2NoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Hacked Title',
          content: 'Hacked Content'
        })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('not found or access denied');
          done();
        });
    });
  });

  // DELETE NOTE TESTS (2 tests)
  
  describe('DELETE /api/notes/:id', () => {
    
    let noteId;
    let user2NoteId;

    beforeEach(async () => {
      // Create note for user 1
      const note1Res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Note to Delete', content: 'Content' });
      noteId = note1Res.body.note.id;

      // Create note for user 2
      const note2Res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'User2 Note', content: 'Content' });
      user2NoteId = note2Res.body.note.id;
    });

    // Test 18: Successful note deletion
    it('Test 18: should delete note successfully', (done) => {
      chai.request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('deletedId', noteId);
          expect(res.body.message).to.include('deleted successfully');
          done();
        });
    });

    // Test 19: Authorization - cannot delete other user's note
    it('Test 19: should not allow user to delete another user\'s note', (done) => {
      chai.request(app)
        .delete(`/api/notes/${user2NoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body.message).to.include('not found or access denied');
          done();
        });
    });
  });

  // GET SPECIFIC NOTE TEST (1 test)
  
  describe('GET /api/notes/:id', () => {
    
    let noteId;

    beforeEach(async () => {
      // Create a note for user 1
      const noteRes = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Specific Note', content: 'Specific Content' });
      noteId = noteRes.body.note.id;
    });

    // Test 20: Get specific note by ID
    it('Test 20: should get specific note by id', (done) => {
      chai.request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('note');
          expect(res.body.note).to.have.property('id', noteId);
          expect(res.body.note).to.have.property('title', 'Specific Note');
          expect(res.body.note).to.have.property('content', 'Specific Content');
          done();
        });
    });
  });
});
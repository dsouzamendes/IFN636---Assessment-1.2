const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const User = require('../models/User');
const Entry = require('../models/Entry');
const mongoose = require('mongoose');

const { expect } = chai;
chai.use(chaiHttp);

describe('Entry API Tests', () => {
  let authToken;
  let testUserId;
  let testEntryId;

  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/diary-app-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up collections
    await User.deleteMany({});
    await Entry.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await Entry.deleteMany({});
  });

  describe('Authentication', () => {
    it('should register a new user', (done) => {
      chai
        .request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          // The auth controller returns { user: { _id, name, email, ... }, token }
          testUserId = res.body.user?._id || res.body.id;
          authToken = res.body.token;
          done();
        });
    });

    it('should login a user', (done) => {
      chai
        .request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          authToken = res.body.token;
          testUserId = res.body.user?._id || res.body.id;
          done();
        });
    });
  });

  describe('Entry CRUD Operations', () => {
    it('should create a new entry', (done) => {
      chai
        .request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My First Day',
          description: 'Today was amazing! I had a great time at the park.',
          mood: 'Happy',
          location: 'Central Park',
          tags: ['park', 'friends', 'fun'],
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('title', 'My First Day');
          expect(res.body).to.have.property('mood', 'Happy');
          testEntryId = res.body._id;
          done();
        });
    });

    it('should get all entries for the user', (done) => {
      chai
        .request(app)
        .get('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          done();
        });
    });

    it('should filter entries by mood', (done) => {
      chai
        .request(app)
        .get('/api/entries?mood=Happy')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          res.body.forEach((entry) => {
            expect(entry.mood).to.equal('Happy');
          });
          done();
        });
    });

    it('should update an entry', (done) => {
      chai
        .request(app)
        .put(`/api/entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My First Day Updated',
          mood: 'Grateful',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('title', 'My First Day Updated');
          expect(res.body).to.have.property('mood', 'Grateful');
          done();
        });
    });

    it('should delete an entry', (done) => {
      chai
        .request(app)
        .delete(`/api/entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('should not access another user\'s entry', (done) => {
      // Register another user
      chai
        .request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'anotheruser@example.com',
          password: 'password456',
        })
        .end((err, res) => {
          if (err) return done(err);
          const otherToken = res.body.token;

          // Create an entry owned by the first user
          Entry.create({
            user: testUserId,
            title: 'Private Entry',
            description: 'This is private',
            mood: 'Calm',
          }).then((entry) => {
            // Try to access it with the other user's token
            chai
              .request(app)
              .get(`/api/entries/${entry._id}`)
              .set('Authorization', `Bearer ${otherToken}`)
              .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(403);
                done();
              });
          }).catch(done);
        });
    });
  });
});

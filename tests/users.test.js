"use strict";

const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);

describe("Test URL Exercise Tracker Microservice", () => {
  let server;

  // Start server before each test
  beforeEach((done) => {
    server = require("../server");
    done();
  });
  // Stop server after each test
  afterEach((done) => server.close(() => done()));
  // Clean user collection and close connection with MongoDB
  after(async () => {
    await userModel.deleteMany();
    await mongoose.disconnect();
  });

  describe("POST /api/exercise/new-user", () => {
    it("should return a JSON response with keys '_id' and 'username'.", (done) => {
      chai
        .request(server)
        .post("/api/exercise/new-user")
        .send({ username: "John Doe" })
        .end((err, res) => {
          // Get results
          const actualResult = res.body;

          // Test results
          expect(actualResult)
            .to.be.an("object")
            .that.has.all.keys("_id", "username");

          expect(actualResult.username).to.be.equal("John Doe");

          done();
        });
    });
  });

  describe('GET /api/exercise/users')
});

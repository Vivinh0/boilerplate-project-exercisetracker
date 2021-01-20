"use strict";

const mongoose = require("mongoose");
const usersModel = require("../models/usersModel");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);

describe("Test URL Exercise Tracker Microservice", () => {
  let server;
  let testUserId;

  // Start server before each test
  beforeEach((done) => {
    server = require("../server");
    done();
  });
  // Stop server after each test
  afterEach((done) => server.close(() => done()));
  // Clean user collection and close connection with MongoDB
  after(async () => {
    await usersModel.deleteMany();
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

          testUserId = actualResult._id;

          done();
        });
    });
  });

  describe("GET /api/exercise/users", () => {
    it("should return an array. Each element in the array is an object containing a user's username and _id.", (done) => {
      // Mock data. Insert 5 users
      for (let i = 0; i < 5; i++) {
        chai
          .request(server)
          .post("/api/exercise/new-user")
          .send({ username: `Test User ${i}` });
      }
      // Test
      chai
        .request(server)
        .get("/api/exercise/users")
        .end((err, res) => {
          // Get results
          const actualResult = res.body;

          // Test results
          expect(actualResult).to.be.an("array");
          expect(actualResult[0]).to.has.all.keys("_id", "username");

          done();
        });
    });
  });

  describe("POST /api/exercise/add", () => {
    it("should POST to /api/exercise/add with form data userId=_id, description, duration, and optionally date. If no date is supplied, the current date will be used. The response returned will be the user object with the property 'logs', wich is an array of object with input keys (description, duration, date)", (done) => {
      // Mock inut data
      const exercise = {
        userId: testUserId,
        description: "exercise 1",
        duration: 15 * 60, // min * seconds
        date: "2010-10-10",
      };

      // Test
      chai
        .request(server)
        .post("/api/exercise/add")
        .send(exercise)
        .end((err, res) => {
          // Get results
          const actualResult = res.body;

          // Test results //
          // test response properties
          expect(actualResult)
            .to.be.an("object")
            .that.has.all.keys(
              "_id",
              "username",
              "description",
              "duration",
              "date"
            );

          done();
        });
    });
    it("should return same object previous test but with current date", (done) => {
      // Mock input data. No date
      const exerciseNoDate = {
        userId: testUserId,
        description: "exercise 2",
        duration: 10 * 60, // min * seconds
      };
      // Test
      chai
        .request(server)
        .post("/api/exercise/add")
        .send(exerciseNoDate)
        .end((err, res) => {
          // Get results
          const actualResult = res.body;

          // Test results //
          // test response properties
          expect(actualResult)
            .to.be.an("object")
            .that.has.all.keys(
              "_id",
              "username",
              "description",
              "duration",
              "date"
            );
          // test is set current date
          const actualResultDate = new Date(actualResult.date);
          const currDate = new Date().toString().slice(0, 15);
          expect(actualResultDate.toString().slice(0, 15)).to.be.equal(
            currDate
          );

          done();
        });
    });
  });

  describe("GET /api/exercise/log", () => {
    it("should return the user object with a log array of all the exercise added. Each log item has the 'description', 'duration' and 'date' properties", (done) => {
      // Test
      chai
        .request(server)
        .get(`/api/exercise/log/${testUserId}`)
        .end((err, res) => {
          // Get results
          const actualResult = res.body;
          // console.log(actualResult);
          // Test results
          // test response
          expect(actualResult).to.has.all.keys(
            "_id",
            "username",
            "log",
            "count"
          );
          // test log property is array
          expect(actualResult.log).to.be.an("array");
          // test array element properties
          expect(actualResult.log[0]).to.has.all.keys(
            "description",
            "duration",
            "date"
          );
          // test count property
          expect(actualResult.count)
            .to.be.an("number")
            .and.be.equal(actualResult.log.length);

          done();
        });
    });

    it("it should filter using query parameters 'from', 'to' and 'limit' and return an array of logs with dates between '2011-12-12' and '2015-12-12' and be limited to two elements", (done) => {
      let arrLog = [];
      for (let i = 0; i < 5; i++) {
        const log = {
          description: `Description 201${i}`,
          duration: 10 * i * 60,
          date: `201${i}-12-12`,
        };
        arrLog.push(log);
      }
      (async () => {
        await usersModel.updateOne(
          { _id: testUserId },
          { $push: { log: arrLog } }
        );
      })();

      // Test
      chai
        .request(server)
        .get(
          `/api/exercise/log/${testUserId}?from=2011-12-12&to=2015-12-12&limit=2`
        )
        .end((err, res) => {
          // Get results
          const actualResult = res.body;
          // console.log(actualResult);
          // Test results
          // test count property
          expect(actualResult.log).to.be.an("array").and.have.length(2);
          expect(actualResult.log[0].date.split("T")[0]).to.be.equal(
            "2011-12-12"
          );
          expect(actualResult.log[1].date.split("T")[0]).to.be.equal(
            "2012-12-12"
          );

          done();
        });
    });
  });
});

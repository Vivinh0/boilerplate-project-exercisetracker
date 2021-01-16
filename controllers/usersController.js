"use strict";

const usersModel = require("../models/usersModel");

module.exports = {
  createUser: async (req, res, next) => {
    try {
      // Create user in db
      const userToCreate = { username: req.body.username };
      const createdUser = await usersModel.create(userToCreate);
      // Create copy created user without __v property
      const response = {
        _id: createdUser._id,
        username: createdUser.username,
      };
      // Send back status 201 (resource created) and response object
      res.status(201).send(response);

      // Catch any errors and send back 500 (Internal server error)
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
  getUsers: async (req, res, next) => {
    try {
      const foundUsers = await usersModel.find({}, "_id username");
      res.json(foundUsers);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
};

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
  addExercise: async (req, res, next) => {
    try {
      // Get user to add exercise
      const idUserToFind = req.body.userId;
      const filter = { _id: idUserToFind };

      // Find and pdate
      const { description, duration, date } = req.body;
      const newExercise = {
        description: description,
        duration: duration,
        date: date || new Date().toISOString().split("T")[0],
      };
      const updatedUser = await usersModel.findByIdAndUpdate(
        filter,
        {
          $push: { log: newExercise },
        },
        { new: true, fields: { _id: 1, username: 1, log: 1 } }
      );

      res.json(updatedUser);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
};

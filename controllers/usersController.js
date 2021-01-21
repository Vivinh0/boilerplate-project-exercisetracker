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
      if (updatedUser) {
        const posLastLog = updatedUser.log.length - 1;

        // Format date
        const dateToFormat = new Date(updatedUser.log[posLastLog].date);

        // Create expected response
        const response = {
          _id: updatedUser._id,
          username: updatedUser.username,
          description: updatedUser.log[posLastLog].description,
          duration: updatedUser.log[posLastLog].duration,
          date: dateToFormat.toString().slice(0,15),
        };
        res.json(response);
      } else {
        res.status(400).send({ msg: "user id not found" });
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
  getLogs: async (req, res, next) => {
    try {
      const userIdToFind = req.query.userId;
      const foundUser = await usersModel.findById(userIdToFind, {
        username: 1,
        log: 1,
      });
      // Filter response
      const { from, to, limit } = req.query;
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      const limitNum = limit ? Number.parseInt(req.query.limit) : null;

      let filterLogs;
      // Return function with right condition
      const conditionSelector = () => {
        if (fromDate && toDate)
          return (date) => {
            return fromDate <= date && date <= toDate;
          };
        else if (fromDate && !toDate)
          return (date) => {
            return fromDate <= date;
          };
        else if (!fromDate && toDate)
          return (date) => {
            return date <= toDate;
          };
        else 0;
      };

      // Filter logs using right condition
      if (fromDate || toDate) {
        filterLogs = foundUser.log.filter((logElem) => {
          const date = new Date(logElem.date);
          const condition = conditionSelector();
          if (condition(date)) return date;
          return;
        });
      }

      // Limited logs
      let limitedLogs;
      if (limitNum) {
        limitedLogs = filterLogs
          ? filterLogs.slice(0, limitNum)
          : foundUser.log.slice(0, limitNum);
      }

      // Create response
      const response = {
        _id: foundUser._id,
        username: foundUser.username,
        count: foundUser.log.length,
        log: limitedLogs || filterLogs || foundUser.log,
      };
      res.json(response);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
};

"use strict";

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// module.exports = router.post("/new-user", (req, res, next) =>
//   res.json({ msg: "Ok" })
// );

module.exports = router
  .post("/new-user", usersController.createUser)
  .get("/users", usersController.getUsers);

"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

// module.exports = router.post("/new-user", (req, res, next) =>
//   res.json({ msg: "Ok" })
// );

module.exports = router.post("/new-user", userController.createUser);

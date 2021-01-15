"use strict";

const express = require("express");
const router = express.Router();

module.exports = router.post("/new-user", (req, res, next) =>
  res.json({ msg: "Ok" })
);

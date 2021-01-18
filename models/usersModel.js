"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  {
    _id: false,
  }
);

const userSchema = new Schema({
  username: { type: String, require: true },
  log: { type: [logSchema] },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;

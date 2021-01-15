"use strict";

// Imports
const mongoose = require("mongoose");
const Schema = mongoose.Schema();
require("dotenv").config();

// DB setup
const DB_URI = process.env.DB_URI;
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
// Get connection instance
const db = mongoose.connection;
// Set error and open events
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("We're connected to MonogoDB!"));

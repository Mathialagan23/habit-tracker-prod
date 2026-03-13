// const mongoose = require('mongoose');
// const config = require('./index');
// const logger = require('../utils/logger');

// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);

//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB connection error", error);
//     process.exit(1);
//   }
//  };

// module.exports = connectDB;

// for render deploy

const mongoose = require("mongoose");
const config = require("./index");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri);

    logger.info("MongoDB connected");
  } catch (error) {
    logger.error({ error }, "MongoDB connection error");
    process.exit(1);
  }
};

module.exports = connectDB;
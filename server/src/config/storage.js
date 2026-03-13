const { Storage } = require("@google-cloud/storage");

const storage = new Storage();

const bucketName = process.env.GCS_BUCKET || "habit-tracker-avatars";

const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket };
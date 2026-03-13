const userService = require('../services/user.service');
const User = require('../models/User');
const { bucket } = require('../config/storage');

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }

    const fileName = `avatars/${req.user.id}-${Date.now()}-${req.file.originalname}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => next(err));

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { avatar: publicUrl } },
        { new: true }
      );

      res.json({ data: user });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const allowed = ['pushNotifications', 'reminderSounds', 'emailDigest', 'weekStartsMonday', 'reminderTime'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        update[`preferences.${key}`] = req.body[key];
      }
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true }
    );
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteAccount(req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

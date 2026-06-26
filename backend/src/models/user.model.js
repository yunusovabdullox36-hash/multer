// User schema — refreshToken maydoni qo'shildi
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
      // Cloudinary'dan kelgan URL saqlanadi
    },
    refreshToken: {
      type: String,
      default: null,
      // Login bo'lganda saqlanadi, logout bo'lganda null qilinadi
      // Bu orqali faqat so'nggi qurilma/session ishlaydi
    },
  },
  { timestamps: true } // createdAt, updatedAt avtomatik qo'shiladi
);

module.exports = mongoose.model('User', userSchema);
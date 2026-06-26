// Cloudinary SDK ni sozlash va export qilish
// Bu faylni boshqa fayllarga import qilamiz, har safar sozlamaymiz

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
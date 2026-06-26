require('dotenv').config();
// ↑ ENG BIRINCHI! .env faylni yuklaydi.
// Boshqa fayllarda process.env.* ishlashi uchun shart.

const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// 1. DB ulash — async, lekin server shu bilan parallel ishga tushadi
connectDB();

// 2. Global middlewarelar
app.use(cors());
// Barcha domainlardan so'rov qabul qiladi
// Production da: app.use(cors({ origin: 'https://yoursite.com' }))

app.use(express.json());
// JSON body ni parse qiladi → req.body da bo'ladi
// Content-Type: application/json bo'lganda ishlaydi

app.use(express.urlencoded({ extended: true }));
// Form data parse qiladi → req.body da bo'ladi
// Content-Type: application/x-www-form-urlencoded

// 3. Route ulash
app.use('/api/auth',   authRoutes);
app.use('/api/upload', uploadRoutes);

// 4. Health check
app.get('/', (req, res) => {
  res.json({ message: 'Server ishlayapti 🚀', port: PORT });
});

// 5. Ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server http://localhost:${PORT} da ishga tushdi`);
});
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ اتصال به دیتابیس با موفقیت برقرار شد'))
  .catch((err) => {
    console.error('❌ خطا در اتصال به دیتابیس:', err.message);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.json({ message: 'به API کتابخانه خوش آمدید!' });
});

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'مسیر مورد نظر یافت نشد' });
});

app.use((err, req, res, next) => {
  console.error('❌ خطای سرور:', err);
  res.status(err.status || 500).json({
    message: err.message || 'خطای سرور رخ داده است',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 سرور در پورت ${PORT} راه‌اندازی شد`);
});

module.exports = app;

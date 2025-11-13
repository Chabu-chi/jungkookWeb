// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';


import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

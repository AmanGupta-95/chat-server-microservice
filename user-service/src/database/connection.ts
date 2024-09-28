import mongoose from 'mongoose';
import config from '../config/config';

export const connectDB = async () => {
  try {
    console.log('Connecting to DB...', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI!);
    console.log('Connected to DB successfully');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

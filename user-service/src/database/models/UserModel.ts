import mongoose, { Document, Schema } from 'mongoose';
import validator from 'validator';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name must be provided'],
      minLength: 3,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    password: {
      type: String,
      trim: false,
      required: [true, 'Password must be provided'],
      minLength: 8,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', UserSchema);
export default User;

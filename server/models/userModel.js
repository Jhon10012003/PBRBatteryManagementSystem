// models/userModel.js
import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'operator'],
      default: 'operator'
    }
  },
  {
    timestamps: true
  }
);

// Simple password comparison
userSchema.methods.matchPassword = function (enteredPassword) {
  return this.password === enteredPassword;
};

const User = mongoose.model('User', userSchema);
export default User;
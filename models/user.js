import { Schema, model } from 'mongoose';

// Define the User Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures unique email addresses
    lowercase: true, // Converts email to lowercase before saving
  },
  role: {
    type: String,
    enum: ['Admin', 'Reviewer', 'Approver'],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Additional fields can be added if necessary, like profile picture, etc.
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the User model based on the schema
const User = model('User', userSchema);

export default User;


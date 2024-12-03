const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['Admin', 'Reviewer', 'Approver'], required: true },
    password: { type: String, required: true },
    // Additional fields can be added if necessary, like profile picture, etc.
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('demoCollection', userSchema);    

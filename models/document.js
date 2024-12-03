const mongoose = require('mongoose');

// Define the Document Schema
const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  reviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending', // Initial status is "Pending"
  },
  comments: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  signatures: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    signatureUrl: {
      type: String, // URL or data URL for the signature image
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the Document model based on the schema
const Document = mongoose.model('Document', documentSchema);

module.exports = Document;



// const documentSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     reviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     status: { type: String, required: true, enum: ['Pending Review', 'Approved', 'Rejected'] },
//     comments: [{ type: String }],
// });

// module.exports = mongoose.model('Document', documentSchema);

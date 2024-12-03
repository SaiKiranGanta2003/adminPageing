const Document = require('./models/Document');  // Assuming you have a Document model
const User = require('./models/User');  // Assuming you have a User model
const mongoose = require('mongoose');

// Function to upload a document
const uploadDocument = async (req, res) => {
  const { title, file, reviewers, approvers } = req.body;

  try {
    if (!file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    // Check if the reviewers and approvers are valid users
    const reviewersList = await User.find({ email: { $in: reviewers } });
    const approversList = await User.find({ email: { $in: approvers } });

    if (reviewersList.length !== reviewers.length) {
      return res.status(400).json({ error: 'Some reviewers are invalid' });
    }

    if (approversList.length !== 1) {
      return res.status(400).json({ error: 'There must be exactly one approver' });
    }

    // Create a new document entry
    const newDocument = new Document({
      title,
      file: file,  // You can store a link to the file or use a file storage service (e.g., Google Drive, AWS S3)
      reviewers: reviewersList.map(user => user._id),
      approver: approversList[0]._id,
      status: 'Pending',
      comments: [],
      signatures: [],
    });

    // Save the document to the database
    await newDocument.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: newDocument,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to update document status (approve/reject)
const updateDocumentStatus = async (req, res) => {
  const { documentId, status, comment, signature } = req.body;

  try {
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only the approver can update the status
    if (req.user._id.toString() !== document.approver.toString()) {
      return res.status(403).json({ error: 'You are not authorized to approve/reject this document' });
    }

    // Update document status and add comment/signature
    document.status = status;
    document.comments.push(comment);
    document.signatures.push(signature);

    await document.save();

    // If the document is approved, notify reviewers and admin (This can be handled later via email)
    if (status === 'Approved') {
      // Send notification logic (to be implemented)
    }

    res.status(200).json({
      message: 'Document status updated successfully',
      document,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to track documents and their statuses
const getDocumentTracking = async (req, res) => {
  try {
    const documents = await Document.find().populate('reviewers approver', 'email role');

    const documentTracking = documents.map(doc => ({
      title: doc.title,
      status: doc.status,
      reviewers: doc.reviewers.map(reviewer => ({
        email: reviewer.email,
        role: reviewer.role,
        status: doc.signatures.includes(reviewer._id) ? 'Signed' : 'Pending',
        comments: doc.comments.filter(comment => comment.reviewer.toString() === reviewer._id.toString()),
      })),
      approver: {
        email: doc.approver.email,
        role: doc.approver.role,
        status: doc.status === 'Approved' ? 'Approved' : 'Pending',
      },
    }));

    res.status(200).json({ documentTracking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to get document by ID
const getDocumentById = async (req, res) => {
  const { documentId } = req.params;

  try {
    const document = await Document.findById(documentId).populate('reviewers approver', 'email role');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({ document });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadDocument,
  updateDocumentStatus,
  getDocumentTracking,
  getDocumentById,
};


// const express = require('express');
// const Document = require('../models/document');
// const router = express.Router();

// // Upload Document
// router.post('/upload', async (req, res) => {
//     const { title, reviewers, approver } = req.body;

//     try {
//         const newDocument = new Document({ title, reviewers, approver, status: 'Pending Review' });
//         await newDocument.save();
//         res.status(201).json({ message: 'Document uploaded successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error uploading document' });
//     }
// });

// module.exports = router;

// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

app.post('/routes/documents', (req, res) => {
  console.log(req.body);
  res.json({ message: 'Document received successfully' });
});

app.listen(8080, () => console.log('Server is running on port 8080'));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define a schema for User, Document, and Comment

// User Schema (Admin, Reviewer, Approver)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['Admin', 'Reviewer', 'Approver'], required: true }
});
const User = mongoose.model('User', userSchema);

// Document Schema (for storing document info and status)
const documentSchema = new mongoose.Schema({
  name: String,
  file: String,
  reviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});
const Document = mongoose.model('Document', documentSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  text: String
});
const Comment = mongoose.model('Comment', commentSchema);

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Email setup using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route to create a new user (Admin)
app.post('/users', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const newUser = new User({ name, email, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// Route to upload a document and assign reviewers/approvers
app.post('/documents', upload.single('file'), async (req, res) => {
  const { reviewers, approver } = req.body;
  const { file } = req;

  try {
    const newDocument = new Document({
      name: file.originalname,
      file: file.path,
      reviewers: reviewers.map(id => mongoose.Types.ObjectId(id)),
      approver: mongoose.Types.ObjectId(approver),
    });
    await newDocument.save();

    // Send emails to reviewers and approvers
    sendDocumentEmails(reviewers, approver, newDocument);

    res.status(201).json(newDocument);
  } catch (err) {
    res.status(400).json({ error: 'Error uploading document' });
  }
});

// Route to submit a comment on a document
app.post('/documents/:id/comments', async (req, res) => {
  const { text, userId } = req.body;
  const { id } = req.params;

  try {
    const newComment = new Comment({ text, userId, documentId: id });
    await newComment.save();

    // Update document with new comment
    const document = await Document.findById(id);
    document.comments.push(newComment._id);
    await document.save();

    // Send email to admin about new comment (future integration)
    sendCommentNotification(userId, newComment, document);

    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: 'Error submitting comment' });
  }
});

// Route to approve or reject a document
app.post('/documents/:id/status', async (req, res) => {
  const { status, userId } = req.body;
  const { id } = req.params;

  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (status === 'Approved' || status === 'Rejected') {
      document.status = status;
      await document.save();

      // Notify approver about the status update
      sendStatusUpdateNotification(document, status);
      
      res.status(200).json(document);
    } else {
      res.status(400).json({ error: 'Invalid status' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Error updating document status' });
  }
});

// Helper function to send emails to reviewers and approvers
function sendDocumentEmails(reviewers, approver, document) {
  // Send email to all reviewers
  reviewers.forEach(email => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Document for Review',
      text: `You have been assigned a document for review. Please review and sign it at the following link: /reviewer/${document._id}`
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error(err);
      else console.log(`Email sent to reviewer: ${email}`);
    });
  });

  // Send email to approver
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: approver,
    subject: 'Document for Approval',
    text: `You have been assigned a document for approval. Please review and approve/reject it at the following link: /approver/${document._id}`
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err);
    else console.log(`Email sent to approver: ${approver}`);
  });
}

// Helper function to send email when a comment is submitted
function sendCommentNotification(userId, comment, document) {
  User.findById(userId, (err, user) => {
    if (err) console.error(err);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Comment on Document ${document.name}`,
      text: `${user.name} has submitted a comment: "${comment.text}" on document: ${document.name}.`
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error(err);
      else console.log('Admin notified about new comment');
    });
  });
}

// Helper function to send email when document status is updated
function sendStatusUpdateNotification(document, status) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `Document ${document.name} Status Updated`,
    text: `The document "${document.name}" has been ${status}.`
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err);
    else console.log('Admin notified about status update');
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');

// Initialize Express app
// const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Set the port
// const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const documentRoutes = require('./routes/documents');
// const notificationRoutes = require('./routes/notifications');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/notifications', notificationRoutes);

// // Connect to MongoDB Atlas
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB Atlas'))
//     .catch(err => console.error('Database connection error:', err));

// // Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

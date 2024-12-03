// Get references to the DOM elements
const commentInput = document.getElementById('comment');
const submitButton = document.getElementById('submitButton');
const successMessage = document.getElementById('successMessage');
const commentSection = document.getElementById('commentSection');
const signatureInput = document.getElementById('signature');
const approvalButton = document.getElementById('approvalButton');
const rejectionButton = document.getElementById('rejectionButton');

// Event listener for comment submission
submitButton.addEventListener('click', function () {
  const commentText = commentInput.value.trim();
  
  // Check if comment is not empty
  if (commentText === "") {
    alert("Please enter a comment before submitting.");
    return;
  }

  // Append the comment to the comment section
  const newComment = document.createElement('p');
  newComment.textContent = commentText;
  commentSection.appendChild(newComment);

  // Reset the comment input field
  commentInput.value = "";

  // Display success message
  successMessage.style.display = "block";
  successMessage.textContent = "Your comment has been submitted.";

  // Simulate saving the comment and sending it to the admin (future integration)
  console.log("Comment submitted: ", commentText);
});

// Event listener for approving the document
approvalButton.addEventListener('click', function () {
  const signature = signatureInput.value.trim();
  
  // Check if the signature is provided
  if (signature === "") {
    alert("Please upload your signature before approving the document.");
    return;
  }

  // Change document status to "Approved" and update the admin
  alert("The document has been approved. Sending approval status...");

  // Simulate sending approval to the admin (future integration)
  console.log("Document approved with signature: ", signature);

  // Optionally, send an email to the admin (future email API integration)
  // sendApprovalEmail();
});

// Event listener for rejecting the document
rejectionButton.addEventListener('click', function () {
  const signature = signatureInput.value.trim();
  
  // Check if the signature is provided
  if (signature === "") {
    alert("Please upload your signature before rejecting the document.");
    return;
  }

  // Change document status to "Rejected" and update the admin
  alert("The document has been rejected. Sending rejection status...");

  // Simulate sending rejection to the admin (future integration)
  console.log("Document rejected with signature: ", signature);

  // Optionally, send an email to the admin (future email API integration)
  // sendRejectionEmail();
});

// Function to send approval email (future API integration)
function sendApprovalEmail() {
  // Implement the code to send an approval email to the admin
  console.log("Sending approval email to the admin...");
}

// Function to send rejection email (future API integration)
function sendRejectionEmail() {
  // Implement the code to send a rejection email to the admin
  console.log("Sending rejection email to the admin...");
}

// Reset the form (if required after document approval/rejection)
function resetForm() {
  commentInput.value = "";
  signatureInput.value = "";
  successMessage.style.display = "none";
  commentSection.innerHTML = "";
}

// You can call resetForm() if needed after approval or rejection
// resetForm();  // Uncomment to reset the form after processing


// const createToken = (user) => {
//     const payload = { userId: user._id }; // Include user data in the payload
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Sign the token with JWT secret
//     return token;
//   }

//   const verifyToken = (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token
//       return decoded; // If valid, return decoded data (user info)
//     } catch (error) {
//       throw new Error('Invalid or expired token');
//     }
//   }
//   const jwtMiddleware = (req, res, next) => {
//     const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
  
//     if (!token) {
//       return res.status(403).json({ message: 'Access Denied' }); // If no token is provided
//     }
  
//     try {
//       const decoded = verifyToken(token); // Verify the token
//       req.user = decoded; // Attach user data to the request object
//       next(); // Call the next middleware or route handler
//     } catch (error) {
//       res.status(401).json({ message: 'Invalid or expired token' }); // Handle invalid token
//     }
//   }
//   app.get('/protected-route', jwtMiddleware, (req, res) => {
//     res.json({ message: 'You have access to this protected route!', user: req.user });
//   });
      
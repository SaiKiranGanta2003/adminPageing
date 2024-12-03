const express = require('express');
const jwtMiddleware = require('./jwtMiddleware');
const app = express();
const cors = require('cors');

app.use(express.json());

app.use(cors());
app.get('/protected-route', jwtMiddleware, (req, res) => {
  res.json({ message: 'You have access to this protected route!', user: req.user });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

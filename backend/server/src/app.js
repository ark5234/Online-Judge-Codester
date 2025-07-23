require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { authenticateJWT } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/auth', require('./api/auth/routes'));
app.use('/api/problems', require('./api/problems/routes'));
app.use('/api/submissions', require('./api/submissions/routes'));
app.use('/api/admin', authenticateJWT, require('./api/admin/routes'));

app.listen(5000, () => console.log('Server running on port 5000')); 
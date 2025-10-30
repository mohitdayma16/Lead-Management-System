require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_test_db';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log('Server started on port', PORT));
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
});

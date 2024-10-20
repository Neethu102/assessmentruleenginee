const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ruleRoutes = require('./routes/ruleRoutes');
const cors = require('cors');
// Load environment variables (if using a .env file)
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Connect to MongoDB
mongoose.connect("mongodb+srv://root:root@cluster0.daz9d.mongodb.net/rule", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api', ruleRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

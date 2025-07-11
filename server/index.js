const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const importRoutes = require('./routes/importRoutes');
const scheduleJobImport = require('./jobs/scheduler');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
const server = http.createServer(app); // Create HTTP server for socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // You can restrict this to your frontend origin in production
  },
});

global.io = io; // ✅ Make io globally accessible to worker or controllers

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', importRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.send('✔️ Test route working');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected');

    // Start cron job after DB is connected
    scheduleJobImport();

    // Start server with Socket.IO
    server.listen(PORT, () => {
      console.log(`🚀 Server running with Socket.IO on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
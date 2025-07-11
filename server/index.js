const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const importRoutes = require('./routes/importRoutes');
const scheduleJobImport = require('./jobs/scheduler');

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO with the correct server
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://job-importer-8wbhmry13-gshivanshu5s-projects.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Make io globally accessible (for jobWorker or controllers if needed)
global.io = io;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://job-importer-8wbhmry13-gshivanshu5s-projects.vercel.app'
  ],
  credentials: true,
}));
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

    // ✅ Start server with Socket.IO
    server.listen(PORT, () => {
      console.log(`🚀 Server running with Socket.IO on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

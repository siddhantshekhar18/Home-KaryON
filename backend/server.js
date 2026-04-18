const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const initChatSocket = require('./socket/chatSocket');
const seedDemoData = require('./seed/demoData');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);
let dbStatus = {
  connected: false,
  mode: 'unknown',
  uri: null,
  host: null
};
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/faq', require('./routes/faq'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

initChatSocket(io);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'KaryON API is running',
    database: {
      connected: dbStatus.connected,
      mode: dbStatus.mode,
      host: dbStatus.host
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    dbStatus = await connectDB();

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Update PORT in backend/.env and restart.`);
        process.exit(1);
      }
      console.error('Server runtime error:', error.message);
      process.exit(1);
    });

    // Seed demo data when running in embedded mode or when SEED_DEMO=true
    if (dbStatus.connected && (dbStatus.mode === 'embedded' || process.env.SEED_DEMO === 'true')) {
      await seedDemoData();
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (dbStatus.mode === 'external' && !process.env.MONGODB_URI) {
        console.log('MONGODB_URI not set. Using default local MongoDB at mongodb://127.0.0.1:27017/karyon_data');
      }
      if (dbStatus.mode === 'embedded') {
        console.log('Database mode: embedded MongoDB (portable demo mode)');
      } else if (dbStatus.mode === 'external') {
        console.log(`Database mode: external MongoDB (${dbStatus.host})`);
      } else {
        console.log('Database mode: skipped');
      }
    });
  } catch (error) {
    console.error('Startup failed. Unable to initialize backend.', error.message);
    process.exit(1);
  }
};

startServer();

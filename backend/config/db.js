const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServerInstance = null;

const connectWithUri = async (mongoUri) => {
  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000
  });

  return {
    connected: true,
    mode: 'external',
    uri: mongoUri,
    host: conn.connection.host
  };
};

const startEmbeddedMongo = async () => {
  memoryServerInstance = await MongoMemoryServer.create({
    instance: {
      dbName: process.env.EMBEDDED_DB_NAME || 'karyon_demo'
    }
  });

  const memoryUri = memoryServerInstance.getUri();
  const conn = await mongoose.connect(memoryUri, {
    serverSelectionTimeoutMS: 5000
  });

  return {
    connected: true,
    mode: 'embedded',
    uri: memoryUri,
    host: conn.connection.host
  };
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karyon_data';
  const forceEmbedded = process.env.USE_EMBEDDED_DB === 'true';

  if (process.env.SKIP_DB === 'true') {
    console.warn('SKIP_DB=true detected. Starting server without database connection.');
    return {
      connected: false,
      mode: 'skipped',
      uri: null,
      host: null
    };
  }

  if (!forceEmbedded) {
    try {
      const connection = await connectWithUri(mongoUri);
      console.log(`MongoDB Connected: ${connection.host}`);
      return connection;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);

      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_EMBEDDED_DB !== 'true') {
        throw error;
      }

      console.warn('Falling back to embedded MongoDB so the project can run without a local MongoDB installation.');
    }
  }

  const embeddedConnection = await startEmbeddedMongo();
  console.log('Embedded MongoDB started for local/demo use.');
  return embeddedConnection;
};

process.on('SIGINT', async () => {
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
});

process.on('SIGTERM', async () => {
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
});

module.exports = connectDB;

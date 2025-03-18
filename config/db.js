const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      maxPoolSize: 10, // Limit connection pool size
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    // Retry connection after delay instead of exiting
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = connectDB;
import mongoose from 'mongoose';

// Add interface for global namespace
declare global {
  var mongooseConnection: {
    isConnected?: number;
    promise?: Promise<typeof mongoose>;
    connectionAttempts?: number;
  };
}

// Initialize global object
if (!global.mongooseConnection) {
  global.mongooseConnection = {
    connectionAttempts: 0
  };
}

/**
 * Connect to MongoDB database
 */
async function dbConnect() {
  const MONGODB_URI = process.env.MONGO_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }

  // If the connection is already established, return the existing connection
  if (global.mongooseConnection.isConnected === 1) {
    return mongoose;
  }

  // If a connection is being established, wait for it to complete
  if (global.mongooseConnection.promise) {
    try {
      await global.mongooseConnection.promise;
      global.mongooseConnection.isConnected = mongoose.connections[0].readyState;
      console.log('Using existing MongoDB connection');
      // Reset attempts counter on successful connection
      global.mongooseConnection.connectionAttempts = 0;
      return mongoose;
    } catch (error) {
      // If connection fails, reset the promise to try again next time
      global.mongooseConnection.promise = undefined;
      // Increment connection attempts
      global.mongooseConnection.connectionAttempts = (global.mongooseConnection.connectionAttempts || 0) + 1;
      console.error(`MongoDB connection attempt ${global.mongooseConnection.connectionAttempts} failed:`, error);
      throw error;
    }
  }

  // No existing connection, so create a new one
  try {
    // Increment connection attempts
    global.mongooseConnection.connectionAttempts = (global.mongooseConnection.connectionAttempts || 0) + 1;
    console.log(`Connecting to MongoDB (attempt ${global.mongooseConnection.connectionAttempts})...`);
    
    const opts = {
      bufferCommands: false,
      // Add these options for more reliable connections
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    global.mongooseConnection.promise = mongoose.connect(MONGODB_URI, opts);
    await global.mongooseConnection.promise;
    
    global.mongooseConnection.isConnected = mongoose.connections[0].readyState;
    console.log('MongoDB connected successfully');
    
    // Reset attempts counter on successful connection
    global.mongooseConnection.connectionAttempts = 0;
    
    return mongoose;
  } catch (error) {
    global.mongooseConnection.promise = undefined;
    console.error(`MongoDB connection attempt ${global.mongooseConnection.connectionAttempts} failed:`, error);
    throw error;
  }
}

export default dbConnect;
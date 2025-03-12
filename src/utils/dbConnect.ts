import mongoose from 'mongoose';

// Add interface for global namespace
declare global {
  var mongooseConnection: {
    isConnected?: number;
    promise?: Promise<typeof mongoose>;
  };
}

// Initialize global object
if (!global.mongooseConnection) {
  global.mongooseConnection = {};
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
      return mongoose;
    } catch (error) {
      // If connection fails, reset the promise to try again next time
      global.mongooseConnection.promise = undefined;
      throw error;
    }
  }

  // No existing connection, so create a new one
  try {
    const opts = {
      bufferCommands: false,
    };

    global.mongooseConnection.promise = mongoose.connect(MONGODB_URI, opts);
    await global.mongooseConnection.promise;
    
    global.mongooseConnection.isConnected = mongoose.connections[0].readyState;
    return mongoose;
  } catch (error) {
    global.mongooseConnection.promise = undefined;
    throw error;
  }
}

export default dbConnect;
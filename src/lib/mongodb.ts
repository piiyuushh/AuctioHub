import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var mongoose: any
}

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
  try {
    // If already connected, return the connection
    if (cached.conn) {
      console.log('✅ Using existing MongoDB connection')
      return cached.conn
    }

    // If no cached promise, create a new connection
    if (!cached.promise) {
      console.log('🔌 Creating new MongoDB connection...')
      console.log('🔍 MongoDB URI exists:', !!MONGODB_URI)
      console.log('🔍 MongoDB URI prefix:', MONGODB_URI.substring(0, 20) + '...')
      
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      }

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ MongoDB connected successfully')
        return mongoose
      }).catch((error) => {
        console.error('❌ MongoDB connection failed:', error)
        cached.promise = null
        throw error
      })
    }

    console.log('⏳ Waiting for MongoDB connection...')
    cached.conn = await cached.promise
    console.log('✅ MongoDB connection established')
    
    return cached.conn
  } catch (error) {
    console.error('❌ MongoDB connection error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      uri: MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'NOT SET'
    })
    
    // Clear the cached promise so next attempt will retry
    cached.promise = null
    throw error
  }
}

export default connectToDatabase

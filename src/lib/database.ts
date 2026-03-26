import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  throw new Error(
    'Please define the DATABASE_URL environment variable inside .env.local'
  )
}

// Create PostgreSQL connection pool
let pool: Pool

function getSslConfig() {
  try {
    const hostname = new URL(DATABASE_URL).hostname
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'
    return isLocalHost ? false : { rejectUnauthorized: false }
  } catch {
    return { rejectUnauthorized: false }
  }
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: getSslConfig()
  })
} else {
  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: getSslConfig()
    })
  }
  pool = global.pgPool
}

async function connectToDatabase() {
  try {
    // Test the connection
    await pool.query('SELECT NOW()')
    console.log('PostgreSQL connected successfully')
    return pool
  } catch (error) {
    console.error('PostgreSQL connection error:', error)
    throw error
  }
}

export { pool }
export default connectToDatabase

import { pool } from './database'

/* eslint-disable @typescript-eslint/no-explicit-any */

// TypeScript Interfaces
export interface IUser {
  _id?: string
  id?: string
  googleId?: string
  email: string
  name?: string
  image?: string
  role: 'USER' | 'ADMIN'
  createdAt?: Date
  updatedAt?: Date
}

export interface ICarouselImage {
  _id?: string
  id?: string
  url: string
  altText?: string
  order: number
  isActive: boolean
  cloudinary_public_id?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface INewArrival {
  _id?: string
  id?: string
  title: string
  description: string
  imageUrl: string
  link: string
  order: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IAdminSetting {
  _id?: string
  id?: string
  key: string
  value: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IProduct {
  _id?: string
  id?: string
  userId: string
  userEmail: string
  title: string
  description: string
  imageUrl: string
  category: 'electronics' | 'collectibles' | 'luxury goods' | 'real estate and property' | 'furniture'
  cloudinary_public_id?: string | null
  isActive?: boolean
  hasAuction?: boolean
  auctionEndTime?: Date | null
  startingBid?: number
  currentBid?: number
  highestBidder?: string | null
  highestBidderEmail?: string | null
  totalBids?: number
  auctionStatus?: 'active' | 'ended' | 'none'
  createdAt?: Date
  updatedAt?: Date
  save?: () => Promise<void>
}

export interface IBid {
  _id?: string
  id?: string
  productId: string
  userId: string
  userEmail: string
  bidAmount: number
  isWinning?: boolean
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IChatMessage {
  _id?: string
  id?: string
  productId: string
  userId: string
  userEmail: string
  userImage?: string | null
  message: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IAuctionHistory {
  _id?: string
  id?: string
  productId: string
  productTitle: string
  productImageUrl?: string | null
  productCategory?: string | null
  sellerUserId?: string | null
  sellerEmail?: string | null
  conductedAt?: Date
  auctionEndTime?: Date | null
  winnerUserId?: string | null
  winnerEmail?: string | null
  winningBidAmount: number
  paymentType: 'full' | 'penalty'
  outcomeStatus: 'completed' | 'penalty_paid' | 'relisted'
  createdAt?: Date
  updatedAt?: Date
}

export interface IAuctionParticipantBan {
  _id?: string
  id?: string
  productId: string
  userId: string
  userEmail: string
  bannedByEmail: string
  reason?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface INotificationEvent {
  _id?: string
  id?: string
  eventType: string
  productId?: string | null
  recipientUserId?: string | null
  title: string
  description?: string | null
  severity: 'info' | 'success' | 'warning' | 'destructive'
  actionUrl?: string | null
  metadata?: Record<string, unknown>
  dedupeKey?: string | null
  createdAt?: Date
  expiresAt?: Date | null
}

// Helper: Map DB row to User interface
function mapToUser(row: any): IUser {
  return {
    _id: row.id,
    id: row.id,
    googleId: row.google_id,
    email: row.email,
    name: row.name,
    image: row.image,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

// Helper: Map DB row to Product interface
function mapToProduct(row: any): IProduct {
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    cloudinary_public_id: row.cloudinary_public_id,
    isActive: row.is_active,
    hasAuction: row.has_auction,
    auctionEndTime: row.auction_end_time,
    startingBid: parseFloat(row.starting_bid),
    currentBid: parseFloat(row.current_bid),
    highestBidder: row.highest_bidder,
    highestBidderEmail: row.highest_bidder_email,
    totalBids: row.total_bids,
    auctionStatus: row.auction_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapToAuctionHistory(row: any): IAuctionHistory {
  return {
    _id: row.id,
    id: row.id,
    productId: row.product_id,
    productTitle: row.product_title,
    productImageUrl: row.product_image_url,
    productCategory: row.product_category,
    sellerUserId: row.seller_user_id,
    sellerEmail: row.seller_email,
    conductedAt: row.conducted_at,
    auctionEndTime: row.auction_end_time,
    winnerUserId: row.winner_user_id,
    winnerEmail: row.winner_email,
    winningBidAmount: parseFloat(row.winning_bid_amount),
    paymentType: row.payment_type,
    outcomeStatus: row.outcome_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapToAuctionParticipantBan(row: any): IAuctionParticipantBan {
  return {
    _id: row.id,
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userEmail: row.user_email,
    bannedByEmail: row.banned_by_email,
    reason: row.reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapToNotificationEvent(row: any): INotificationEvent {
  return {
    _id: row.id,
    id: row.id,
    eventType: row.event_type,
    productId: row.product_id,
    recipientUserId: row.recipient_user_id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    actionUrl: row.action_url,
    metadata: row.metadata || {},
    dedupeKey: row.dedupe_key,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }
}

// ==================== USER MODEL ====================
export const User = {
  async findOne(query: any): Promise<IUser | null> {
    let sql = 'SELECT * FROM users WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.email) {
      if (query.email.$regex) {
        sql += ` AND email ILIKE $${paramCount}`
        params.push(`%${query.email.$regex.source.replace(/\^|\$/g, '')}%`)
      } else {
        sql += ` AND email = $${paramCount}`
        params.push(query.email)
      }
      paramCount++
    }
    if (query.googleId) {
      sql += ` AND google_id = $${paramCount}`
      params.push(query.googleId)
      paramCount++
    }

    sql += ' LIMIT 1'

    const result = await pool.query(sql, params)
    return result.rows.length > 0 ? mapToUser(result.rows[0]) : null
  },

  async findById(id: string): Promise<IUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows.length > 0 ? mapToUser(result.rows[0]) : null
  },

  async find(query: any = {}): Promise<IUser[]> {
    let sql = 'SELECT * FROM users WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.role) {
      sql += ` AND role = $${paramCount}`
      params.push(query.role)
      paramCount++
    }

    sql += ' ORDER BY created_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(mapToUser)
  },

  async create(userData: Partial<IUser>): Promise<IUser> {
    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, image, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        userData.googleId || null,
        userData.email,
        userData.name || '',
        userData.image || '',
        userData.role || 'USER'
      ]
    )
    return mapToUser(result.rows[0])
  },

  async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<IUser | null> {
    const existing = await this.findOne(query)

    if (!existing && options.upsert) {
      const newUser: Partial<IUser> = {
        email: query.email,
        ...update.$set,
        ...update.$setOnInsert
      }
      return await this.create(newUser)
    }

    if (!existing) return null

    const updates: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (update.$set) {
      if (update.$set.googleId !== undefined) {
        updates.push(`google_id = $${paramCount}`)
        params.push(update.$set.googleId)
        paramCount++
      }
      if (update.$set.name !== undefined) {
        updates.push(`name = $${paramCount}`)
        params.push(update.$set.name)
        paramCount++
      }
      if (update.$set.image !== undefined) {
        updates.push(`image = $${paramCount}`)
        params.push(update.$set.image)
        paramCount++
      }
      if (update.$set.role !== undefined) {
        updates.push(`role = $${paramCount}`)
        params.push(update.$set.role)
        paramCount++
      }
    }

    if (updates.length === 0) return existing

    params.push(existing.id)
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(sql, params)
    return mapToUser(result.rows[0])
  },

  async updateMany(query: any, update: any): Promise<void> {
    const updates: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (update.$set) {
      if (update.$set.role !== undefined) {
        updates.push(`role = $${paramCount}`)
        params.push(update.$set.role)
        paramCount++
      }
    }

    if (update.$unset) {
      if (update.$unset.googleId) {
        updates.push('google_id = NULL')
      }
    }

    if (updates.length === 0) return

    let where = 'WHERE 1=1'
    if (query.googleId) {
      where += ` AND google_id = $${paramCount}`
      params.push(query.googleId)
      paramCount++
    }
    if (query.email?.$ne) {
      where += ` AND email != $${paramCount}`
      params.push(query.email.$ne)
      paramCount++
    }

    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP ${where}`
    await pool.query(sql, params)
  },

  async findByIdAndUpdate(id: string, updates: any): Promise<IUser | null> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (updates.role) {
      updateFields.push(`role = $${paramCount}`)
      params.push(updates.role)
      paramCount++
    }
    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramCount}`)
      params.push(updates.name)
      paramCount++
    }
    if (updates.image !== undefined) {
      updateFields.push(`image = $${paramCount}`)
      params.push(updates.image)
      paramCount++
    }

    if (updateFields.length === 0) return null

    params.push(id)
    const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(sql, params)
    return result.rows.length > 0 ? mapToUser(result.rows[0]) : null
  },

  async findByIdAndDelete(id: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [id])
  },

  async countDocuments(query: any = {}): Promise<number> {
    let sql = 'SELECT COUNT(*) FROM users WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.role) {
      sql += ` AND role = $${paramCount}`
      params.push(query.role)
      paramCount++
    }

    const result = await pool.query(sql, params)
    return parseInt(result.rows[0].count)
  }
}

// ==================== CAROUSEL IMAGE MODEL ====================
export const CarouselImage = {
  async find(query: any = {}): Promise<ICarouselImage[]> {
    let sql = 'SELECT * FROM carousel_images WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    sql += ' ORDER BY "order"'

    const result = await pool.query(sql, params)
    return result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      url: row.url,
      altText: row.alt_text,
      order: row.order,
      isActive: row.is_active,
      cloudinary_public_id: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  async findById(id: string): Promise<ICarouselImage | null> {
    const result = await pool.query('SELECT * FROM carousel_images WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      url: row.url,
      altText: row.alt_text,
      order: row.order,
      isActive: row.is_active,
      cloudinary_public_id: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async create(data: Partial<ICarouselImage>): Promise<ICarouselImage> {
    const result = await pool.query(
      `INSERT INTO carousel_images (url, alt_text, "order", is_active, cloudinary_public_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.url, data.altText || '', data.order || 0, data.isActive !== false, data.cloudinary_public_id || null]
    )
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      url: row.url,
      altText: row.alt_text,
      order: row.order,
      isActive: row.is_active,
      cloudinary_public_id: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async findByIdAndUpdate(id: string, updates: any): Promise<ICarouselImage | null> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (updates.url) {
      updateFields.push(`url = $${paramCount}`)
      params.push(updates.url)
      paramCount++
    }
    if (updates.altText !== undefined) {
      updateFields.push(`alt_text = $${paramCount}`)
      params.push(updates.altText)
      paramCount++
    }
    if (updates.order !== undefined) {
      updateFields.push(`"order" = $${paramCount}`)
      params.push(updates.order)
      paramCount++
    }
    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount}`)
      params.push(updates.isActive)
      paramCount++
    }
    if (updates.cloudinary_public_id !== undefined) {
      updateFields.push(`cloudinary_public_id = $${paramCount}`)
      params.push(updates.cloudinary_public_id)
      paramCount++
    }

    if (updateFields.length === 0) return null

    params.push(id)
    const sql = `UPDATE carousel_images SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      url: row.url,
      altText: row.alt_text,
      order: row.order,
      isActive: row.is_active,
      cloudinary_public_id: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async findByIdAndDelete(id: string): Promise<void> {
    await pool.query('DELETE FROM carousel_images WHERE id = $1', [id])
  },

  async deleteMany(query: any): Promise<void> {
    if (query.cloudinary_public_id) {
      await pool.query('DELETE FROM carousel_images WHERE cloudinary_public_id = $1', [query.cloudinary_public_id])
    }
  },

  async findOne(query: any): Promise<ICarouselImage | null> {
    let sql = 'SELECT * FROM carousel_images WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.url) {
      sql += ` AND url = $${paramCount}`
      params.push(query.url)
      paramCount++
    }
    if (query.order !== undefined) {
      sql += ` AND "order" = $${paramCount}`
      params.push(query.order)
      paramCount++
    }
    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    sql += ' LIMIT 1'

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      url: row.url,
      altText: row.alt_text,
      order: row.order,
      isActive: row.is_active,
      cloudinary_public_id: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async countDocuments(query: any = {}): Promise<number> {
    let sql = 'SELECT COUNT(*) FROM carousel_images WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    const result = await pool.query(sql, params)
    return parseInt(result.rows[0].count)
  },

  async insertMany(items: Partial<ICarouselImage>[]): Promise<ICarouselImage[]> {
    const results: ICarouselImage[] = []
    for (const item of items) {
      const created = await this.create(item)
      results.push(created)
    }
    return results
  },

  async updateMany(query: any, update: any): Promise<void> {
    const updates: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (update.$inc?.order) {
      updates.push(`"order" = "order" + $${paramCount}`)
      params.push(update.$inc.order)
      paramCount++
    }
    if (update.$set?.isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`)
      params.push(update.$set.isActive)
      paramCount++
    }

    if (updates.length === 0) return

    let where = 'WHERE 1=1'
    if (query.order?.$gt !== undefined) {
      where += ` AND "order" > $${paramCount}`
      params.push(query.order.$gt)
      paramCount++
    }

    const sql = `UPDATE carousel_images SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP ${where}`
    await pool.query(sql, params)
  },

  lean() { return this }
}

// ==================== NEW ARRIVAL MODEL ====================
export const NewArrival = {
  async find(query: any = {}): Promise<INewArrival[]> {
    let sql = 'SELECT * FROM new_arrivals WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    sql += ' ORDER BY "order"'

    const result = await pool.query(sql, params)
    return result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      link: row.link,
      order: row.order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  async findById(id: string): Promise<INewArrival | null> {
    const result = await pool.query('SELECT * FROM new_arrivals WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      link: row.link,
      order: row.order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async create(data: Partial<INewArrival>): Promise<INewArrival> {
    const result = await pool.query(
      `INSERT INTO new_arrivals (title, description, image_url, link, "order", is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.title, data.description, data.imageUrl, data.link || '/category', data.order || 0, data.isActive !== false]
    )
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      link: row.link,
      order: row.order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async findByIdAndUpdate(id: string, updates: any): Promise<INewArrival | null> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (updates.title) {
      updateFields.push(`title = $${paramCount}`)
      params.push(updates.title)
      paramCount++
    }
    if (updates.description) {
      updateFields.push(`description = $${paramCount}`)
      params.push(updates.description)
      paramCount++
    }
    if (updates.imageUrl) {
      updateFields.push(`image_url = $${paramCount}`)
      params.push(updates.imageUrl)
      paramCount++
    }
    if (updates.link) {
      updateFields.push(`link = $${paramCount}`)
      params.push(updates.link)
      paramCount++
    }
    if (updates.order !== undefined) {
      updateFields.push(`"order" = $${paramCount}`)
      params.push(updates.order)
      paramCount++
    }
    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount}`)
      params.push(updates.isActive)
      paramCount++
    }

    if (updateFields.length === 0) return null

    params.push(id)
    const sql = `UPDATE new_arrivals SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      link: row.link,
      order: row.order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async findByIdAndDelete(id: string): Promise<void> {
    await pool.query('DELETE FROM new_arrivals WHERE id = $1', [id])
  },

  async deleteMany(): Promise<void> {
    await pool.query('DELETE FROM new_arrivals')
  },

  async findOne(query: any = {}): Promise<INewArrival | null> {
    let sql = 'SELECT * FROM new_arrivals WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.title) {
      sql += ` AND title = $${paramCount}`
      params.push(query.title)
      paramCount++
    }
    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    sql += ' ORDER BY "order" DESC LIMIT 1'

    const result = await pool.query(sql, params)
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      link: row.link,
      order: row.order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async countDocuments(query: any = {}): Promise<number> {
    let sql = 'SELECT COUNT(*) FROM new_arrivals WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    const result = await pool.query(sql, params)
    return parseInt(result.rows[0].count)
  },

  async insertMany(items: Partial<INewArrival>[]): Promise<INewArrival[]> {
    const results: INewArrival[] = []
    for (const item of items) {
      const created = await this.create(item)
      results.push(created)
    }
    return results
  },

  lean() { return this }
}

// ==================== ADMIN SETTING MODEL ====================
export const AdminSetting = {
  async findOne(query: any): Promise<IAdminSetting | null> {
    const result = await pool.query('SELECT * FROM admin_settings WHERE key = $1', [query.key])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      key: row.key,
      value: row.value,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<IAdminSetting | null> {
    const existing = await this.findOne(query)

    if (!existing && options.upsert) {
      const result = await pool.query(
        'INSERT INTO admin_settings (key, value) VALUES ($1, $2) RETURNING *',
        [query.key, update.$set.value]
      )
      const row = result.rows[0]
      return {
        _id: row.id,
        id: row.id,
        key: row.key,
        value: row.value,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    }

    if (!existing) return null

    const result = await pool.query(
      'UPDATE admin_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [update.$set.value, existing.id]
    )
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      key: row.key,
      value: row.value,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

let productCategoryBootstrapPromise: Promise<void> | null = null

async function ensureProductCategorySupport(): Promise<void> {
  if (!productCategoryBootstrapPromise) {
    productCategoryBootstrapPromise = (async () => {
      await pool.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS category VARCHAR(64);

        UPDATE products
        SET category = 'collectibles'
        WHERE category IS NULL OR TRIM(category) = '';

        UPDATE products SET category = 'luxury goods' WHERE category = 'luxuty goods';
        UPDATE products SET category = 'furniture' WHERE category = 'furnitures';

        UPDATE products
        SET category = 'collectibles'
        WHERE category NOT IN (
          'electronics',
          'collectibles',
          'luxury goods',
          'real estate and property',
          'furniture'
        );

        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'products_category_check'
              AND conrelid = 'products'::regclass
          ) THEN
            ALTER TABLE products
              ADD CONSTRAINT products_category_check
              CHECK (category IN (
                'electronics',
                'collectibles',
                'luxury goods',
                'real estate and property',
                'furniture'
              ));
          END IF;
        END $$;

        ALTER TABLE products
        ALTER COLUMN category SET NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      `)
    })().catch((error) => {
      productCategoryBootstrapPromise = null
      throw error
    })
  }

  await productCategoryBootstrapPromise
}

// ==================== PRODUCT MODEL ====================
export const Product = {
  async find(query: any = {}): Promise<IProduct[]> {
    await ensureProductCategorySupport()

    let sql = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.userId) {
      sql += ` AND user_id = $${paramCount}`
      params.push(query.userId)
      paramCount++
    }
    if (query.userEmail) {
      sql += ` AND user_email = $${paramCount}`
      params.push(query.userEmail)
      paramCount++
    }
    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }
    if (query.hasAuction !== undefined) {
      sql += ` AND has_auction = $${paramCount}`
      params.push(query.hasAuction)
      paramCount++
    }
    if (query.auctionStatus) {
      sql += ` AND auction_status = $${paramCount}`
      params.push(query.auctionStatus)
      paramCount++
    }
    if (query.category) {
      sql += ` AND category = $${paramCount}`
      params.push(query.category)
      paramCount++
    }
    if (query.search) {
      sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`
      params.push(`%${query.search}%`)
      paramCount++
    }

    sql += ' ORDER BY created_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(mapToProduct)
  },

  async findById(id: string): Promise<IProduct | null> {
    await ensureProductCategorySupport()

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    
    const product = mapToProduct(result.rows[0])
    
    // Add save method
    product.save = async function() {
      const updateFields: string[] = []
      const params: any[] = []
      let paramCount = 1

      if (this.title) {
        updateFields.push(`title = $${paramCount}`)
        params.push(this.title)
        paramCount++
      }
      if (this.description) {
        updateFields.push(`description = $${paramCount}`)
        params.push(this.description)
        paramCount++
      }
      if (this.imageUrl) {
        updateFields.push(`image_url = $${paramCount}`)
        params.push(this.imageUrl)
        paramCount++
      }
      if (this.category) {
        updateFields.push(`category = $${paramCount}`)
        params.push(this.category)
        paramCount++
      }
      if (this.cloudinary_public_id !== undefined) {
        updateFields.push(`cloudinary_public_id = $${paramCount}`)
        params.push(this.cloudinary_public_id)
        paramCount++
      }
      if (this.auctionStatus) {
        updateFields.push(`auction_status = $${paramCount}`)
        params.push(this.auctionStatus)
        paramCount++
      }
      if (this.auctionEndTime) {
        updateFields.push(`auction_end_time = $${paramCount}`)
        params.push(this.auctionEndTime)
        paramCount++
      }

      if (updateFields.length > 0) {
        params.push(this.id)
        const sql = `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`
        await pool.query(sql, params)
      }
    }

    return product
  },

  async create(data: Partial<IProduct>): Promise<IProduct> {
    await ensureProductCategorySupport()

    const result = await pool.query(
      `INSERT INTO products (
        user_id, user_email, title, description, image_url, category, cloudinary_public_id,
        is_active, has_auction, auction_end_time, starting_bid, current_bid,
        highest_bidder, highest_bidder_email, total_bids, auction_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        data.userId,
        data.userEmail,
        data.title,
        data.description,
        data.imageUrl,
        data.category,
        data.cloudinary_public_id || null,
        data.isActive !== false,
        data.hasAuction || false,
        data.auctionEndTime || null,
        data.startingBid || 0,
        data.currentBid || 0,
        data.highestBidder || null,
        data.highestBidderEmail || null,
        data.totalBids || 0,
        data.auctionStatus || 'none'
      ]
    )
    return mapToProduct(result.rows[0])
  },

  async findByIdAndUpdate(id: string, updates: any): Promise<IProduct | null> {
    await ensureProductCategorySupport()

    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (updates.title) {
      updateFields.push(`title = $${paramCount}`)
      params.push(updates.title)
      paramCount++
    }
    if (updates.description) {
      updateFields.push(`description = $${paramCount}`)
      params.push(updates.description)
      paramCount++
    }
    if (updates.imageUrl) {
      updateFields.push(`image_url = $${paramCount}`)
      params.push(updates.imageUrl)
      paramCount++
    }
    if (updates.category) {
      updateFields.push(`category = $${paramCount}`)
      params.push(updates.category)
      paramCount++
    }
    if (updates.cloudinary_public_id !== undefined) {
      updateFields.push(`cloudinary_public_id = $${paramCount}`)
      params.push(updates.cloudinary_public_id)
      paramCount++
    }
    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount}`)
      params.push(updates.isActive)
      paramCount++
    }
    if (updates.hasAuction !== undefined) {
      updateFields.push(`has_auction = $${paramCount}`)
      params.push(updates.hasAuction)
      paramCount++
    }
    if (updates.auctionStatus) {
      updateFields.push(`auction_status = $${paramCount}`)
      params.push(updates.auctionStatus)
      paramCount++
    }
    if (updates.auctionEndTime !== undefined) {
      updateFields.push(`auction_end_time = $${paramCount}`)
      params.push(updates.auctionEndTime)
      paramCount++
    }
    if (updates.currentBid !== undefined) {
      updateFields.push(`current_bid = $${paramCount}`)
      params.push(updates.currentBid)
      paramCount++
    }
    if (updates.startingBid !== undefined) {
      updateFields.push(`starting_bid = $${paramCount}`)
      params.push(updates.startingBid)
      paramCount++
    }
    if (updates.highestBidder !== undefined) {
      updateFields.push(`highest_bidder = $${paramCount}`)
      params.push(updates.highestBidder)
      paramCount++
    }
    if (updates.highestBidderEmail !== undefined) {
      updateFields.push(`highest_bidder_email = $${paramCount}`)
      params.push(updates.highestBidderEmail)
      paramCount++
    }
    if (updates.$inc?.totalBids) {
      updateFields.push(`total_bids = total_bids + $${paramCount}`)
      params.push(updates.$inc.totalBids)
      paramCount++
    }
    if (updates.totalBids !== undefined) {
      updateFields.push(`total_bids = $${paramCount}`)
      params.push(updates.totalBids)
      paramCount++
    }

    if (updateFields.length === 0) return null

    params.push(id)
    const sql = `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(sql, params)
    return result.rows.length > 0 ? mapToProduct(result.rows[0]) : null
  },

  async findByIdAndDelete(id: string): Promise<void> {
    await pool.query('DELETE FROM products WHERE id = $1', [id])
  },

  lean() { return this },
  sort() { return this }
}

// ==================== BID MODEL ====================
export const Bid = {
  async find(query: any = {}): Promise<IBid[]> {
    let sql = 'SELECT * FROM bids WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.productId) {
      sql += ` AND product_id = $${paramCount}`
      params.push(query.productId)
      paramCount++
    }
    if (query.userId) {
      sql += ` AND user_id = $${paramCount}`
      params.push(query.userId)
      paramCount++
    }
    if (query.isWinning !== undefined) {
      sql += ` AND is_winning = $${paramCount}`
      params.push(query.isWinning)
      paramCount++
    }
    if (query.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`
      params.push(query.isActive)
      paramCount++
    }

    sql += ' ORDER BY created_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userEmail: row.user_email,
      bidAmount: parseFloat(row.bid_amount),
      isWinning: row.is_winning,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  async create(data: Partial<IBid>): Promise<IBid> {
    const result = await pool.query(
      `INSERT INTO bids (product_id, user_id, user_email, bid_amount, is_winning, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.productId,
        data.userId,
        data.userEmail,
        data.bidAmount,
        data.isWinning !== false,
        data.isActive !== false
      ]
    )
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userEmail: row.user_email,
      bidAmount: parseFloat(row.bid_amount),
      isWinning: row.is_winning,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  async updateMany(query: any, update: any): Promise<void> {
    const updateFields: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (update.$set) {
      if (update.$set.isWinning !== undefined) {
        updateFields.push(`is_winning = $${paramCount}`)
        params.push(update.$set.isWinning)
        paramCount++
      }
      if (update.$set.isActive !== undefined) {
        updateFields.push(`is_active = $${paramCount}`)
        params.push(update.$set.isActive)
        paramCount++
      }
    }

    if (updateFields.length === 0) return

    let where = 'WHERE 1=1'
    if (query.productId) {
      where += ` AND product_id = $${paramCount}`
      params.push(query.productId)
      paramCount++
    }
    if (query.userId) {
      where += ` AND user_id = $${paramCount}`
      params.push(query.userId)
      paramCount++
    }
    if (query._id) {
      where += ` AND id = $${paramCount}`
      params.push(query._id)
      paramCount++
    }
    if (query._id?.$ne) {
      where += ` AND id != $${paramCount}`
      params.push(query._id.$ne)
      paramCount++
    }

    const sql = `UPDATE bids SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP ${where}`
    await pool.query(sql, params)
  },

  lean() { return this },
  sort() { return this }
}

let auctionParticipantBanBootstrapPromise: Promise<void> | null = null

async function ensureAuctionParticipantBanTable(): Promise<void> {
  if (!auctionParticipantBanBootstrapPromise) {
    auctionParticipantBanBootstrapPromise = (async () => {
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS auction_participant_bans (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          user_email VARCHAR(255) NOT NULL,
          banned_by_email VARCHAR(255) NOT NULL,
          reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (product_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_auction_participant_bans_product_id ON auction_participant_bans(product_id);
        CREATE INDEX IF NOT EXISTS idx_auction_participant_bans_user_id ON auction_participant_bans(user_id);
      `)
    })().catch((error) => {
      auctionParticipantBanBootstrapPromise = null
      throw error
    })
  }

  await auctionParticipantBanBootstrapPromise
}

export const AuctionParticipantBan = {
  async find(query: { productId?: string; userId?: string } = {}): Promise<IAuctionParticipantBan[]> {
    await ensureAuctionParticipantBanTable()

    let sql = 'SELECT * FROM auction_participant_bans WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.productId) {
      sql += ` AND product_id = $${paramCount}`
      params.push(query.productId)
      paramCount++
    }

    if (query.userId) {
      sql += ` AND user_id = $${paramCount}`
      params.push(query.userId)
      paramCount++
    }

    sql += ' ORDER BY created_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(mapToAuctionParticipantBan)
  },

  async exists(productId: string, userId: string): Promise<boolean> {
    await ensureAuctionParticipantBanTable()

    const result = await pool.query(
      'SELECT 1 FROM auction_participant_bans WHERE product_id = $1 AND user_id = $2 LIMIT 1',
      [productId, userId]
    )

    return result.rows.length > 0
  },

  async upsert(data: {
    productId: string
    userId: string
    userEmail: string
    bannedByEmail: string
    reason?: string | null
  }): Promise<IAuctionParticipantBan> {
    await ensureAuctionParticipantBanTable()

    const result = await pool.query(
      `INSERT INTO auction_participant_bans (product_id, user_id, user_email, banned_by_email, reason)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (product_id, user_id)
       DO UPDATE SET
         user_email = EXCLUDED.user_email,
         banned_by_email = EXCLUDED.banned_by_email,
         reason = EXCLUDED.reason,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        data.productId,
        data.userId,
        data.userEmail,
        data.bannedByEmail,
        data.reason || null
      ]
    )

    return mapToAuctionParticipantBan(result.rows[0])
  },

  async clearByProductId(productId: string): Promise<void> {
    await ensureAuctionParticipantBanTable()
    await pool.query('DELETE FROM auction_participant_bans WHERE product_id = $1', [productId])
  }
}

let notificationEventBootstrapPromise: Promise<void> | null = null

async function ensureNotificationEventTable(): Promise<void> {
  if (!notificationEventBootstrapPromise) {
    notificationEventBootstrapPromise = (async () => {
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS notification_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_type VARCHAR(80) NOT NULL,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'destructive')),
          action_url TEXT,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          dedupe_key VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_notification_events_created_at ON notification_events(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notification_events_event_type ON notification_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_notification_events_recipient_user_id ON notification_events(recipient_user_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_events_dedupe_key ON notification_events(dedupe_key) WHERE dedupe_key IS NOT NULL;
      `)
    })().catch((error) => {
      notificationEventBootstrapPromise = null
      throw error
    })
  }

  await notificationEventBootstrapPromise
}

export const NotificationEvent = {
  async create(data: Partial<INotificationEvent>): Promise<INotificationEvent | null> {
    await ensureNotificationEventTable()

    const result = await pool.query(
      `INSERT INTO notification_events (
        event_type,
        product_id,
        recipient_user_id,
        title,
        description,
        severity,
        action_url,
        metadata,
        dedupe_key,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
      ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING
      RETURNING *`,
      [
        data.eventType,
        data.productId || null,
        data.recipientUserId || null,
        data.title,
        data.description || null,
        data.severity || 'info',
        data.actionUrl || null,
        JSON.stringify(data.metadata || {}),
        data.dedupeKey || null,
        data.expiresAt || null,
      ]
    )

    if (result.rows.length === 0) {
      return null
    }

    return mapToNotificationEvent(result.rows[0])
  },

  async findForUserSince(input: {
    recipientUserId: string
    since: Date
    limit?: number
  }): Promise<INotificationEvent[]> {
    await ensureNotificationEventTable()

    const result = await pool.query(
      `SELECT *
       FROM notification_events
       WHERE created_at > $1
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (recipient_user_id = $2 OR recipient_user_id IS NULL)
       ORDER BY created_at ASC
       LIMIT $3`,
      [input.since, input.recipientUserId, input.limit || 50]
    )

    return result.rows.map(mapToNotificationEvent)
  },
}

// ==================== AUCTION HISTORY MODEL ====================
let auctionHistoryBootstrapPromise: Promise<void> | null = null

async function ensureAuctionHistoryTable(): Promise<void> {
  if (!auctionHistoryBootstrapPromise) {
    auctionHistoryBootstrapPromise = (async () => {
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS auction_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id UUID NOT NULL,
          product_title VARCHAR(255) NOT NULL,
          product_image_url TEXT,
          product_category VARCHAR(64),
          seller_user_id UUID,
          seller_email VARCHAR(255),
          conducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          auction_end_time TIMESTAMP,
          winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          winner_email VARCHAR(255),
          winning_bid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('full', 'penalty')),
          outcome_status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (outcome_status IN ('completed', 'penalty_paid', 'relisted')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (product_id, payment_type)
        );

        CREATE INDEX IF NOT EXISTS idx_auction_history_conducted_at ON auction_history(conducted_at);
        CREATE INDEX IF NOT EXISTS idx_auction_history_winner_user_id ON auction_history(winner_user_id);
        CREATE INDEX IF NOT EXISTS idx_auction_history_product_id ON auction_history(product_id);

        ALTER TABLE auction_history
          DROP CONSTRAINT IF EXISTS auction_history_product_id_fkey;

        ALTER TABLE auction_history
          ADD COLUMN IF NOT EXISTS product_category VARCHAR(64),
          ADD COLUMN IF NOT EXISTS seller_user_id UUID,
          ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255);
      `)
    })().catch((error) => {
      auctionHistoryBootstrapPromise = null
      throw error
    })
  }

  await auctionHistoryBootstrapPromise
}

export const AuctionHistory = {
  async create(data: Partial<IAuctionHistory>): Promise<IAuctionHistory> {
    await ensureAuctionHistoryTable()

    const result = await pool.query(
      `INSERT INTO auction_history (
        product_id,
        product_title,
        product_image_url,
        product_category,
        seller_user_id,
        seller_email,
        conducted_at,
        auction_end_time,
        winner_user_id,
        winner_email,
        winning_bid_amount,
        payment_type,
        outcome_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (product_id, payment_type) DO NOTHING
      RETURNING *`,
      [
        data.productId,
        data.productTitle,
        data.productImageUrl || null,
        data.productCategory || null,
        data.sellerUserId || null,
        data.sellerEmail || null,
        data.conductedAt || new Date(),
        data.auctionEndTime || null,
        data.winnerUserId || null,
        data.winnerEmail || null,
        data.winningBidAmount || 0,
        data.paymentType,
        data.outcomeStatus || 'completed'
      ]
    )

    if (result.rows.length === 0) {
      const existing = await this.findOne({ productId: data.productId, paymentType: data.paymentType })
      if (!existing) {
        throw new Error('Failed to insert auction history row')
      }
      return existing
    }

    return mapToAuctionHistory(result.rows[0])
  },

  async find(query: any = {}, options: { limit?: number } = {}): Promise<IAuctionHistory[]> {
    await ensureAuctionHistoryTable()

    let sql = 'SELECT * FROM auction_history WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.productId) {
      sql += ` AND product_id = $${paramCount}`
      params.push(query.productId)
      paramCount++
    }
    if (query.winnerUserId) {
      sql += ` AND winner_user_id = $${paramCount}`
      params.push(query.winnerUserId)
      paramCount++
    }
    if (query.paymentType) {
      sql += ` AND payment_type = $${paramCount}`
      params.push(query.paymentType)
      paramCount++
    }
    if (query.outcomeStatus) {
      sql += ` AND outcome_status = $${paramCount}`
      params.push(query.outcomeStatus)
      paramCount++
    }

    sql += ' ORDER BY conducted_at DESC, created_at DESC'

    if (options.limit) {
      sql += ` LIMIT $${paramCount}`
      params.push(options.limit)
    }

    const result = await pool.query(sql, params)
    return result.rows.map(mapToAuctionHistory)
  },

  async findOne(query: any = {}): Promise<IAuctionHistory | null> {
    const rows = await this.find(query, { limit: 1 })
    return rows.length > 0 ? rows[0] : null
  },

  async countDocuments(query: any = {}): Promise<number> {
    await ensureAuctionHistoryTable()

    let sql = 'SELECT COUNT(*) FROM auction_history WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (query.winnerUserId) {
      sql += ` AND winner_user_id = $${paramCount}`
      params.push(query.winnerUserId)
      paramCount++
    }
    if (query.paymentType) {
      sql += ` AND payment_type = $${paramCount}`
      params.push(query.paymentType)
      paramCount++
    }

    const result = await pool.query(sql, params)
    return parseInt(result.rows[0].count)
  },

  async existsByProductAndPayment(productId: string, paymentType: 'full' | 'penalty'): Promise<boolean> {
    await ensureAuctionHistoryTable()

    const result = await pool.query(
      'SELECT 1 FROM auction_history WHERE product_id = $1 AND payment_type = $2 LIMIT 1',
      [productId, paymentType]
    )
    return result.rows.length > 0
  },

  async markPenaltyAsRelisted(productId: string): Promise<IAuctionHistory | null> {
    await ensureAuctionHistoryTable()

    const result = await pool.query(
      `UPDATE auction_history
       SET outcome_status = 'relisted', updated_at = CURRENT_TIMESTAMP
       WHERE id = (
         SELECT id
         FROM auction_history
         WHERE product_id = $1
           AND payment_type = 'penalty'
           AND outcome_status = 'penalty_paid'
         ORDER BY conducted_at DESC, created_at DESC
         LIMIT 1
       )
       RETURNING *`,
      [productId]
    )

    return result.rows.length > 0 ? mapToAuctionHistory(result.rows[0]) : null
  },

  async getAdminSummary(limit = 5): Promise<{
    totalAuctionsConducted: number
    fullPaymentCount: number
    penaltyCount: number
    auctionsThisMonth: number
    totalFullPaymentValue: number
    latest: IAuctionHistory[]
  }> {
    await ensureAuctionHistoryTable()

    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_auctions_conducted,
        COUNT(*) FILTER (WHERE payment_type = 'full')::int AS full_payment_count,
        COUNT(*) FILTER (WHERE payment_type = 'penalty')::int AS penalty_count,
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', conducted_at) = DATE_TRUNC('month', NOW())
        )::int AS auctions_this_month,
        COALESCE(SUM(winning_bid_amount) FILTER (WHERE payment_type = 'full'), 0)::numeric AS total_full_payment_value
      FROM auction_history
    `)

    const latest = await this.find({}, { limit })
    const row = summaryResult.rows[0]

    return {
      totalAuctionsConducted: row.total_auctions_conducted || 0,
      fullPaymentCount: row.full_payment_count || 0,
      penaltyCount: row.penalty_count || 0,
      auctionsThisMonth: row.auctions_this_month || 0,
      totalFullPaymentValue: parseFloat(row.total_full_payment_value || 0),
      latest
    }
  },

  async getUserWonStats(userId: string): Promise<{ auctionsWon: number; totalSpent: number }> {
    await ensureAuctionHistoryTable()

    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE payment_type = 'full')::int AS auctions_won,
        COALESCE(SUM(winning_bid_amount) FILTER (WHERE payment_type = 'full'), 0)::numeric AS total_spent
       FROM auction_history
       WHERE winner_user_id = $1`,
      [userId]
    )

    const row = result.rows[0]
    return {
      auctionsWon: row.auctions_won || 0,
      totalSpent: parseFloat(row.total_spent || 0)
    }
  }
}

// ==================== CHAT MESSAGE MODEL ====================
export const ChatMessage = {
  async find(query: any = {}): Promise<IChatMessage[]> {
    let sql = `
      SELECT cm.*, u.image AS user_image
      FROM chat_messages cm
      LEFT JOIN users u ON u.email = cm.user_email
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (query.productId) {
      sql += ` AND cm.product_id = $${paramCount}`
      params.push(query.productId)
      paramCount++
    }
    if (query.userId) {
      sql += ` AND cm.user_id = $${paramCount}`
      params.push(query.userId)
      paramCount++
    }

    const createdAtAfter =
      query.afterCreatedAt ||
      query.createdAt?.$gt ||
      null

    if (createdAtAfter) {
      sql += ` AND cm.created_at > $${paramCount}`
      params.push(createdAtAfter)
      paramCount++
    }

    sql += ' ORDER BY cm.created_at ASC'

    if (query.limit && Number.isInteger(query.limit) && query.limit > 0) {
      sql += ` LIMIT $${paramCount}`
      params.push(query.limit)
    }

    const result = await pool.query(sql, params)
    return result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userEmail: row.user_email,
      userImage: row.user_image || null,
      message: row.message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  async create(data: Partial<IChatMessage>): Promise<IChatMessage> {
    const result = await pool.query(
      `INSERT INTO chat_messages (product_id, user_id, user_email, message) 
       VALUES ($1, $2, $3, $4)
       RETURNING *, (SELECT image FROM users WHERE email = $3 LIMIT 1) AS user_image`,
      [data.productId, data.userId, data.userEmail, data.message]
    )
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userEmail: row.user_email,
      userImage: row.user_image || null,
      message: row.message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  lean() { return this },
  sort() { return this }
}

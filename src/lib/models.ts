import { pool } from './database'
import { QueryResult } from 'pg'

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
  message: string
  createdAt?: Date
  updatedAt?: Date
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

// ==================== PRODUCT MODEL ====================
export const Product = {
  async find(query: any = {}): Promise<IProduct[]> {
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

    sql += ' ORDER BY created_at DESC'

    const result = await pool.query(sql, params)
    return result.rows.map(mapToProduct)
  },

  async findById(id: string): Promise<IProduct | null> {
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
    const result = await pool.query(
      `INSERT INTO products (
        user_id, user_email, title, description, image_url, cloudinary_public_id,
        is_active, has_auction, auction_end_time, starting_bid, current_bid,
        highest_bidder, highest_bidder_email, total_bids, auction_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        data.userId,
        data.userEmail,
        data.title,
        data.description,
        data.imageUrl,
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
    if (updates.auctionStatus) {
      updateFields.push(`auction_status = $${paramCount}`)
      params.push(updates.auctionStatus)
      paramCount++
    }
    if (updates.auctionEndTime) {
      updateFields.push(`auction_end_time = $${paramCount}`)
      params.push(updates.auctionEndTime)
      paramCount++
    }
    if (updates.currentBid !== undefined) {
      updateFields.push(`current_bid = $${paramCount}`)
      params.push(updates.currentBid)
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

// ==================== CHAT MESSAGE MODEL ====================
export const ChatMessage = {
  async find(query: any = {}): Promise<IChatMessage[]> {
    let sql = 'SELECT * FROM chat_messages WHERE 1=1'
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

    sql += ' ORDER BY created_at ASC'

    const result = await pool.query(sql, params)
    return result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userEmail: row.user_email,
      message: row.message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  async create(data: Partial<IChatMessage>): Promise<IChatMessage> {
    const result = await pool.query(
      `INSERT INTO chat_messages (product_id, user_id, user_email, message) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.productId, data.userId, data.userEmail, data.message]
    )
    const row = result.rows[0]
    return {
      _id: row.id,
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userEmail: row.user_email,
      message: row.message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  lean() { return this },
  sort() { return this }
}

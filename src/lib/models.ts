import mongoose from 'mongoose'

// User Schema
const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: false,  // Not required - allows legacy users without Google login
    sparse: true,     // Allows multiple null values while keeping uniqueness for non-null
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
}, {
  timestamps: true,
  collection: 'users',
})

// Carousel Image Schema
const CarouselImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cloudinary_public_id: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'carousel_images',
})

// New Arrival Product Schema
const NewArrivalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '/category',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'new_arrivals',
})

// Admin Setting Schema
const AdminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'admin_settings',
})

// Product Schema (for user-added products)
const ProductSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinary_public_id: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Auction fields
  hasAuction: {
    type: Boolean,
    default: false,
  },
  auctionEndTime: {
    type: Date,
    default: null,
  },
  startingBid: {
    type: Number,
    default: 0,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  highestBidder: {
    type: String,
    default: null,
  },
  highestBidderEmail: {
    type: String,
    default: null,
  },
  totalBids: {
    type: Number,
    default: 0,
  },
  auctionStatus: {
    type: String,
    enum: ['active', 'ended', 'none'],
    default: 'none',
  },
}, {
  timestamps: true,
  collection: 'products',
})

// Bid Schema
const BidSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  bidAmount: {
    type: Number,
    required: true,
  },
  isWinning: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'bids',
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const CarouselImage = mongoose.models.CarouselImage || mongoose.model('CarouselImage', CarouselImageSchema)
export const NewArrival = mongoose.models.NewArrival || mongoose.model('NewArrival', NewArrivalSchema)
export const AdminSetting = mongoose.models.AdminSetting || mongoose.model('AdminSetting', AdminSettingSchema)
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
export const Bid = mongoose.models.Bid || mongoose.model('Bid', BidSchema)

// Types for TypeScript
export interface IUser {
  _id?: string
  googleId: string
  email: string
  name?: string
  image?: string
  role: 'USER' | 'ADMIN'
  createdAt?: Date
  updatedAt?: Date
}

export interface ICarouselImage {
  _id?: string
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
  key: string
  value: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IProduct {
  _id?: string
  userId: string
  userEmail: string
  title: string
  description: string
  imageUrl: string
  cloudinary_public_id?: string | null
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
}

export interface IBid {
  _id?: string
  productId: string
  userId: string
  userEmail: string
  bidAmount: number
  isWinning: boolean
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

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

// Export models
export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const CarouselImage = mongoose.models.CarouselImage || mongoose.model('CarouselImage', CarouselImageSchema)
export const NewArrival = mongoose.models.NewArrival || mongoose.model('NewArrival', NewArrivalSchema)
export const AdminSetting = mongoose.models.AdminSetting || mongoose.model('AdminSetting', AdminSettingSchema)

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

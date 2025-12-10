'use client'

import { useState } from 'react'

export default function CloudinaryManager() {
  const [publicId, setPublicId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const deleteImage = async () => {
    if (!publicId && !imageUrl) {
      setMessage({ type: 'error', text: 'Please provide either a public ID or image URL' })
      return
    }

    setIsDeleting(true)
    setMessage(null)

    try {
      const params = new URLSearchParams()
      if (publicId) params.append('public_id', publicId)
      if (imageUrl) params.append('image_url', imageUrl)

      const response = await fetch(`/api/admin/delete-image?${params.toString()}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        if (data.success) {
          setMessage({ 
            type: 'success', 
            text: `Image deleted successfully from Cloudinary (Public ID: ${data.public_id})` 
          })
          setPublicId('')
          setImageUrl('')
        } else {
          setMessage({ 
            type: 'error', 
            text: data.message || 'Failed to delete image' 
          })
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || `Failed to delete image (${response.status})` 
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Network error while deleting image' 
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const extractPublicIdFromUrl = () => {
    if (!imageUrl) return

    // Extract public_id from Cloudinary URL
    const match = imageUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i)
    if (match) {
      setPublicId(match[1])
      setMessage({ 
        type: 'info', 
        text: `Extracted public ID: ${match[1]}` 
      })
    } else {
      setMessage({ 
        type: 'error', 
        text: 'Could not extract public ID from URL. Please enter it manually.' 
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Cloudinary Image Management</h2>
      
      <div className="space-y-6">
        {/* Public ID Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cloudinary Public ID
          </label>
          <input
            type="text"
            value={publicId}
            onChange={(e) => setPublicId(e.target.value)}
            placeholder="e.g., tokari-banners/banner-1672531200000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            The unique identifier for the image in Cloudinary
          </p>
        </div>

        {/* Image URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/your-cloud/image/upload/v123456/tokari-banners/banner-1672531200000.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={extractPublicIdFromUrl}
              disabled={!imageUrl}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Extract ID
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Paste a Cloudinary URL to automatically extract the public ID
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Delete Button */}
        <div className="flex gap-3">
          <button
            onClick={deleteImage}
            disabled={isDeleting || (!publicId && !imageUrl)}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center"
          >
            {isDeleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isDeleting ? 'Deleting...' : 'Delete Image from Cloudinary'}
          </button>
          
          <button
            onClick={() => {
              setPublicId('')
              setImageUrl('')
              setMessage(null)
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear
          </button>
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">How to find the Public ID:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• From a Cloudinary URL: <code className="bg-blue-100 px-1 rounded">tokari-banners/banner-1672531200000</code></li>
            <li>• From the Cloudinary Dashboard: Media Library → Select image → Copy Public ID</li>
            <li>• When uploading via API, the public_id is returned in the response</li>
          </ul>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-2">⚠️ Warning:</h3>
          <p className="text-sm text-yellow-800">
            Deleting an image from Cloudinary is permanent and cannot be undone. 
            Make sure you&apos;re not deleting images that are still being used on your website.
          </p>
        </div>
      </div>
    </div>
  )
}

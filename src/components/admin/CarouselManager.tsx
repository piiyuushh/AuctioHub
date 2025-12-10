"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface CarouselImage {
  _id?: string  // MongoDB uses _id
  id?: string   // Keep for backward compatibility
  url: string
  altText?: string | null
  order: number
  isActive: boolean
  cloudinary_public_id?: string | null
  createdAt?: string
  updatedAt?: string
}

export default function CarouselManager() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newImage, setNewImage] = useState({
    url: '',
    altText: '',
    isActive: true
  })
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to get ID from MongoDB object
  const getImageId = (image: CarouselImage): string => {
    return image._id || image.id || ''
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      console.log('Fetching carousel images...')
      const response = await fetch('/api/admin/carousel')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched images:', data)
        setImages(Array.isArray(data) ? data : [])
        setMessage(null) // Clear any previous errors
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch images:', response.status, errorText)
        setMessage({ type: 'error', text: `Failed to fetch carousel images (${response.status})` })
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setMessage({ type: 'error', text: 'Error loading carousel images' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
        return
      }
      
      // Validate file size (max 8MB)
      const maxSize = 8 * 1024 * 1024 // 8MB
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 8MB.')
        return
      }
      
      setSelectedFile(file)
      setError('')
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (): Promise<{ url: string; public_id: string } | null> => {
    if (!selectedFile) return null
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      const responseText = await response.text()
      console.log('Upload response:', { status: response.status, text: responseText })
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText)
          return { url: data.url, public_id: data.public_id }
        } catch {
          console.error('Failed to parse upload response as JSON')
          setError('Invalid response from server')
          return null
        }
      } else {
        try {
          const errorData = JSON.parse(responseText)
          setError(errorData.error || `Upload failed with status ${response.status}`)
        } catch {
          setError(`Upload failed with status ${response.status}: ${responseText}`)
        }
        return null
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Upload failed: Network error')
      return null
    } finally {
      setUploading(false)
    }
  }

  // Check if image URL already exists
  const isImageDuplicate = (url: string): boolean => {
    return images.some(image => image.url === url)
  }

  const addImage = async () => {
    try {
      let imageUrl = newImage.url
      let cloudinaryPublicId: string | null = null
      
      // If using file upload method, upload the file first
      if (uploadMethod === 'file' && selectedFile) {
        const uploadResult = await uploadFile()
        if (!uploadResult) return // Upload failed, error already set
        imageUrl = uploadResult.url
        cloudinaryPublicId = uploadResult.public_id
      }
      
      if (!imageUrl) {
        setError('Please provide an image URL or select a file')
        return
      }

      // Check for duplicate image URL
      if (isImageDuplicate(imageUrl)) {
        setError('Image with this URL already exists in the carousel')
        return
      }
      
      setActionLoading(true)
      const response = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: imageUrl,
          altText: newImage.altText.trim() || null,
          isActive: newImage.isActive,
          cloudinary_public_id: cloudinaryPublicId
        })
      })
      
      if (response.ok) {
        await fetchImages()
        // Reset form
        setNewImage({ 
          url: '', 
          altText: '', 
          isActive: true 
        })
        setSelectedFile(null)
        setPreviewUrl('')
        setShowAddForm(false)
        setError('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setMessage({ type: 'success', text: 'Carousel image added successfully with automatic order assignment' })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add image')
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  const updateImage = async (id: string, updates: Partial<CarouselImage>) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      if (response.ok) {
        await fetchImages()
        setMessage({ type: 'success', text: 'Carousel image updated successfully' })
      } else {
        const errorData = await response.json()
        if (errorData.error && errorData.error.includes('Order')) {
          setMessage({ type: 'error', text: errorData.error })
        } else {
          setMessage({ type: 'error', text: errorData.error || 'Failed to update carousel image' })
        }
      }
    } catch (err) {
      console.error('Update error:', err)
      setMessage({ type: 'error', text: 'Error updating carousel image' })
    } finally {
      setActionLoading(false)
    }
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carousel image?')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/carousel?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchImages()
        setMessage({ type: 'success', text: 'Carousel image deleted successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to delete carousel image' })
      }
    } catch (err) {
      console.error('Delete error:', err)
      setMessage({ type: 'error', text: 'Error deleting carousel image' })
    } finally {
      setActionLoading(false)
    }
  }

  const toggleActive = async (image: CarouselImage) => {
    await updateImage(getImageId(image), { isActive: !image.isActive })
  }

  const moveImage = async (image: CarouselImage, direction: 'up' | 'down') => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: getImageId(image),
          moveDirection: direction
        })
      })

      if (response.ok) {
        await fetchImages()
        setMessage({ type: 'success', text: `Image moved ${direction} successfully` })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || `Failed to move image ${direction}` })
      }
    } catch (error) {
      console.error(`Move ${direction} error:`, error)
      setMessage({ type: 'error', text: `Failed to move image ${direction}` })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Carousel Management</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Carousel Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {showAddForm ? 'Cancel' : 'Add New Image'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">Add New Carousel Image</h3>
            
            {/* Upload Method Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Upload Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={uploadMethod === 'url'}
                    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use URL</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadMethod === 'file'}
                    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Upload File</span>
                </label>
              </div>
            </div>

            {uploadMethod === 'url' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  placeholder="/assets/banners/banner.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {!selectedFile ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Choose Image File
                      </button>
                      <p className="mt-2 text-sm text-gray-500">
                        Supports JPEG, PNG, WebP, GIF (max 8MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {previewUrl && (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={128}
                          height={128}
                          className="max-h-32 mx-auto rounded-md object-cover"
                          onError={(e) => {
                            console.error('Preview image failed to load:', previewUrl)
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <p className="text-sm text-gray-700">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl('')
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Alt Text</label>
                <input
                  type="text"
                  value={newImage.altText}
                  onChange={(e) => setNewImage({ ...newImage, altText: e.target.value })}
                  placeholder="Banner description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newImage.isActive}
                    onChange={(e) => setNewImage({ ...newImage, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={addImage}
                disabled={
                  actionLoading || 
                  uploading ||
                  (uploadMethod === 'file' && !selectedFile) || 
                  (uploadMethod === 'url' && !newImage.url)
                }
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center"
              >
                {(actionLoading || uploading) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {(actionLoading || uploading) ? 'Adding...' : 'Add Image'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedFile(null)
                  setPreviewUrl('')
                  setNewImage({ url: '', altText: '', isActive: true })
                  setError('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Active Images ({images.filter(img => img.isActive).length})</h3>
          
          {images.filter(img => img.isActive).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active carousel images found. Add your first image above.
            </div>
          ) : (
            <div className="grid gap-4">
              {images
                .filter(img => img.isActive)
                .sort((a, b) => a.order - b.order)
                .map((image, index) => (
                  <div key={getImageId(image)} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={image.url}
                          alt={image.altText || 'Carousel image'}
                          width={120}
                          height={80}
                          className="rounded-md object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/logo.png';
                          }}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Order: {image.order}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                          {image.cloudinary_public_id && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                              ☁️ Cloudinary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>URL:</strong> {image.url}
                        </p>
                        {image.altText && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Alt Text:</strong> {image.altText}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Added: {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveImage(image, 'up')}
                            disabled={index === 0 || actionLoading}
                            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveImage(image, 'down')}
                            disabled={index === images.filter(img => img.isActive).length - 1 || actionLoading}
                            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                        
                        <button
                          onClick={() => toggleActive(image)}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                        
                        <button
                          onClick={() => deleteImage(getImageId(image))}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Inactive Images Section */}
        {images.filter(img => !img.isActive).length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium">Inactive Images ({images.filter(img => !img.isActive).length})</h3>
            <div className="grid gap-4">
              {images
                .filter(img => !img.isActive)
                .sort((a, b) => a.order - b.order)
                .map((image) => (
                  <div key={getImageId(image)} className="bg-gray-100 rounded-lg p-4 opacity-75">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={image.url}
                          alt={image.altText || 'Carousel image'}
                          width={120}
                          height={80}
                          className="rounded-md object-cover grayscale"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/logo.png';
                          }}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Order: {image.order}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            Inactive
                          </span>
                          {image.cloudinary_public_id && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                              ☁️ Cloudinary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>URL:</strong> {image.url}
                        </p>
                        {image.altText && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Alt Text:</strong> {image.altText}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Added: {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleActive(image)}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          Activate
                        </button>
                        
                        <button
                          onClick={() => deleteImage(getImageId(image))}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Automatic Ordering:</strong> Images are automatically assigned order numbers starting from 1</li>
            <li>• <strong>Reordering:</strong> Use ↑↓ arrow buttons to move active images up or down in the sequence</li>
            <li>• <strong>Smart Deletion:</strong> When an image is deleted, all subsequent images automatically shift up to fill the gap</li>
            <li>• <strong>Cloudinary Integration:</strong> Images uploaded via file upload are automatically deleted from Cloudinary when removed</li>
            <li>• <strong>Active Images:</strong> Only active images are shown in the carousel on the website</li>
            <li>• <strong>Inactive Images:</strong> Deactivated images are shown in a separate section below and can be reactivated</li>
            <li>• <strong>Duplicate Prevention:</strong> Same image URLs cannot be added twice</li>
            <li>• <strong>Image URLs:</strong> Should be publicly accessible (HTTPS recommended)</li>
            <li>• <strong>Alt Text:</strong> Improves accessibility and SEO - describe what&apos;s in the image</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

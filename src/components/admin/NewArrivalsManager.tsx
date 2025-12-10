"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface NewArrivalProduct {
  _id?: string
  id?: string
  title: string
  description: string
  imageUrl: string
  link: string
  order: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export default function NewArrivalsManager() {
  const [products, setProducts] = useState<NewArrivalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<NewArrivalProduct | null>(null)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '/category',
    isActive: true
  })
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to get ID from MongoDB object
  const getProductId = (product: NewArrivalProduct): string => {
    return product._id || product.id || ''
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching new arrival products...')
      const response = await fetch('/api/admin/new-arrivals')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched products:', data)
        setProducts(data)
        setError('')
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch products:', errorData)
        setError(errorData.message || 'Failed to fetch products')
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to connect to server')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const resetForm = () => {
    setNewProduct({
      title: '',
      description: '',
      imageUrl: '',
      link: '/category',
      isActive: true
    })
    setSelectedFile(null)
    setPreviewUrl('')
    setUploadMethod('url')
    setEditingProduct(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, WebP)')
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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Upload failed')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newProduct.title.trim() || !newProduct.description.trim()) {
      setError('Title and description are required')
      return
    }
    
    if (uploadMethod === 'file' && !selectedFile && !editingProduct) {
      setError('Please select an image file')
      return
    }
    
    if (uploadMethod === 'url' && !newProduct.imageUrl.trim()) {
      setError('Please provide an image URL')
      return
    }
    
    setActionLoading(true)
    setError('')
    
    try {
      let imageUrl = newProduct.imageUrl
      
      // Upload file to Cloudinary if using file method
      if (uploadMethod === 'file' && selectedFile) {
        setUploading(true)
        imageUrl = await uploadToCloudinary(selectedFile)
        setUploading(false)
      }
      
      const productData = {
        ...newProduct,
        imageUrl,
        id: editingProduct ? getProductId(editingProduct) : undefined
      }
      
      const url = '/api/admin/new-arrivals'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Product saved:', result)
        
        showMessage('success', editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
        setShowAddForm(false)
        resetForm()
        await fetchProducts()
      } else {
        const errorData = await response.json()
        console.error('Save error:', errorData)
        setError(errorData.message || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setError(error instanceof Error ? error.message : 'Failed to save product')
      setUploading(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (product: NewArrivalProduct) => {
    setEditingProduct(product)
    setNewProduct({
      title: product.title || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      link: product.link || '/category',
      isActive: product.isActive ?? true
    })
    setUploadMethod('url')
    setPreviewUrl('')
    setSelectedFile(null)
    setShowAddForm(true)
  }

  const handleDelete = async (product: NewArrivalProduct) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    setActionLoading(true)
    
    try {
      const productId = getProductId(product)
      const response = await fetch(`/api/admin/new-arrivals?id=${productId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        showMessage('success', 'Product deleted successfully!')
        await fetchProducts()
      } else {
        const errorData = await response.json()
        console.error('Delete error:', errorData)
        showMessage('error', errorData.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showMessage('error', 'Failed to delete product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (product: NewArrivalProduct) => {
    setActionLoading(true)
    
    try {
      const productId = getProductId(product)
      const response = await fetch('/api/admin/new-arrivals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          isActive: !product.isActive
        }),
      })
      
      if (response.ok) {
        showMessage('success', `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`)
        await fetchProducts()
      } else {
        const errorData = await response.json()
        console.error('Toggle error:', errorData)
        showMessage('error', errorData.message || 'Failed to update product status')
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
      showMessage('error', 'Failed to update product status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMoveUp = async (product: NewArrivalProduct, currentIndex: number) => {
    if (currentIndex === 0) return
    
    const prevProduct = products[currentIndex - 1]
    
    setActionLoading(true)
    
    try {
      // Swap orders
      const currentProductId = getProductId(product)
      const prevProductId = getProductId(prevProduct)
      
      await Promise.all([
        fetch('/api/admin/new-arrivals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentProductId, order: prevProduct.order }),
        }),
        fetch('/api/admin/new-arrivals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: prevProductId, order: product.order }),
        })
      ])
      
      await fetchProducts()
      showMessage('success', 'Product moved up successfully!')
    } catch (error) {
      console.error('Error moving product:', error)
      showMessage('error', 'Failed to move product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMoveDown = async (product: NewArrivalProduct, currentIndex: number) => {
    if (currentIndex === products.length - 1) return
    
    const nextProduct = products[currentIndex + 1]
    
    setActionLoading(true)
    
    try {
      // Swap orders
      const currentProductId = getProductId(product)
      const nextProductId = getProductId(nextProduct)
      
      await Promise.all([
        fetch('/api/admin/new-arrivals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentProductId, order: nextProduct.order }),
        }),
        fetch('/api/admin/new-arrivals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: nextProductId, order: product.order }),
        })
      ])
      
      await fetchProducts()
      showMessage('success', 'Product moved down successfully!')
    } catch (error) {
      console.error('Error moving product:', error)
      showMessage('error', 'Failed to move product')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-2 text-gray-600">Loading new arrival products...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">New Arrivals Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {products.length}/4 products ({4 - products.length} remaining)
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            resetForm()
          }}
          disabled={actionLoading || products.length >= 4}
          className={`${
            products.length >= 4 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
          } text-white px-4 py-2 rounded-lg font-medium transition-colors`}
          title={products.length >= 4 ? 'Maximum 4 products allowed' : ''}
        >
          Add New Product {products.length >= 4 && '(Max 4)'}
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newProduct.title || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
                </label>
                <input
                  type="text"
                  value={newProduct.link || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product link (e.g., /category)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={newProduct.description || ''}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description"
                rows={3}
                required
              />
            </div>

            {/* Image Upload Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Upload Method
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={uploadMethod === 'url'}
                    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                    className="mr-2"
                  />
                  Image URL
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadMethod === 'file'}
                    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                    className="mr-2"
                  />
                  Upload File
                </label>
              </div>
            </div>

            {/* Image Input */}
            {uploadMethod === 'url' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL"
                  required={!editingProduct}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingProduct}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Status Toggle */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newProduct.isActive}
                  onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.checked })}
                  className="mr-2"
                />
                Active (visible on website)
              </label>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={actionLoading || uploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {uploading ? 'Uploading...' : actionLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}
                disabled={actionLoading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Products ({products.length})</h3>
        </div>
        
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No products found. Add your first product to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <div key={getProductId(product)} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      width={120}
                      height={90}
                      className="rounded-lg object-cover border"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{product.title}</h4>
                        <p className="text-gray-600 mt-1">{product.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Link: {product.link}</span>
                          <span>Order: {product.order}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Move Up/Down */}
                        <button
                          onClick={() => handleMoveUp(product, index)}
                          disabled={index === 0 || actionLoading}
                          className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveDown(product, index)}
                          disabled={index === products.length - 1 || actionLoading}
                          className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ↓
                        </button>
                        
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(product)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            product.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={actionLoading}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={actionLoading}
                          className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

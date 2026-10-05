import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon, PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import BarcodeLabel from '../components/BarcodeLabel';
import ProductImage from '../components/ProductImage';
import { getProductImagePaths } from '../utils/productImages';

const Products = () => {
  const units = ['Piece', 'Pack', 'Carton', 'Gram (g)', 'Kilogram (kg)', 'Millilitre (ml)', 'Litre (L)'];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sellingPrice: '',
    costPrice: '',
    taxRate: '0',
    unit: 'Piece',
    stockQuantity: '',
    reorderLevel: '20',
    category: 'Groceries',
    barcode: '',
  });
  const [images, setImages] = useState([]);
  const [retainedImages, setRetainedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [valuation, setValuation] = useState({ products: [], totals: { totalCostValue: 0, totalSellingValue: 0, potentialProfit: 0 } });

  const categories = [
    'Groceries', 'Beverages', 'Snacks', 'Dairy', 'Meat', 'Produce', 'Household', 'Other'
  ];

  useEffect(() => {
    fetchProducts();
    fetchValuation();
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    if (!showDescriptionModal) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowDescriptionModal(false);
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDescriptionModal]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await axios.get(`${API_BASE_URL}/api/products?${params}`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchValuation = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/valuation`);
      setValuation(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory valuation');
    }
  };

  const formatMoney = (value) => `₦${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (selectedImages.length > 8) {
      toast.error('Choose up to 8 images at a time.');
      e.target.value = '';
      return;
    }
    const invalidImage = selectedImages.find((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalidImage) {
      toast.error(`${invalidImage.name}: use a JPEG, PNG, GIF, or WebP image under 5 MB.`);
      e.target.value = '';
      return;
    }
    setImages(selectedImages);
  };

  const generateBarcode = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/barcode/generate`);
      setFormData((prev) => ({
        ...prev,
        barcode: response.data.barcode
      }));
      toast.success('Barcode generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate barcode');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'barcode') {
        const barcode = formData.barcode.trim();
        if (barcode) {
          formDataToSend.append('barcode', barcode);
        }
        return;
      }
      formDataToSend.append(key, formData[key]);
    });
    if (formData.sellingPrice !== '') {
      formDataToSend.append('price', formData.sellingPrice);
    }
    if (formData.stockQuantity !== '') {
      formDataToSend.append('quantity', formData.stockQuantity);
    }
    if (formData.reorderLevel !== '') {
      formDataToSend.append('lowStockThreshold', formData.reorderLevel);
    }
    if (editingProduct) {
      formDataToSend.append('retainedImages', JSON.stringify(retainedImages));
    }
    images.forEach((file) => formDataToSend.append('images', file));

    setIsSubmitting(true);
    setUploadProgress(images.length > 0 ? 0 : null);
    try {
      const requestConfig = images.length > 0 ? {
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      } : undefined;
      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, formDataToSend, requestConfig);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, formDataToSend, requestConfig);
        toast.success('Product created successfully');
      }
      
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Product could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      sellingPrice: product.sellingPrice ?? product.price ?? 0,
      costPrice: product.costPrice ?? 0,
      taxRate: product.taxRate ?? 0,
      unit: product.unit || 'Piece',
      stockQuantity: product.stockQuantity ?? product.quantity ?? 0,
      reorderLevel: product.reorderLevel ?? product.lowStockThreshold ?? 20,
      category: product.category,
      barcode: product.barcode || ''
    });
    setRetainedImages(getProductImagePaths(product));
    setImages([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleViewDescription = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setShowDescriptionModal(true);
  };

  const handlePrintLabel = (product) => {
    if (!product?.barcode) {
      toast.error('This product does not have a barcode yet');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=500,height=700');

    if (!printWindow) {
      toast.error('Please allow pop-ups to print the barcode label');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode Label</title>
          <style>
            body { margin: 0; display: grid; place-items: center; background: #fff; font-family: Arial, sans-serif; }
            .label { width: 260px; border: 2px solid #111827; border-radius: 12px; padding: 18px; text-align: center; }
            .bars { display: flex; justify-content: center; align-items: end; gap: 2px; margin: 0 auto 12px; height: 72px; }
            .bar { display: block; background: #111827; }
            .code { font-family: monospace; font-size: 16px; letter-spacing: 1px; margin-top: 8px; }
            .name { font-weight: 700; font-size: 17px; margin-top: 8px; }
            .price { font-size: 15px; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="bars">
              ${product.barcode.split('').map((digit) => {
                const isDark = Number(digit) % 2 === 0;
                const width = `${Math.max(3, Number(digit) * 2 + 5)}px`;
                const height = isDark ? '40px' : '60px';
                return `<span class="bar" style="width:${width}; height:${height};"></span>`;
              }).join('')}
            </div>
            <div class="code">${product.barcode}</div>
            <div class="name">${product.name}</div>
            <div class="price">₦${Number(product.price || 0).toFixed(2)}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sellingPrice: '',
      costPrice: '',
      taxRate: '0',
      unit: 'Piece',
      stockQuantity: '',
      reorderLevel: '20',
      category: 'Groceries',
      barcode: ''
    });
    setImages([]);
    setRetainedImages([]);
  };

  const removeRetainedImage = (imagePath) => {
    setRetainedImages((currentImages) => currentImages.filter((image) => image !== imagePath));
  };

  const getProductProfit = (product) => {
    const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);
    const costPrice = Number(product.costPrice ?? 0);
    return Number((sellingPrice - costPrice).toFixed(2));
  };

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusColor = (quantity, threshold) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity <= threshold) return 'bg-red-50 text-red-700';
    return 'bg-primary-50 text-primary-700';
  };

  const selectedProductImages = getProductImagePaths(selectedProduct);
  const selectedStock = Number(selectedProduct?.stockQuantity ?? selectedProduct?.quantity ?? 0);
  const selectedCost = Number(selectedProduct?.costPrice ?? 0);
  const selectedPrice = Number(selectedProduct?.sellingPrice ?? selectedProduct?.price ?? 0);
  const selectedUnit = selectedProduct?.unit || 'Piece';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <details className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-800">Inventory valuation</summary>
        <section className="space-y-4 border-t border-gray-200 p-4">
          <p className="text-sm text-gray-500">Current stock value and potential margin. This is separate from actual profit.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-gray-500">Total Inventory Cost Value</p><p className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(valuation.totals.totalCostValue)}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-gray-500">Total Inventory Selling Value</p><p className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(valuation.totals.totalSellingValue)}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-gray-500">Total Potential Profit</p><p className="mt-2 text-2xl font-bold text-primary-700">{formatMoney(valuation.totals.potentialProfit)}</p></div>
        </div>
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-right">Available Stock</th><th className="px-4 py-3 text-right">Cost Price</th><th className="px-4 py-3 text-right">Selling Price</th><th className="px-4 py-3 text-right">Total Cost Value</th><th className="px-4 py-3 text-right">Total Selling Value</th><th className="px-4 py-3 text-right">Potential Profit</th></tr></thead>
            <tbody className="divide-y divide-gray-200">{valuation.products.map((product) => <tr key={product.productId}><td className="px-4 py-3 font-medium">{product.name}</td><td className="px-4 py-3 text-right">{product.availableStock} {product.unit || 'Piece'}</td><td className="px-4 py-3 text-right">{formatMoney(product.costPrice)} / {product.unit || 'Piece'}</td><td className="px-4 py-3 text-right">{formatMoney(product.sellingPrice)} / {product.unit || 'Piece'}</td><td className="px-4 py-3 text-right">{formatMoney(product.totalCostValue)}</td><td className="px-4 py-3 text-right">{formatMoney(product.totalSellingValue)}</td><td className="px-4 py-3 text-right font-medium text-primary-700">{formatMoney(product.potentialProfit)}</td></tr>)}</tbody>
          </table>
        </div>
        </section>
      </details>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ProductImage
                      src={getProductImagePaths(product)[0]}
                      alt={product.name}
                      containerClassName="h-10 w-10 shrink-0 rounded-full"
                      imageClassName="h-full w-full object-cover"
                    />
                    <div className="ml-4">
                      <button
                        type="button"
                        onClick={() => handleViewDescription(product)}
                        className="text-left text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        {product.name}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{Number(product.sellingPrice ?? product.price ?? 0).toFixed(2)} / {product.unit || 'Piece'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Number(product.stockQuantity ?? product.quantity ?? 0)} {product.unit || 'Piece'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(Number(product.stockQuantity ?? product.quantity ?? 0), Number(product.reorderLevel ?? product.lowStockThreshold ?? 0))}`}>
                    {getStockStatus(Number(product.stockQuantity ?? product.quantity ?? 0), Number(product.reorderLevel ?? product.lowStockThreshold ?? 0))}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewDescription(product)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label={`View description for ${product.name}`}
                    >
                      <EyeIcon className="mr-1.5 h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="rounded-md border border-primary-200 bg-primary-50 p-2 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label={`Edit ${product.name}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700 shadow-sm hover:border-red-300 hover:bg-red-100 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label={`Delete ${product.name}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Description Modal */}
      {showDescriptionModal && selectedProduct && (
        <div className="fixed inset-0 z-20 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="product-details-title">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => { setShowDescriptionModal(false); setSelectedProduct(null); }}></div>
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-xl bg-white text-left shadow-2xl">
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Product details</p>
                  <h3 id="product-details-title" className="mt-1 text-xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowDescriptionModal(false); setSelectedProduct(null); }}
                  className="rounded-md px-2 py-1 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close product details"
                >×</button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-2">
                <div>
                  <ProductImage
                    src={selectedProductImages[Math.min(activeImageIndex, Math.max(selectedProductImages.length - 1, 0))]}
                    alt={`${selectedProduct.name} ${activeImageIndex + 1}`}
                    containerClassName="h-72 w-full rounded-lg bg-gray-50"
                    imageClassName="h-full w-full object-contain"
                  />
                  {selectedProductImages.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {selectedProductImages.map((imagePath, index) => (
                        <button
                          key={imagePath}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`shrink-0 overflow-hidden rounded-md border-2 ${activeImageIndex === index ? 'border-primary-600' : 'border-transparent'}`}
                          aria-label={`View product image ${index + 1}`}
                        >
                          <ProductImage
                            src={imagePath}
                            alt={`${selectedProduct.name} thumbnail ${index + 1}`}
                            containerClassName="h-16 w-16"
                            imageClassName="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Selling price / {selectedUnit}</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(selectedPrice)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockStatusColor(selectedStock, Number(selectedProduct.reorderLevel ?? selectedProduct.lowStockThreshold ?? 0))}`}>
                      {getStockStatus(selectedStock, Number(selectedProduct.reorderLevel ?? selectedProduct.lowStockThreshold ?? 0))}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-gray-200 py-4 text-sm">
                    <div><dt className="text-gray-500">Category</dt><dd className="mt-1 font-medium text-gray-900">{selectedProduct.category || '—'}</dd></div>
                    <div><dt className="text-gray-500">Stock quantity</dt><dd className="mt-1 font-medium text-gray-900">{selectedStock} {selectedUnit}</dd></div>
                    <div><dt className="text-gray-500">Cost price / {selectedUnit}</dt><dd className="mt-1 font-medium text-gray-900">{formatMoney(selectedCost)}</dd></div>
                    <div><dt className="text-gray-500">Profit per {selectedUnit}</dt><dd className="mt-1 font-medium text-gray-900">{formatMoney(selectedPrice - selectedCost)}</dd></div>
                    <div><dt className="text-gray-500">Reorder level</dt><dd className="mt-1 font-medium text-gray-900">{Number(selectedProduct.reorderLevel ?? selectedProduct.lowStockThreshold ?? 0)} {selectedUnit}</dd></div>
                    <div><dt className="text-gray-500">Tax rate</dt><dd className="mt-1 font-medium text-gray-900">{Number(selectedProduct.taxRate || 0)}%</dd></div>
                    <div><dt className="text-gray-500">Inventory value</dt><dd className="mt-1 font-medium text-gray-900">{formatMoney(selectedStock * selectedCost)}</dd></div>
                    <div><dt className="text-gray-500">Potential profit</dt><dd className="mt-1 font-medium text-gray-900">{formatMoney(selectedStock * (selectedPrice - selectedCost))}</dd></div>
                    <div><dt className="text-gray-500">Unit</dt><dd className="mt-1 font-medium text-gray-900">{selectedUnit}</dd></div>
                    <div><dt className="text-gray-500">Barcode</dt><dd className="mt-1 break-all font-medium text-gray-900">{selectedProduct.barcode || '—'}</dd></div>
                  </dl>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Description</h4>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">{selectedProduct.description || 'No description provided.'}</p>
                  </div>

                  {(selectedProduct.createdAt || selectedProduct.updatedAt) && (
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                      {selectedProduct.createdAt && <span>Created {new Date(selectedProduct.createdAt).toLocaleDateString()}</span>}
                      {selectedProduct.updatedAt && <span>Updated {new Date(selectedProduct.updatedAt).toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct.barcode && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className="text-xs font-semibold uppercase text-gray-500">Barcode</p><p className="mt-1 font-mono text-sm text-gray-800">{selectedProduct.barcode}</p></div>
                    <button type="button" onClick={() => handlePrintLabel(selectedProduct)} className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <PrinterIcon className="mr-2 h-4 w-4" />Print Label
                    </button>
                  </div>
                  <div className="mt-4 print-label-preview"><BarcodeLabel product={selectedProduct} /></div>
                </div>
              )}

              <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button type="button" onClick={() => { setShowDescriptionModal(false); setSelectedProduct(null); }} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Barcode (UPC/EAN)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          placeholder="Enter barcode"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={generateBarcode}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Generate
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Optional: Enter 12-13 digit barcode for scanner compatibility
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Selling Price (₦)
                        </label>
                        <input
                          type="number"
                          name="sellingPrice"
                          value={formData.sellingPrice}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost Price (₦)
                        </label>
                        <input
                          type="number"
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit of Measurement
                        </label>
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          name="stockQuantity"
                          value={formData.stockQuantity}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reorder Level
                        </label>
                        <input
                          type="number"
                          name="reorderLevel"
                          value={formData.reorderLevel}
                          onChange={handleInputChange}
                          min="0"
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images
                      </label>
                      {editingProduct && (
                        <div className="mb-3 flex flex-wrap gap-3">
                          {retainedImages.length > 0 ? retainedImages.map((imagePath) => (
                            <div key={imagePath} className="relative">
                              <ProductImage
                                src={imagePath}
                                alt="Product gallery image"
                                containerClassName="h-20 w-20 rounded-md border border-gray-200"
                                imageClassName="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeRetainedImage(imagePath)}
                                className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-600 shadow"
                                aria-label="Remove product image"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )) : <span className="text-xs text-gray-500">No saved product images.</span>}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Select multiple images. New images are added to the product gallery.</p>
                      {images.length > 0 && <p className="mt-1 text-xs text-gray-600">{images.length} image{images.length === 1 ? '' : 's'} selected.</p>}
                      {uploadProgress !== null && (
                        <div className="mt-3" role="status" aria-live="polite">
                          <div className="mb-1 flex justify-between text-xs text-gray-600"><span>Uploading images</span><span>{uploadProgress}%</span></div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full bg-primary-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? (images.length > 0 ? `Uploading${uploadProgress === null ? '...' : ` ${uploadProgress}%`}` : 'Saving...') : (editingProduct ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;



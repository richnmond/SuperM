import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, XMarkIcon, ShoppingCartIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import BarcodeScanner from '../components/BarcodeScanner';
import ReceiptModal from '../components/ReceiptModal';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const categories = [
    'All',
    'Groceries',
    'Beverages',
    'Snacks',
    'Dairy',
    'Meat',
    'Produce',
    'Household'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const handleBarcodeScan = (product) => {
    addToCart(product);
    setShowScanner(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error('Product out of stock');
      return;
    }

    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('Not enough stock available');
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
      return;
    }

    setCart([
      ...cart,
      {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      }
    ]);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p._id === productId);

    if (!product) {
      return;
    }

    if (newQuantity > product.quantity) {
      toast.error('Not enough stock available');
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const { data: sale } = await axios.post('http://localhost:5000/api/sales', {
        items: cart,
        totalAmount: calculateTotal(),
        paymentMethod
      });

      toast.success('Sale completed successfully');
      setReceiptSale(sale);
      setShowReceipt(true);
      setCart([]);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Point of Sale</h1>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col min-h-0">
          <div className="p-4 border-b">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Scan
              </button>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product._id}
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                  className={`p-4 border rounded-lg text-left hover:shadow-md transition-shadow ${
                    product.quantity <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:border-primary-500'
                  }`}
                >
                  {product.image && (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">N{product.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">Stock: {product.quantity}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-96 bg-white rounded-lg shadow flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Shopping Cart
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-start space-x-2 pb-4 border-b">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">N{item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 border rounded-l-md hover:bg-gray-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                          className="w-16 px-2 py-1 border-t border-b text-center"
                        />
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 border rounded-r-md hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">N{item.subtotal.toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-800 mt-2"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="space-y-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total:</span>
                <span>N{calculateTotal().toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom sm:align-middle w-full">
              <BarcodeScanner onProductFound={handleBarcodeScan} onClose={() => setShowScanner(false)} />
            </div>
          </div>
        </div>
      )}

      {showReceipt && receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          onClose={() => {
            setShowReceipt(false);
            setReceiptSale(null);
          }}
        />
      )}
    </div>
  );
};

export default POS;

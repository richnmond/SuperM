import React, { useState, useEffect, useRef } from 'react';
import { QrCodeIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const BarcodeScanner = ({ onProductFound, onClose }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const scanBufferRef = useRef('');

  // Handle barcode scanner input (scanners act as keyboard)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isScanning || manualMode) return;

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Check if it's likely a barcode scanner (rapid succession)
      if (e.key.length === 1) {
        scanBufferRef.current += e.key;
        setBarcode(scanBufferRef.current);
      } else if (e.key === 'Enter') {
        // Scanner usually sends Enter after barcode
        if (scanBufferRef.current.length > 0) {
          lookupBarcode(scanBufferRef.current);
        }
      }

      // Set timeout to detect end of scan
      timeoutRef.current = setTimeout(() => {
        if (scanBufferRef.current.length > 0) {
          lookupBarcode(scanBufferRef.current);
        }
      }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isScanning, manualMode]);

  const lookupBarcode = async (code) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/barcode/lookup/${code}`);
      onProductFound(response.data);
      setBarcode('');
      scanBufferRef.current = '';
      toast.success(`Product found: ${response.data.name}`);
      
      // Auto-close after successful scan if in modal
      if (onClose) {
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error(`Product with barcode ${code} not found`);
        // Option to add new product with this barcode
        if (window.confirm(`Product not found. Would you like to add it with barcode ${code}?`)) {
          window.location.href = `/products?barcode=${code}&add=true`;
        }
      } else {
        toast.error('Error looking up barcode');
      }
      setBarcode('');
      scanBufferRef.current = '';
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      lookupBarcode(barcode.trim());
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setManualMode(false);
    setBarcode('');
    scanBufferRef.current = '';
    toast.success('Scanner ready - please scan a barcode', {
      duration: 3000
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <QrCodeIcon className="h-5 w-5 mr-2" />
          Barcode Scanner
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {!isScanning && !manualMode ? (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <CameraIcon className="h-5 w-5 mr-2" />
            Start Scanning
          </button>
          
          <button
            onClick={() => {
              setManualMode(true);
              setIsScanning(true);
              setBarcode('');
              scanBufferRef.current = '';
            }}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Enter Barcode Manually
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isScanning && !manualMode && (
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <div className="h-16 w-16 bg-primary-100 rounded-full mx-auto flex items-center justify-center">
                  <CameraIcon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Scanner is ready
              </p>
              <p className="text-xs text-gray-500">
                Position barcode in front of scanner or type manually below
              </p>
            </div>
          )}

          {manualMode && (
            <form onSubmit={handleManualSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Barcode
              </label>
              <input
                type="text"
                ref={inputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter 12-13 digit barcode"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
              <div className="mt-4 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Lookup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(false);
                    setIsScanning(false);
                    setBarcode('');
                    scanBufferRef.current = '';
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {isScanning && !manualMode && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsScanning(false);
                  setManualMode(true);
                  setBarcode('');
                  scanBufferRef.current = '';
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Switch to Manual Entry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;

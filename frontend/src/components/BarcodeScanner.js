import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QrCodeIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const BarcodeScanner = ({ onProductFound, onClose }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const scanBufferRef = useRef('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const detectorRef = useRef(null);
  const lookupInFlightRef = useRef(false);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeScanner();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      unmountedRef.current = true;
      stopCamera();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

  const stopCamera = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    detectorRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const closeScanner = () => {
    stopCamera();
    setIsScanning(false);
    setCameraStatus('idle');
    if (onClose) onClose();
  };

  const startCamera = async () => {
    setCameraStatus('requesting');
    setCameraError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not available in this browser. Use manual entry instead.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      if (unmountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus('active');

      if ('BarcodeDetector' in window) {
        detectorRef.current = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'codabar', 'itf']
        });

        const detectBarcode = async () => {
          if (!detectorRef.current || !videoRef.current || unmountedRef.current) return;
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes?.length && !lookupInFlightRef.current) {
              lookupBarcode(codes[0].rawValue);
            }
          } catch (error) {
            setCameraError('Barcode detection failed. Keep the code in the preview or enter it manually.');
          }
          if (!unmountedRef.current) animationFrameRef.current = requestAnimationFrame(detectBarcode);
        };
        animationFrameRef.current = requestAnimationFrame(detectBarcode);
      } else {
        setCameraError('Automatic camera detection is not supported by this browser. Use a connected scanner or manual entry.');
      }
    } catch (error) {
      stopCamera();
      const denied = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError';
      const unavailable = error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError';
      if (denied) setCameraError('Camera permission was denied. Allow camera access, or enter the barcode manually.');
      else if (unavailable) setCameraError('No camera was found on this device. Use a connected scanner or enter the barcode manually.');
      else setCameraError(error.message || 'Unable to start the camera. Use manual entry instead.');
      setCameraStatus('error');
    }
  };

  const lookupBarcode = async (code) => {
    if (lookupInFlightRef.current) return;
    lookupInFlightRef.current = true;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/barcode/lookup/${encodeURIComponent(code)}`);
      onProductFound(response.data);
      setBarcode('');
      scanBufferRef.current = '';
      toast.success(`Product found: ${response.data.name}`);
      
      // Auto-close after successful scan if in modal
      if (onClose) {
        setTimeout(closeScanner, 1500);
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
    } finally {
      lookupInFlightRef.current = false;
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      lookupBarcode(barcode.trim());
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
    setManualMode(false);
    setBarcode('');
    scanBufferRef.current = '';
    await startCamera();
  };

  const switchToManual = () => {
    stopCamera();
    setManualMode(true);
    setIsScanning(true);
    setCameraStatus('idle');
    setBarcode('');
    scanBufferRef.current = '';
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const scanner = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-gray-900/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Barcode scanner">
      <div className="absolute inset-0" onClick={closeScanner} aria-hidden="true" />
      <div className="relative z-[10000] max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Barcode Scanner
          </h3>
          <button type="button" onClick={closeScanner} className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close barcode scanner">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {!isScanning || manualMode ? (
          manualMode ? (
            <form onSubmit={handleManualSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="barcode-input">Enter Barcode</label>
              <input id="barcode-input" type="text" ref={inputRef} value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Enter 12-13 digit barcode" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" autoFocus />
              {cameraError && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{cameraError}</p>}
              <div className="mt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">Lookup</button>
                <button type="button" onClick={closeScanner} className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <button type="button" onClick={startScanning} className="w-full flex items-center justify-center px-4 py-3 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <CameraIcon className="h-5 w-5 mr-2" /> Start Scanning
              </button>
              <button type="button" onClick={switchToManual} className="w-full px-4 py-3 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Enter Barcode Manually</button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
              <div className="pointer-events-none absolute inset-[18%] rounded-md border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              {cameraStatus === 'requesting' && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">Starting camera...</div>}
              {cameraStatus === 'error' && <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white bg-black/70">{cameraError}</div>}
            </div>
            {cameraStatus === 'active' && !cameraError && <p className="text-center text-sm text-gray-600">Position the barcode inside the frame</p>}
            {cameraError && cameraStatus !== 'error' && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{cameraError}</p>}
            <button type="button" onClick={switchToManual} className="w-full py-2 px-4 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Switch to Manual Entry</button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(scanner, document.body);
};

export default BarcodeScanner;

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const BarcodeLabel = ({ product, size = 200 }) => {
  // Simple barcode visualization (for printing labels)
  // In production, you'd use a proper barcode library
  
  if (!product.barcode) return null;

  return (
    <div className="bg-white p-4 rounded-lg border text-center">
      <div className="mb-2">
        {/* Simple barcode representation */}
        <div className="flex justify-center space-x-[2px]">
          {product.barcode.split('').map((digit, index) => (
            <div
              key={index}
              className={`${
                parseInt(digit) % 2 === 0 ? 'w-[3px] h-12' : 'w-[5px] h-16'
              } bg-black`}
              style={{
                width: `${parseInt(digit) * 2 + 5}px`,
                height: '60px'
              }}
            />
          ))}
        </div>
      </div>
      <div className="font-mono text-sm">{product.barcode}</div>
      <div className="font-bold mt-1">{product.name}</div>
      <div className="text-sm">${product.price.toFixed(2)}</div>
    </div>
  );
};

export default BarcodeLabel;
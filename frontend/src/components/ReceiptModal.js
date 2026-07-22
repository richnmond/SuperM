import React, { useCallback, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const formatMoney = (value) => `N${Number(value || 0).toFixed(2)}`;

const toTitleCase = (value) => {
  if (!value) return '';
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const ReceiptModal = ({ sale, onClose }) => {
  const { user } = useAuth();
  const businessName = user?.businessName?.trim() || 'SuperM Market';
  const formattedSaleNumber = sale?.saleId ? String(sale.saleId).padStart(3, '0') : '000';

  const handleClose = useCallback(() => {
    document.body.classList.remove('receipt-printing');
    onClose?.();
  }, [onClose]);

  const handlePrint = useCallback(() => {
    document.body.classList.add('receipt-printing');

    const cleanup = () => document.body.classList.remove('receipt-printing');
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(cleanup, 4000);

    setTimeout(() => window.print(), 50);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  if (!sale) return null;

  const saleDate = sale.createdAt ? new Date(sale.createdAt) : new Date();
  const items = Array.isArray(sale.items) ? sale.items : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item?.subtotal || 0), 0);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] no-print"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-md">
          <div
            id="receipt-print-root"
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          > 
            <div className="px-5 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold leading-tight">{businessName}</h2>
                  <p className="text-white/80 text-xs mt-0.5">Store Receipt</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2 text-right">
                  <div className="text-[11px] text-white/80">Total</div>
                  <div className="text-sm font-semibold">{formatMoney(sale.totalAmount)}</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Sale ID</div>
                  <div className="text-sm font-mono text-gray-900 break-all">#{formattedSaleNumber}</div>
                  <div className="text-xs text-gray-500 mt-2">Date</div>
                  <div className="text-sm text-gray-900">{saleDate.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-2">Payment</div>
                  <div className="text-sm text-gray-900">{toTitleCase(sale.paymentMethod || '-')}</div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2">
                    <QRCodeSVG value={String(sale._id || 'sale')} size={92} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-2">Scan for ID</div>
                </div>
              </div>

              <div className="mt-4 border-t border-dashed pt-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-sm text-gray-500">No items</div>
                  ) : (
                    items.map((item, index) => (
                      <div key={`${item.productId || item.productName || 'item'}-${index}`} className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.productName || 'Item'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {Number(item.quantity || 0)} × {formatMoney(item.price)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatMoney(item.subtotal)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-dashed pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Discount</span>
                    <span>{formatMoney(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>{formatMoney(Number(sale.totalAmount || 0) - subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-semibold pt-2 border-t border-gray-200">
                    <span>Grand Total</span>
                    <span>{formatMoney(sale.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center text-xs text-gray-500">
                Thank you for your purchase!
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
            >
              Print
            </button>
            <button
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptModal;


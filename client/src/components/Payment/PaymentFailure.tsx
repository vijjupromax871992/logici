// client/src/components/Payment/PaymentFailure.tsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const reason = searchParams.get('reason') || 'Payment was not completed';
  const warehouseId = searchParams.get('warehouse_id');
  const warehouseName = searchParams.get('warehouse_name');

  const handleRetryPayment = () => {
    if (warehouseId) {
      navigate(`/warehouse/${warehouseId}`);
    } else {
      navigate('/warehouses');
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@logic-i.com?subject=Payment Issue - Need Assistance';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
          {/* Header */}
          <div className="bg-red-50 px-6 py-8 text-center border-b border-red-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Payment Failed
            </h1>
            <p className="text-red-600">
              Your booking payment could not be processed
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                What went wrong?
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">{reason}</p>
              </div>
            </div>

            {warehouseName && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </h3>
                <p className="text-gray-900">{warehouseName}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Common solutions:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></span>
                  Check your internet connection and try again
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></span>
                  Ensure your card has sufficient balance
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></span>
                  Try using a different payment method
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></span>
                  Contact your bank if the issue persists
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
              
              <button
                onClick={handleContactSupport}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contact Support
              </button>

              <button
                onClick={() => navigate('/warehouses')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Browse Other Warehouses
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Homepage
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need immediate assistance?{' '}
              <a
                href="tel:+917021059530"
                className="text-blue-600 hover:text-blue-700"
              >
                Call +91 7021059530
              </a>
            </p>
          </div>
        </div>

        {/* Additional Help Card */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Payment Security
              </h4>
              <p className="text-xs text-blue-700">
                Your payment information is secure and protected. No charges
                have been made to your account for this failed transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
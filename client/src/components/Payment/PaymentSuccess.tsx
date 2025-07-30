// client/src/components/Payment/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../config/api';

interface BookingDetails {
  booking_number: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  warehouse: {
    name: string;
    address: string;
    city: string;
  };
  amount_paid: number;
  payment_date: string;
  status: string;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingNumber = searchParams.get('booking');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (!bookingNumber && !paymentId) {
      setError('Invalid booking reference');
      setIsLoading(false);
      return;
    }

    fetchBookingDetails();
  }, [bookingNumber, paymentId]);

  const fetchBookingDetails = async () => {
    try {
      if (paymentId) {
        // Fetch by payment ID
        const response = await axios.get(
          `${BACKEND_URL}/api/public/payments/${paymentId}/status`
        );
        
        if (response.data.success) {
          // Transform payment data to booking details format
          const paymentData = response.data.data;
          setBookingDetails({
            booking_number: 'Processing...',
            fullName: paymentData.booking_details.fullName,
            email: paymentData.booking_details.email,
            phoneNumber: paymentData.booking_details.phoneNumber,
            companyName: paymentData.booking_details.companyName,
            warehouse: {
              name: paymentData.warehouse.name,
              address: paymentData.warehouse.address || '',
              city: paymentData.warehouse.city || '',
            },
            amount_paid: paymentData.amount,
            payment_date: paymentData.created_at,
            status: 'confirmed',
          });
        }
      }
      // If we have booking number, we could fetch booking details
      // but for now, we'll show a success message
    } catch (error) {
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 p-8 rounded-xl shadow-lg border border-red-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Your warehouse booking has been confirmed
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h2 className="text-xl font-semibold text-green-800">
              Booking Confirmation
            </h2>
          </div>

          <div className="p-6">
            {bookingDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Booking Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Booking Number</p>
                      <p className="font-medium text-gray-900">
                        {bookingDetails.booking_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium text-gray-900">
                        {bookingDetails.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900">
                        {bookingDetails.companyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium text-gray-900">
                        {bookingDetails.email}
                      </p>
                      <p className="font-medium text-gray-900">
                        {bookingDetails.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Warehouse Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Warehouse Name</p>
                      <p className="font-medium text-gray-900">
                        {bookingDetails.warehouse.name}
                      </p>
                    </div>
                    {bookingDetails.warehouse.address && (
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">
                          {bookingDetails.warehouse.address}
                        </p>
                        <p className="font-medium text-gray-900">
                          {bookingDetails.warehouse.city}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatAmount(bookingDetails.amount_paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(bookingDetails.payment_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Your payment has been processed successfully!
                </p>
                <p className="text-sm text-gray-500">
                  Booking confirmation details will be sent to your email shortly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            What happens next?
          </h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </span>
              <p>
                <strong>Confirmation Email:</strong> You'll receive a detailed
                booking confirmation email with all the information.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </span>
              <p>
                <strong>Owner Contact:</strong> The warehouse owner will contact
                you within 24 hours to discuss arrangements.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </span>
              <p>
                <strong>Site Visit:</strong> Schedule a visit to finalize the
                warehouse booking details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Back to Homepage
          </button>
          <button
            onClick={() => navigate('/warehouses')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse More Warehouses
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 p-6 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-2">
            Need help or have questions about your booking?
          </p>
          <p className="text-sm text-gray-500">
            Contact us at{' '}
            <a
              href="mailto:support@logic-i.com"
              className="text-blue-600 hover:text-blue-700"
            >
              support@logic-i.com
            </a>{' '}
            or call us at{' '}
            <a
              href="tel:+911234567890"
              className="text-blue-600 hover:text-blue-700"
            >
              +91 12345 67890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
// client/src/components/Payment/PaymentBookingForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config/api';

interface PaymentBookingFormProps {
  warehouseId: string;
  warehouseName: string;
  onClose: () => void;
  onSuccess: (bookingNumber: string) => void;
}

interface BookingData {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  preferredContactMethod: string;
  preferredContactTime: string;
  preferredStartDate: string;
  message: string;
}

// Declare Razorpay interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentBookingForm: React.FC<PaymentBookingFormProps> = ({
  warehouseId,
  warehouseName,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<BookingData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    preferredContactMethod: 'Email',
    preferredContactTime: '9 AM - 6 PM',
    preferredStartDate: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Payment, 3: Inquiry Saved
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Valid 10-digit phone number is required');
      return false;
    }
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.preferredStartDate) {
      setError('Preferred start date is required');
      return false;
    }
    return true;
  };

  // Save inquiry when payment is cancelled
  const saveInquiryOnly = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/public/bookings`, {
        warehouse_id: warehouseId,
        ...formData,
      });
      setPaymentCancelled(true);
      setCurrentStep(3);
      setError('');
    } catch (error) {
      throw error; // Re-throw so caller can handle
    }
  };

  const createPaymentOrder = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await axios.post(
        `${BACKEND_URL}/api/public/payments/create-order`,
        {
          warehouse_id: warehouseId,
          ...formData,
        }
      );

      if (response.data.success) {
        initiatePayment(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to create payment order');
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to create payment order'
      );
      setIsSubmitting(false);
    }
  };

  const initiatePayment = (orderData: any) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Logic-i',
      description: `Warehouse Booking - ${orderData.warehouse.name}`,
      order_id: orderData.order_id,
      handler: function (response: any) {
        verifyPayment(response);
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phoneNumber,
      },
      notes: {
        warehouse_id: warehouseId,
        warehouse_name: warehouseName,
      },
      theme: {
        color: '#007bff',
      },
      modal: {
        ondismiss: function () {
          handlePaymentFailure('Payment cancelled by user');
        },
        confirm_close: true, // Show confirmation before closing
      },
    };

    const razorpay = new window.Razorpay(options);
    
    // Add error handler
    razorpay.on('payment.failed', function (response: any) {
      handlePaymentFailure(`Payment failed: ${response.error.description}`);
    });

    razorpay.open();
    setIsSubmitting(false); // Stop the loading spinner once payment modal opens
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/public/payments/verify`,
        {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }
      );

      if (response.data.success) {
        onSuccess(response.data.data.booking_number);
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Payment verification failed. Please contact support.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentFailure = async (reason: string) => {
    setIsSubmitting(true);
    setError(null); // Clear any existing errors
    
    try {
      // Save inquiry details when payment fails/cancelled
      await axios.post(`${BACKEND_URL}/api/public/bookings`, {
        warehouse_id: warehouseId,
        ...formData,
      });
      
      // Successfully saved inquiry
      setPaymentCancelled(true);
      setCurrentStep(3);
    } catch (error) {
      setError('Payment was cancelled, but we couldn\'t save your inquiry. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep(2);
      createPaymentOrder();
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setIsSubmitting(false);
    setError(null);
    setPaymentCancelled(false);
  };

  // Inquiry Saved Success UI
  if (currentStep === 3 && paymentCancelled) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 text-orange-600">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Cancelled - Don't Worry!
        </h3>
        <p className="text-gray-600 mb-4">
          Your payment was cancelled, but we've saved your inquiry details.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium mb-2">
            🏢 Our warehouse specialist will contact you shortly!
          </p>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• We'll call you within 24 hours using {formData.preferredContactMethod.toLowerCase()}</p>
            <p>• Discuss pricing, availability, and answer all your questions</p>
            <p>• No payment required until you're completely satisfied</p>
            <p>• Free warehouse consultation and site visit</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-green-800 text-sm font-medium">
            ✅ Your inquiry for "{warehouseName}" has been saved successfully!
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              setCurrentStep(1);
              setPaymentCancelled(false);
              setError(null);
            }}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Try Payment Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-800">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                Booking Fee: ₹1,000 (Confirms your warehouse booking)
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method *
                </label>
                <select
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Time *
                </label>
                <select
                  name="preferredContactTime"
                  value={formData.preferredContactTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="9 AM - 12 PM">9 AM - 12 PM</option>
                  <option value="12 PM - 3 PM">12 PM - 3 PM</option>
                  <option value="3 PM - 6 PM">3 PM - 6 PM</option>
                  <option value="9 AM - 6 PM">9 AM - 6 PM</option>
                  <option value="Anytime">Anytime</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Start Date *
                </label>
                <input
                  type="date"
                  name="preferredStartDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.preferredStartDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Message
              </label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Any specific requirements or questions..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Proceed to Payment (₹1,000)
              </button>
            </div>
          </form>
        </>
      )}

      {currentStep === 2 && (
        <div className="text-center py-8">
          <div className="mb-4">
            {isSubmitting ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isSubmitting ? 'Processing...' : 'Payment Gateway Loading...'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isSubmitting
              ? 'Please wait while we process your request.'
              : 'The payment window will open shortly. Please complete your payment of ₹1,000 to confirm your booking.'}
          </p>
          {!isSubmitting && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Form
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentBookingForm;
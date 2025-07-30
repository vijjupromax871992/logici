import React, { useState } from 'react';
import { BACKEND_URL } from '../../config/api';

interface ContactFormPopupProps {
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  preferredContactMethod: string;
  preferredContactTime: string;
}

const ContactFormPopup: React.FC<ContactFormPopupProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    preferredContactMethod: '',
    preferredContactTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/public/contactOnly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          companyName: '',
          preferredContactMethod: '',
          preferredContactTime: '',
        });
        // Show success message for 2 seconds then close
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit contact request');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while submitting the form. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-lg animate-fadeIn border-t-4 border-sky-500">
        {/* Header */}
        <div className="bg-sky-50 rounded-t-lg p-5 border-b border-sky-100">
          <h2 className="text-xl md:text-2xl font-semibold text-[#00599c]">Contact Us</h2>
          <button 
            className="absolute top-4 right-4 text-[#00599c] hover:text-[#00599c] transition-colors duration-200 focus:outline-none" 
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form content */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">Your contact request has been submitted successfully. We will get back to you soon.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">Complete the form below and our team will connect with you shortly.</p>
              
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="ml-3 text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              )}
              
              <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Rajesh Kumar"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address*
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  placeholder="rajesh@example.co.in"
                />
              </div>
            </div>

            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number*
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name*
                </label>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Reliance Industries Ltd"
                />
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700">
                  Preferred Contact Method
                </label>
                <select
                  id="preferredContactMethod"
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white"
                >
                  <option value="">Please select</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="preferredContactTime" className="block text-sm font-medium text-gray-700">
                  Preferred Contact Time
                </label>
                <input
                  id="preferredContactTime"
                  type="text"
                  name="preferredContactTime"
                  value={formData.preferredContactTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
                  placeholder="e.g., Morning, 10 AM - 12 PM IST"
                />
              </div>
            </div>
            
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-300 text-center ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-[#00599c] text-white hover:bg-[#dbb269] hover:text-black'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactFormPopup;
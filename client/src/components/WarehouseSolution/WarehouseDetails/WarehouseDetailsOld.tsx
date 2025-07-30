import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BACKEND_URL } from '../../../config/api';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  warehouse_type: string;
  build_up_area: number;
  total_plot_area: number;
  total_parking_area: number;
  electricity_kva: number;
  rent: number;
  deposit: number;
  description: string;
  comments: string;
  floor_plans: string;
  images?: string;
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Property Detail Helper Component
interface PropertyDetailProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2 sm:mr-3">
      {icon}
    </div>
    <div>
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="text-sm sm:text-base font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

const WarehouseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isContactFormVisible, setIsContactFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Determine if this is part of the user panel or public view
  const isUserPanel = location.pathname.includes('/user-panel');
  const baseUrl = `${BACKEND_URL}`;

  // Process images function
  const processImages = useCallback(
    (images?: string | string[] | null): string[] => {
      // Default image if nothing is provided
      if (!images) return [`${baseUrl}/uploads/default.jpg`];

      // Handle array format
      if (Array.isArray(images)) {
        return images.filter(Boolean).map((img) => {
          if (typeof img !== 'string') return `${baseUrl}/uploads/default.jpg`;
          if (img.startsWith('http')) return img;
          return `${baseUrl}/${img}`;
        });
      }

      // Handle string format (comma-separated)
      if (typeof images === 'string') {
        return images
          .split(',')
          .map((img) => img.trim())
          .filter(Boolean)
          .map((img) => {
            if (img.startsWith('http')) return img;
            return `${baseUrl}/${img}`;
          });
      }

      // Fallback for any other format
      return [`${baseUrl}/uploads/default.jpg`];
    },
    [baseUrl]
  );
  // Track warehouse view
  const trackWarehouseView = useCallback(async () => {
    if (!id) return;

    try {
      const endpoint = isUserPanel
        ? `${baseUrl}/api/warehouses/${id}/view`
        : `${baseUrl}/api/public/warehouses/${id}/view`;

      const config = isUserPanel
        ? {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        : {};

      await axios.post(endpoint, {}, config);
    } catch (error) {
      // Don't show error to user for tracking failures
    }
  }, [id, isUserPanel, baseUrl]);

  // Fetch warehouse details
  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Use the appropriate endpoint based on whether we're in user panel or public view
        const endpoint = isUserPanel
          ? `${baseUrl}/api/warehouses/${id}`
          : `${baseUrl}/api/public/warehouses/${id}`;

        const config = isUserPanel
          ? {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          : {};

        const response = await axios.get<{ data: Warehouse; success: boolean }>(
          endpoint,
          config
        );

        if (response.data.success) {
          setWarehouse(response.data.data);
          if (!isUserPanel) {
            trackWarehouseView();
          }
        } else {
          setError('Failed to load warehouse details');
        }
      } catch (error) {
        setError('Error loading warehouse. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouseDetails();
  }, [id, isUserPanel, baseUrl, trackWarehouseView]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
          dots: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          dots: true,
          autoplay: false
        }
      }
    ],
    appendDots: (dots: React.ReactNode) => (
      <div className="absolute bottom-2 sm:bottom-4 w-full">
        <ul className="flex justify-center m-0 p-0"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <button className="w-2 h-2 sm:w-3 sm:h-3 mx-1 rounded-full bg-white/60 hover:bg-white transition-colors duration-200" />
    ),
    nextArrow: (
      <button className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white text-xl sm:text-2xl font-light rounded-full transition-colors duration-200 hidden md:flex">
        ›
      </button>
    ),
    prevArrow: (
      <button className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white text-xl sm:text-2xl font-light rounded-full transition-colors duration-200 hidden md:flex">
        ‹
      </button>
    ),
  };

  const handleCheckAvailabilityClick = () => {
    setIsContactFormVisible(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Make sure we're handling images safely
  const images = processImages(warehouse?.images || null);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 p-8 rounded-xl shadow-lg border border-red-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Error Loading Property
          </h2>
          <p className="text-red-600 mb-8 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 p-8 rounded-xl shadow-lg border border-yellow-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Property Not Found
          </h2>
          <p className="text-yellow-700 mb-8 max-w-md mx-auto">
            The warehouse you're looking for could not be found or may have been
            removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const BookingForm = ({
    warehouseId,
    onClose,
  }: {
    warehouseId: string;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      phoneNumber: '',
      companyName: '',
      preferredContactMethod: '',
      preferredContactTime: '',
      preferredStartDate: '',
      message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/public/bookings`,
          {
            ...formData,
            warehouse_id: warehouseId,
          }
        );

        if (response.data.success) {
          setSubmitted(true);
        } else {
          throw new Error(response.data.message || 'Failed to submit booking');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (submitted) {
      return (
        <div className="text-center py-8">
          <div className="mb-4 text-green-600">
            <svg
              className="mx-auto h-12 w-12"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Booking Request Submitted!
          </h3>
          <p className="text-gray-600 mb-6">
            We'll get back to you shortly regarding your inquiry.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

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
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method *
            </label>
            <input
              type="text"
              name="preferredContactMethod"
              required
              value={formData.preferredContactMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Time *
            </label>
            <input
              type="text"
              name="preferredContactTime"
              required
              value={formData.preferredContactTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center text-gray-500">
          <li className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mx-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="hover:text-blue-600 transition-colors"
            >
              Warehouses
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mx-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li className="text-blue-600 font-medium truncate max-w-xs">
            {warehouse.name}
          </li>
        </ol>
      </nav>

      {/* Property Overview - Title and Key Details */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {warehouse.name}
        </h1>
        <div className="flex flex-wrap gap-6 text-sm md:text-base text-gray-600">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {warehouse.city}, {warehouse.state}
            </span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{warehouse.warehouse_type}</span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span>{warehouse.build_up_area.toLocaleString()} Sq.Ft.</span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>₹{warehouse.rent} per Sq.Ft.</span>
          </div>
        </div>
      </div>
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column - Large Image Gallery */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            {images && images.length > 0 ? (
              <Slider {...sliderSettings}>
                {images.map((image, index) => (
                  <div key={index}>
                    <div className="relative pt-[56.25%]">
                      {' '}
                      {/* 16:9 Aspect Ratio */}
                      <img
                        src={image || `${baseUrl}/uploads/default.jpg`}
                        alt={`Warehouse view ${index + 1}`}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite error loop
                          target.src = `${baseUrl}/uploads/default.jpg`;
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              // Fallback for no images
              <div className="relative pt-[56.25%] bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-20 h-20 text-gray-300"
                  >
                    <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"></path>
                    <path d="M6 18h12"></path>
                    <path d="M6 14h12"></path>
                    <rect x="6" y="10" width="12" height="12"></rect>
                    <path d="M12 22v-9"></path>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Warehouse Description */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100">
              <h2 className="text-xl font-semibold p-6">
                Property Description
              </h2>
            </div>
            <div className="p-6">
              {warehouse.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {warehouse.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  No description provided for this property.
                </p>
              )}

              {warehouse.comments && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-medium mb-3">
                    Additional Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {warehouse.comments}
                  </p>
                </div>
              )}

              {warehouse.floor_plans && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-medium mb-3">Floor Plans</h3>
                  <p className="text-gray-700">{warehouse.floor_plans}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100">
              <h2 className="text-xl font-semibold p-6">Location</h2>
            </div>
            <div className="p-6">
              <div className="mb-6 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-700">
                  {warehouse.address}
                  <br />
                  {warehouse.city}, {warehouse.state} {warehouse.pin_code}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Right column - Property Details and Contact */}
        <div className="space-y-8">
          {/* Action Buttons - Mobile Only */}
          <div className="flex gap-4 lg:hidden">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
            <button
              onClick={handleCheckAvailabilityClick}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Check Availability
            </button>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100">
              <h2 className="text-xl font-semibold p-6">
                Property Specifications
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  }
                  label="Build-Up Area"
                  value={`${warehouse.build_up_area.toLocaleString()} Sq.Ft.`}
                />

                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  }
                  label="Warehouse Type"
                  value={warehouse.warehouse_type || 'Standard'}
                />

                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                  }
                  label="Rent"
                  value={`₹${warehouse.rent} per Sq.Ft.`}
                />

                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                  }
                  label="Deposit"
                  value={
                    warehouse.deposit
                      ? `₹${warehouse.deposit.toLocaleString()}`
                      : 'N/A'
                  }
                />

                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  }
                  label="Total Plot Area"
                  value={
                    warehouse.total_plot_area
                      ? `${warehouse.total_plot_area.toLocaleString()} Sq.Ft.`
                      : 'N/A'
                  }
                />

                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  }
                  label="Parking Area"
                  value={
                    warehouse.total_parking_area
                      ? `${warehouse.total_parking_area.toLocaleString()} Sq.Ft.`
                      : 'N/A'
                  }
                />

                <PropertyDetail
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  }
                  label="Electricity"
                  value={
                    warehouse.electricity_kva
                      ? `${warehouse.electricity_kva} kVA`
                      : 'N/A'
                  }
                />
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-100">
              <h2 className="text-xl font-semibold p-6 text-blue-800">
                Inquire About This Property
              </h2>
            </div>
            <div className="p-6">
              {warehouse.owner && (
                <div className="mb-6 flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-4">
                    <span className="text-lg font-bold">
                      {warehouse.owner.firstName.charAt(0)}
                      {warehouse.owner.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {warehouse.owner.firstName} {warehouse.owner.lastName}
                    </p>
                    <p className="text-sm text-gray-600">Property Manager</p>
                  </div>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                Interested in this warehouse? Contact us to check availability
                or schedule a visit.
              </p>

              <button
                onClick={handleCheckAvailabilityClick}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Check Availability
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      {isContactFormVisible && (
        <div
          ref={formRef}
          className="scroll-mt-24 mt-12 bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="border-b border-gray-100">
            <h2 className="text-xl font-semibold p-6">Book This Warehouse</h2>
          </div>
          <div className="p-6">
            <BookingForm
              warehouseId={warehouse.id}
              onClose={() => setIsContactFormVisible(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetails;
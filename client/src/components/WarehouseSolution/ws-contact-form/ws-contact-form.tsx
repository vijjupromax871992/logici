// src/components/WarehouseSolution/ws-contact-form/ws-contact-form.js
import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import './ws-contact-form.css';
import { BACKEND_URL } from '../../../config/api';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  inquiryType: string;
  message: string;
  preferredContactMethod: string;
  preferredContactTime: string;
  attachment: File | null;
  consent: boolean;
  industryOther: string;
  wmsOther: string;
  locationPreference?: string;
  industryType?: string;
  spaceType?: string;
  leaseDuration?: string;
  preferredStartDate?: string;
  startDate?: string;
  endDate?: string;
  flexibilityRequirements?: string[];
  fulfillmentServices?: string[];
  currentSystem?: string;
}

interface WsContactFormProps {
  onClose: () => void;
}

const WsContactForm = forwardRef<HTMLDivElement, WsContactFormProps>(
  ({ onClose }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      fullName: '',
      email: '',
      phoneNumber: '',
      companyName: '',
      inquiryType: '',
      message: '',
      preferredContactMethod: '',
      preferredContactTime: '',
      attachment: null,
      consent: false,
      industryOther: '',
      wmsOther: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validateForm()) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
          // Create FormData object for file upload
          const formDataToSend = new FormData();

          // Add all form fields to FormData
          Object.entries(formData).forEach(([key, value]) => {
            if (key === 'attachment' && value instanceof File) {
              formDataToSend.append('attachment', value);
            } else if (Array.isArray(value)) {
              // Handle arrays (like flexibilityRequirements and fulfillmentServices)
              value.forEach((item) => formDataToSend.append(key, item));
            } else if (value !== null && value !== undefined) {
              formDataToSend.append(key, value.toString());
            }
          });

          // Send the form data to the backend
          const response = await axios.post(
            `${BACKEND_URL}/api/public/inquiries`,
            formDataToSend,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          if (response.data.success) {
            setSubmitted(true);
            setFormData({
              fullName: '',
              email: '',
              phoneNumber: '',
              companyName: '',
              inquiryType: '',
              message: '',
              preferredContactMethod: '',
              preferredContactTime: '',
              attachment: null,
              consent: false,
              industryOther: '',
              wmsOther: '',
            });
          } else {
            throw new Error(
              response.data.message || 'Failed to submit inquiry'
            );
          }
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : 'An error occurred while submitting the form'
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    const [errors, setErrors] = useState<
      Partial<Record<keyof FormData, string>>
    >({});
    const [submitted, setSubmitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const handleInputChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const target = e.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;

      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        setFormData({
          ...formData,
          [target.name]: target.checked,
        });
      } else {
        setFormData({
          ...formData,
          [target.name]: target.value,
        });
      }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, checked } = e.target;
      setFormData((prevData) => {
        const updatedCheckboxGroup = checked
          ? [...((prevData[name as keyof FormData] as string[]) || []), value]
          : (prevData[name as keyof FormData] as string[]).filter(
              (item) => item !== value
            );

        return {
          ...prevData,
          [name]: updatedCheckboxGroup,
        };
      });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFormData({ ...formData, attachment: file });
    };

    const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
      return message ? (
        <span className="ws-error-message">{message}</span>
      ) : null;
    };

    const validatePartOne = (): boolean => {
      const newErrors: Partial<Record<keyof FormData, string>> = {};
      if (!formData.fullName) newErrors.fullName = 'Full Name is required';
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = 'Valid Email is required';
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone Number is required';
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Phone Number must be 10 digits';
      }
      if (!formData.companyName)
        newErrors.companyName = 'Company Name is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof FormData, string>> = {};
      if (!formData.inquiryType)
        newErrors.inquiryType = 'Please select an Inquiry Type';
      if (!formData.consent)
        newErrors.consent = 'You must agree to the terms to continue';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (validatePartOne()) {
        setCurrentStep(2);
      }
    };

    const renderConditionalFields = () => {
      const today = new Date().toISOString().split('T')[0];

      switch (formData.inquiryType) {
        case 'Warehouse Availability Inquiry':
          return (
            <>
              <div className="ws-form-group">
                <label htmlFor="locationPreference">Location Preference</label>
                <input
                  type="text"
                  name="locationPreference"
                  onChange={handleInputChange}
                />
              </div>
              <div className="ws-form-group">
                <label htmlFor="industryType">Industry Type</label>
                <select name="industryType" onChange={handleInputChange}>
                  <option value="">Select Industry</option>
                  <option value="Retail & E-commerce">
                    Retail & E-commerce
                  </option>
                  <option value="FMCG">FMCG</option>
                  <option value="Health & Pharmaceuticals">
                    Health & Pharmaceuticals
                  </option>
                  <option value="Automotive">Automotive</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {formData.industryType === 'Others' && (
                <div className="ws-form-group">
                  <label htmlFor="industryOther">Please specify:</label>
                  <input
                    type="text"
                    name="industryOther"
                    value={formData.industryOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="ws-form-group">
                <label htmlFor="spaceType">Space Type</label>
                <select name="spaceType" onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Dry Storage">Dry Storage</option>
                  <option value="Hazardous Goods">Hazardous Goods</option>
                </select>
              </div>
              <div className="ws-form-group">
                <label htmlFor="leaseDuration">Lease Duration</label>
                <select name="leaseDuration" onChange={handleInputChange}>
                  <option value="">Select Duration</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="ws-form-group">
                <label htmlFor="preferredStartDate">Preferred Start Date</label>
                <input
                  type="date"
                  name="preferredStartDate"
                  id="preferredStartDate"
                  value={formData.preferredStartDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          );
        case 'AI & Predictive Analytics Solutions':
          return (
            <>
              <div className="ws-form-group">
                <label htmlFor="industryType">Industry Type</label>
                <select name="industryType" onChange={handleInputChange}>
                  <option value="">Select Industry</option>
                  <option value="Retail & E-commerce">
                    Retail & E-commerce
                  </option>
                  <option value="FMCG">FMCG</option>
                  <option value="Health & Pharmaceuticals">
                    Health & Pharmaceuticals
                  </option>
                  <option value="Automotive">Automotive</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {formData.industryType === 'Others' && (
                <div className="ws-form-group">
                  <label htmlFor="industryOther">Please specify:</label>
                  <input
                    type="text"
                    name="industryOther"
                    value={formData.industryOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="ws-form-group">
                <label htmlFor="spaceType">Space Type</label>
                <select name="spaceType" onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Dry Storage">Dry Storage</option>
                  <option value="Hazardous Goods">Hazardous Goods</option>
                </select>
              </div>
              <div className="ws-form-group">
                <label htmlFor="currentSystem">Current WMS/ERP Systems</label>
                <select name="currentSystem" onChange={handleInputChange}>
                  <option value="">Select System</option>
                  <option value="Zoho">Zoho</option>
                  <option value="Odoo">Odoo</option>
                  <option value="SAP">SAP</option>
                  <option value="Others">Others</option>
                  <option value="None">None</option>
                </select>
              </div>
              {formData.currentSystem === 'Others' && (
                <div className="ws-form-group">
                  <label htmlFor="wmsOther">Please Specify</label>
                  <input
                    type="text"
                    name="wmsOther"
                    value={formData.wmsOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="ws-form-group">
                <label htmlFor="preferredStartDate">Preferred Start Date</label>
                <input
                  type="date"
                  name="preferredStartDate"
                  id="preferredStartDate"
                  value={formData.preferredStartDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          );
        case 'Short-Term Storage & Leasing':
          return (
            <>
              <div className="ws-form-group">
                <label htmlFor="industryType">Industry Type</label>
                <select name="industryType" onChange={handleInputChange}>
                  <option value="">Select Industry</option>
                  <option value="Retail & E-commerce">
                    Retail & E-commerce
                  </option>
                  <option value="FMCG">FMCG</option>
                  <option value="Health & Pharmaceuticals">
                    Health & Pharmaceuticals
                  </option>
                  <option value="Automotive">Automotive</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {formData.industryType === 'Others' && (
                <div className="ws-form-group">
                  <label htmlFor="industryOther">Please specify:</label>
                  <input
                    type="text"
                    name="industryOther"
                    value={formData.industryOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="ws-form-group">
                <label htmlFor="spaceType">Space Type</label>
                <select name="spaceType" onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Dry Storage">Dry Storage</option>
                  <option value="Hazardous Goods">Hazardous Goods</option>
                </select>
              </div>
              <div className="ws-form-group">
                <label htmlFor="storageDuration">Storage Needs Duration</label>
                <input
                  type="date"
                  name="startDate"
                  onChange={handleInputChange}
                  placeholder="Start Date"
                  min={today}
                />
                <input
                  type="date"
                  name="endDate"
                  onChange={handleInputChange}
                  placeholder="End Date"
                  min={formData.startDate || today}
                />
              </div>

              <div className="ws-form-group">
                <label>Flexibility Requirements</label>
                <div className="ws-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="flexibilityRequirements"
                      value="24/7 Access"
                      onChange={handleCheckboxChange}
                    />
                    24/7 Access
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="flexibilityRequirements"
                      value="Scalability of Space"
                      onChange={handleCheckboxChange}
                    />
                    Scalability of Space
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="flexibilityRequirements"
                      value="Climate Control"
                      onChange={handleCheckboxChange}
                    />
                    Climate Control
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="flexibilityRequirements"
                      value="Security Monitoring"
                      onChange={handleCheckboxChange}
                    />
                    Security Monitoring
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="flexibilityRequirements"
                      value="Technology Integration"
                      onChange={handleCheckboxChange}
                    />
                    Technology Integration
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="flexibilityRequirements"
                      value="Transport Hub Access"
                      onChange={handleCheckboxChange}
                    />
                    Transport Hub Access
                  </label>
                </div>
              </div>
            </>
          );
        case 'Full-Service Warehousing & Fulfillment':
          return (
            <>
              <div className="ws-form-group">
                <label htmlFor="industryType">Industry Type</label>
                <select name="industryType" onChange={handleInputChange}>
                  <option value="">Select Industry</option>
                  <option value="Retail & E-commerce">
                    Retail & E-commerce
                  </option>
                  <option value="FMCG">FMCG</option>
                  <option value="Health & Pharmaceuticals">
                    Health & Pharmaceuticals
                  </option>
                  <option value="Automotive">Automotive</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {formData.industryType === 'Others' && (
                <div className="ws-form-group">
                  <label htmlFor="industryOther">Please specify:</label>
                  <input
                    type="text"
                    name="industryOther"
                    value={formData.industryOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="ws-form-group">
                <label htmlFor="spaceType">Space Type</label>
                <select name="spaceType" onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Dry Storage">Dry Storage</option>
                  <option value="Hazardous Goods">Hazardous Goods</option>
                </select>
              </div>
              <div className="ws-form-group">
                <label>Fulfillment Services Needed</label>
                <div className="ws-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Inventory Management"
                      onChange={handleCheckboxChange}
                    />
                    Inventory Management
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Order Packaging"
                      onChange={handleCheckboxChange}
                    />
                    Order Packaging
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Kitting and Assembly"
                      onChange={handleCheckboxChange}
                    />
                    Kitting and Assembly
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Pick and Pack Services"
                      onChange={handleCheckboxChange}
                    />
                    Pick and Pack Services
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Last-Mile Delivery"
                      onChange={handleCheckboxChange}
                    />
                    Last-Mile Delivery
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Cross-Docking"
                      onChange={handleCheckboxChange}
                    />
                    Cross-Docking
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Custom Labeling"
                      onChange={handleCheckboxChange}
                    />
                    Custom Labeling
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="fulfillmentServices"
                      value="Quality Inspections"
                      onChange={handleCheckboxChange}
                    />
                    Quality Inspections
                  </label>
                </div>
              </div>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div className="ws-contact-form-container" ref={ref}>
        <button className="ws-close-button" onClick={onClose}>
          &times;
        </button>

        {submitted ? (
          <div className="ws-thank-you-message">
            <h2>Thank you for your inquiry!</h2>
            <p>We will be in touch shortly to assist you further.</p>
          </div>
        ) : (
          <form className="ws-contact-form" onSubmit={handleSubmit}>
            <h2>Get an Instant Quote</h2>
            {currentStep === 1 && (
              <>
                <div className="ws-form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  <ErrorMessage message={errors.fullName} />
                </div>

                <div className="ws-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <ErrorMessage message={errors.email} />
                </div>

                <div className="ws-form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                  <ErrorMessage message={errors.phoneNumber} />
                </div>

                <div className="ws-form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                  <ErrorMessage message={errors.companyName} />
                </div>

                <div className="ws-form-group">
                  <label htmlFor="preferredContactMethod">
                    Preferred Contact Method
                  </label>
                  <input
                    type="text"
                    name="preferredContactMethod"
                    id="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="ws-form-group">
                  <label htmlFor="preferredContactTime">
                    Preferred Contact Time
                  </label>
                  <input
                    type="text"
                    name="preferredContactTime"
                    id="preferredContactTime"
                    value={formData.preferredContactTime}
                    onChange={handleInputChange}
                  />
                </div>
                <button onClick={handleNext} className="ws-submit-btn">
                  Next
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="ws-form-group">
                  <label htmlFor="inquiryType">Inquiry Type</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Inquiry Type</option>
                    <option value="Warehouse Availability Inquiry">
                      Warehouse Availability Inquiry
                    </option>
                    <option value="AI & Predictive Analytics Solutions">
                      AI & Predictive Analytics Solutions
                    </option>
                    <option value="Short-Term Storage & Leasing">
                      Short-Term Storage & Leasing
                    </option>
                    <option value="Full-Service Warehousing & Fulfillment">
                      Full-Service Warehousing & Fulfillment
                    </option>
                  </select>
                  <ErrorMessage message={errors.inquiryType} />
                </div>

                {renderConditionalFields()}

                <div className="ws-form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="ws-form-group">
                  <label htmlFor="attachment">Attachment</label>
                  <input
                    type="file"
                    name="attachment"
                    id="attachment"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="ws-form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                    />
                    I agree to the <a href="/privacy-policy">Privacy Policy</a>{' '}
                    and <a href="/terms-of-service">Terms of Service</a>.
                  </label>
                  <ErrorMessage message={errors.consent} />
                </div>

                {/* Add error message display */}
                {submitError && (
                  <div className="ws-error-message">{submitError}</div>
                )}

                {/* Update submit button to show loading state */}
                <button
                  type="submit"
                  className="ws-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    );
  }
);

export default WsContactForm;

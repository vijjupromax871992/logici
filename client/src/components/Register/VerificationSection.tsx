// src/components/Register/VerificationSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from '../../config/api';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  age: string;
  country: string;
  state: string;
  city: string;
  address: {
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface VerificationSectionProps {
  registerData: RegisterData;
  onBack: () => void;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({ registerData, onBack }) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Add safety check for registerData - THIS IS THE CRITICAL FIX
  if (!registerData || !registerData.email) {
    return (
      <div className="p-6 md:p-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          Registration data is missing. Please try again.
        </div>
        <button
          onClick={onBack}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-colors duration-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleSendOTP = async () => {
    if (!registerData?.email) {
      setError('Email address is missing');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setOtpValues(Array(6).fill(''));
      
      const response = await fetch(`${BACKEND_URL}/auth/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          value: registerData.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(300); // 5 minutes
      } else {
        if (data.error?.includes('already exists')) {
          alert(`${registerData.email} is already registered, please login.`);
          onBack(); 
          return;
        }
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    if (!registerData?.email) {
      setError('Email address is missing');
      return;
    }

    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/register/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          value: registerData.email,
          otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await handleRegister();
      } else {
        throw new Error(data.error || 'Invalid OTP');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div className="p-6 md:p-8 text-center">
      {/* Header */}
      <h2 className="text-xl md:text-2xl font-semibold text-[#00599c] mb-8">
        Verify Your Email
      </h2>

      {/* Verification Info */}
      <div className="mb-8">
        <p className="text-gray-600 mb-2">Enter verification code sent to:</p>
        <strong className="text-[#00599c] break-all">{registerData.email}</strong>
      </div>

      {/* OTP Container */}
      <div className="flex justify-center gap-2 mb-8">
        {otpValues.map((digit, index) => (
          <input
            key={index}
            ref={el => otpInputs.current[index] = el}
            type="text"
            className="w-12 h-12 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white text-center font-medium text-lg transition-all duration-200 hover:border-gray-400"
            value={digit}
            maxLength={1}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            style={{ 
              color: '#1f2937', 
              backgroundColor: '#ffffff',
              fontSize: '1rem'
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Button Container */}
      <div className="flex flex-col gap-4">
        {/* Primary Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={otpValues.join('').length !== 6 || isLoading}
          className="w-full px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#00599c] disabled:hover:text-white"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>

        {/* Send OTP Button */}
        <button
          onClick={handleSendOTP}
          disabled={isLoading || timer > 0}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
        >
          {timer > 0 
            ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`
            : isLoading ? 'Sending...' : 'Send OTP'
          }
        </button>
      </div>
    </div>
  );
};

export default VerificationSection;
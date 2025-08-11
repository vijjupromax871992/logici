// src/components/Login/OtpSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import './OtpSection.css';
import { BACKEND_URL } from '../../config/api';

interface OtpSectionProps {
  onClose: () => void;
}

const OtpSection: React.FC<OtpSectionProps> = ({ onClose }) => {
  const [type, setType] = useState<'email' | 'mobileNumber'>('email');
  const [value, setValue] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const validateInput = (): boolean => {
    setError(null);
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        setError('Please enter a valid 10-digit mobile number');
        return false;
      }
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateInput()) return;
    //navigate('/dashboardPage1');
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsOtpSent(true);
        setTimer(300); // 5 minutes
        setOtpValues(Array(6).fill(''));
      } else {
        if (
          response.status === 500 &&
          data.message?.includes('not registered')
        ) {
          alert(`${value} is not yet registered, kindly register.`);
          onClose(); // Close OTP section
          const registerBtn = document.querySelector(
            'button.nav-link:last-child'
          ) as HTMLButtonElement;
          if (registerBtn) {
            registerBtn.click();
          }
          return;
        }
        throw new Error(data.error || 'Failed to send OTP', data);
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

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Auto-focus next input
      if (value && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtpValues = [...otpValues];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) newOtpValues[index] = char;
      });
      setOtpValues(newOtpValues);
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        const container = document.querySelector('.otp-section');
        container?.classList.add('success-animation');

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        setTimeout(() => {
          // Check if there's a stored redirect URL
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            // Clear the stored URL and redirect there
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
          } else {
            // Default behavior - go to dashboard
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.isAdmin) {
              window.location.href = '/admin/dashboard';
            } else {
              window.location.href = '/user/dashboard';
            }
          }
        }, 500);
      } else {
        throw new Error(data.error || 'Invalid OTP');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      const inputs = document.querySelectorAll('.otp-input');
      inputs.forEach((input) => input.classList.add('error'));
      setTimeout(() => {
        inputs.forEach((input) => input.classList.remove('error'));
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="otp-section">
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h2>Login with OTP</h2>

      <div className="select-container">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as 'email' | 'mobileNumber');
            setValue('');
            setError(null);
            setIsOtpSent(false);
            setOtpValues(Array(6).fill(''));
          }}
          disabled={isLoading}
        >
          <option value="email">Email</option>
          {/* <option value="mobileNumber">Mobile Number</option> */}
        </select>
      </div>

      {!isOtpSent ? (
        <div className="input-field">
          <input
            type={type === 'email' ? 'email' : 'tel'}
            placeholder={
              type === 'email' ? 'Enter your email' : 'Enter your mobile number'
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
          />
          <button
            className={`primary-button ${isLoading ? 'loading' : ''}`}
            onClick={handleSendOTP}
            disabled={!value || isLoading}
          >
            {isLoading ? 'Sending...' : 'Get OTP'}
          </button>
        </div>
      ) : (
        <>
          <div className="otp-container">
            {otpValues.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpInputs.current[index] = el)}
                type="text"
                className="otp-input"
                value={digit}
                maxLength={1}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="button-container">
            <button
              className={`primary-button ${isLoading ? 'loading' : ''}`}
              onClick={handleVerifyOTP}
              disabled={otpValues.join('').length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {timer > 0 ? (
              <div className="timer">
                <span className="timer-icon">⏱</span>
                Resend OTP in {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, '0')}
              </div>
            ) : (
              <button
                className="resend-button"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default OtpSection;

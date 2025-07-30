// client/src/types/razorpay.d.ts
// TypeScript declarations for Razorpay

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentOrderData {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
  payment_id: string;
  warehouse: {
    id: string;
    name: string;
    address?: string;
    city?: string;
  };
  booking_details: {
    fullName: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    preferredContactMethod: string;
    preferredContactTime: string;
    preferredStartDate: string;
    message?: string;
    warehouse_name: string;
    warehouse_address?: string;
    warehouse_city?: string;
  };
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    order_id: string;
    booking_number: string;
    status: string;
  };
}

export interface PaymentFailureRequest {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  error_code?: string;
  error_description: string;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  preferredContactMethod: string;
  preferredContactTime: string;
  preferredStartDate: string;
  message?: string;
}
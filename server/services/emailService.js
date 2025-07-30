// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSKEY,
  },
  debug: false
});

// Email templates
const getCustomerEmailTemplate = (booking, warehouse, payment) => {
  const amount = (payment.amount / 100).toFixed(2); // Convert paise to rupees
  const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-IN');
  const paymentDate = new Date(payment.createdAt).toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - Logic-i</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .booking-number {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-size: 18px;
                font-weight: bold;
            }
            .section {
                margin: 25px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }
            .section h3 {
                margin-top: 0;
                color: #007bff;
                font-size: 18px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
            }
            .detail-value {
                color: #333;
                text-align: right;
            }
            .payment-success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .contact-info {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            @media (max-width: 600px) {
                .container { margin: 10px; padding: 20px; }
                .detail-row { flex-direction: column; }
                .detail-value { text-align: left; margin-top: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Logic-i</div>
                <p style="margin: 0; color: #666; font-size: 16px;">Warehouse Booking Confirmation</p>
            </div>

            <div class="payment-success">
                ✅ Payment Successful - Booking Confirmed
            </div>

            <div class="booking-number">
                Booking Number: ${booking.booking_number}
            </div>

            <p style="font-size: 16px; color: #333;">
                Dear <strong>${booking.fullName}</strong>,
            </p>
            
            <p>Thank you for your booking with Logic-i! Your warehouse booking has been confirmed and payment has been successfully processed.</p>

            <div class="section">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Booking Number:</span>
                    <span class="detail-value">${booking.booking_number}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer Name:</span>
                    <span class="detail-value">${booking.fullName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">${booking.companyName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone Number:</span>
                    <span class="detail-value">${booking.phoneNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Start Date:</span>
                    <span class="detail-value">${new Date(booking.preferredStartDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact Method:</span>
                    <span class="detail-value">${booking.preferredContactMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact Time:</span>
                    <span class="detail-value">${booking.preferredContactTime}</span>
                </div>
            </div>

            <div class="section">
                <h3>🏢 Warehouse Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Warehouse Name:</span>
                    <span class="detail-value">${warehouse.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${warehouse.address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">${warehouse.city}, ${warehouse.state}</span>
                </div>
            </div>

            <div class="section">
                <h3>💳 Payment Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value"><strong>₹${amount}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${payment.razorpay_payment_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${payment.payment_method || 'Online Payment'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${paymentDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction Status:</span>
                    <span class="detail-value" style="color: #28a745; font-weight: bold;">✅ Successful</span>
                </div>
            </div>

            <div class="contact-info">
                <h4 style="margin-top: 0;">📞 Next Steps</h4>
                <p style="margin-bottom: 0;">
                    The warehouse owner will contact you within 24 hours using your preferred contact method (${booking.preferredContactMethod}) 
                    during your preferred time (${booking.preferredContactTime}) to discuss further arrangements.
                </p>
            </div>

            ${booking.message ? `
            <div class="section">
                <h3>💬 Your Message</h3>
                <p style="font-style: italic; color: #555;">"${booking.message}"</p>
            </div>
            ` : ''}

            <div class="footer">
                <p><strong>Thank you for choosing Logic-i!</strong></p>
                <p>For any queries, please contact us at support@logic-i.com or visit our website.</p>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    This is an automated email. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const getOwnerEmailTemplate = (booking, warehouse, payment, customer) => {
  const amount = (payment.amount / 100).toFixed(2);
  const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Confirmed Booking - Logic-i</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #28a745;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #28a745;
                margin-bottom: 10px;
            }
            .booking-alert {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-size: 18px;
                font-weight: bold;
            }
            .section {
                margin: 25px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            .section h3 {
                margin-top: 0;
                color: #28a745;
                font-size: 18px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
            }
            .detail-value {
                color: #333;
                text-align: right;
            }
            .action-required {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            @media (max-width: 600px) {
                .container { margin: 10px; padding: 20px; }
                .detail-row { flex-direction: column; }
                .detail-value { text-align: left; margin-top: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Logic-i</div>
                <p style="margin: 0; color: #666; font-size: 16px;">New Confirmed Booking Notification</p>
            </div>

            <div class="booking-alert">
                🎉 New Confirmed Booking Received!
            </div>

            <p style="font-size: 16px; color: #333;">
                Dear <strong>${warehouse.owner.firstName} ${warehouse.owner.lastName}</strong>,
            </p>
            
            <p>Congratulations! You have received a new confirmed booking for your warehouse <strong>"${warehouse.name}"</strong>. The customer has completed the payment and the booking is confirmed.</p>

            <div class="section">
                <h3>📋 Booking Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Booking Number:</span>
                    <span class="detail-value"><strong>${booking.booking_number}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Date:</span>
                    <span class="detail-value">${bookingDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Received:</span>
                    <span class="detail-value"><strong>₹${amount}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value" style="color: #28a745; font-weight: bold;">✅ Confirmed</span>
                </div>
            </div>

            <div class="section">
                <h3>👤 Customer Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${customer.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">${customer.company}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${customer.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${customer.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Start Date:</span>
                    <span class="detail-value">${new Date(booking.preferredStartDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Contact Method:</span>
                    <span class="detail-value">${booking.preferredContactMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Contact Time:</span>
                    <span class="detail-value">${booking.preferredContactTime}</span>
                </div>
            </div>

            <div class="section">
                <h3>🏢 Warehouse Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Warehouse Name:</span>
                    <span class="detail-value">${warehouse.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${warehouse.address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">${warehouse.city}, ${warehouse.state}</span>
                </div>
            </div>

            ${booking.message ? `
            <div class="section">
                <h3>💬 Customer Message</h3>
                <p style="font-style: italic; color: #555; background: white; padding: 15px; border-radius: 5px;">
                    "${booking.message}"
                </p>
            </div>
            ` : ''}

            <div class="action-required">
                <h4 style="margin-top: 0; color: #856404;">⚡ Action Required</h4>
                <p style="margin-bottom: 0;">
                    Please contact the customer within <strong>24 hours</strong> using their preferred contact method 
                    (<strong>${booking.preferredContactMethod}</strong>) during their preferred time 
                    (<strong>${booking.preferredContactTime}</strong>) to discuss the warehouse arrangements and next steps.
                </p>
            </div>

            <div class="section">
                <h3>💳 Payment Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${payment.razorpay_payment_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${payment.payment_method || 'Online Payment'}</span>
                </div>
            </div>

            <div class="footer">
                <p><strong>Thank you for being a valued partner with Logic-i!</strong></p>
                <p>You can manage this booking and view more details in your owner dashboard.</p>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    This is an automated email. For support, contact us at support@logic-i.com
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// NEW: Customer Email Template for Payment Pending (Payment Cancelled)
const getCustomerPaymentPendingTemplate = (booking, warehouse, customer) => {
  const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Warehouse Inquiry Received - Logic-i</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #ffc107;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #ffc107;
                margin-bottom: 10px;
            }
            .inquiry-alert {
                background: linear-gradient(135deg, #ffc107, #fd7e14);
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-size: 18px;
                font-weight: bold;
            }
            .section {
                margin: 25px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
            }
            .section h3 {
                margin-top: 0;
                color: #ffc107;
                font-size: 18px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
            }
            .detail-value {
                color: #333;
                text-align: right;
            }
            .contact-info {
                background-color: #e7f3ff;
                border: 1px solid #b3d9ff;
                color: #0c5aa6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            @media (max-width: 600px) {
                .container { margin: 10px; padding: 20px; }
                .detail-row { flex-direction: column; }
                .detail-value { text-align: left; margin-top: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Logic-i</div>
                <p style="margin: 0; color: #666; font-size: 16px;">Warehouse Inquiry Received</p>
            </div>

            <div class="inquiry-alert">
                📝 Your Warehouse Inquiry is Saved!
            </div>

            <p style="font-size: 16px; color: #333;">
                Dear <strong>${customer.name}</strong>,
            </p>
            
            <p>Thank you for your interest in our warehouse! While the payment was not completed, we've saved your inquiry details and our team will contact you shortly to discuss this opportunity.</p>

            <div class="section">
                <h3>📋 Your Inquiry Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Inquiry Reference:</span>
                    <span class="detail-value">${booking.booking_reference || booking.booking_number}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer Name:</span>
                    <span class="detail-value">${customer.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">${customer.company}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone Number:</span>
                    <span class="detail-value">${customer.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Start Date:</span>
                    <span class="detail-value">${new Date(booking.preferredStartDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Contact Method:</span>
                    <span class="detail-value">${booking.preferredContactMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Contact Time:</span>
                    <span class="detail-value">${booking.preferredContactTime}</span>
                </div>
            </div>

            <div class="section">
                <h3>🏢 Warehouse Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Warehouse Name:</span>
                    <span class="detail-value">${warehouse.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${warehouse.address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">${warehouse.city}, ${warehouse.state}</span>
                </div>
            </div>

            <div class="contact-info">
                <h4 style="margin-top: 0; color: #0c5aa6;">📞 What Happens Next?</h4>
                <div style="text-align: left; margin-top: 15px;">
                    <p><strong>✅ Within 24 Hours:</strong> Our warehouse specialist will contact you</p>
                    <p><strong>📱 Contact Method:</strong> We'll use ${booking.preferredContactMethod} during ${booking.preferredContactTime}</p>
                    <p><strong>💰 No Payment Required:</strong> Discuss terms before any payment</p>
                    <p><strong>🏢 Free Consultation:</strong> Get all your questions answered</p>
                    <p><strong>📍 Site Visit:</strong> Schedule a warehouse tour if needed</p>
                </div>
            </div>

            ${booking.message ? `
            <div class="section">
                <h3>💬 Your Message</h3>
                <p style="font-style: italic; color: #555; background: white; padding: 15px; border-radius: 5px;">
                    "${booking.message}"
                </p>
            </div>
            ` : ''}

            <div class="footer">
                <p><strong>Thank you for choosing Logic-i!</strong></p>
                <p>For any immediate questions, contact us at support@logic-i.com or call +91 7021059530</p>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    This is an automated email. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// NEW: Owner Email Template for Payment Cancelled Inquiry
const getOwnerPaymentCancelledInquiryTemplate = (booking, warehouse, customer) => {
  const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Warehouse Inquiry - Payment Pending - Logic-i</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #fd7e14;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #fd7e14;
                margin-bottom: 10px;
            }
            .inquiry-alert {
                background: linear-gradient(135deg, #fd7e14, #ffc107);
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-size: 18px;
                font-weight: bold;
            }
            .section {
                margin: 25px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #fd7e14;
            }
            .section h3 {
                margin-top: 0;
                color: #fd7e14;
                font-size: 18px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
            }
            .detail-value {
                color: #333;
                text-align: right;
            }
            .action-required {
                background-color: #e7f3ff;
                border: 1px solid #b3d9ff;
                color: #0c5aa6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .opportunity-note {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            @media (max-width: 600px) {
                .container { margin: 10px; padding: 20px; }
                .detail-row { flex-direction: column; }
                .detail-value { text-align: left; margin-top: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Logic-i</div>
                <p style="margin: 0; color: #666; font-size: 16px;">New Warehouse Inquiry - Payment Pending</p>
            </div>

            <div class="inquiry-alert">
                🔔 New Customer Inquiry - High Interest!
            </div>

            <p style="font-size: 16px; color: #333;">
                Dear <strong>${warehouse.owner.firstName} ${warehouse.owner.lastName}</strong>,
            </p>
            
            <p>Great news! A customer showed strong interest in your warehouse <strong>"${warehouse.name}"</strong> by filling out the complete booking form. Although they didn't complete the payment, this indicates serious interest!</p>

            <div class="opportunity-note">
                <h4 style="margin-top: 0; color: #856404;">💡 High-Value Opportunity</h4>
                <p style="margin-bottom: 0;">
                    This customer went through the entire booking process but cancelled payment. They're likely comparing options or had payment concerns. A quick follow-up could convert this into a confirmed booking!
                </p>
            </div>

            <div class="section">
                <h3>📋 Inquiry Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Inquiry Reference:</span>
                    <span class="detail-value"><strong>${booking.booking_reference || booking.booking_number}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Inquiry Date:</span>
                    <span class="detail-value">${bookingDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: #fd7e14; font-weight: bold;">📞 Follow-up Required</span>
                </div>
            </div>

            <div class="section">
                <h3>👤 Customer Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${customer.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">${customer.company}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${customer.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${customer.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Start Date:</span>
                    <span class="detail-value">${new Date(booking.preferredStartDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Contact Method:</span>
                    <span class="detail-value">${booking.preferredContactMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Contact Time:</span>
                    <span class="detail-value">${booking.preferredContactTime}</span>
                </div>
            </div>

            <div class="section">
                <h3>🏢 Warehouse Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Warehouse Name:</span>
                    <span class="detail-value">${warehouse.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${warehouse.address}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">${warehouse.city}, ${warehouse.state}</span>
                </div>
            </div>

            ${booking.message ? `
            <div class="section">
                <h3>💬 Customer Message</h3>
                <p style="font-style: italic; color: #555; background: white; padding: 15px; border-radius: 5px;">
                    "${booking.message}"
                </p>
            </div>
            ` : ''}

            <div class="action-required">
                <h4 style="margin-top: 0; color: #0c5aa6;">⚡ Recommended Action</h4>
                <div style="text-align: left; margin-top: 15px;">
                    <p><strong>🏃‍♂️ Contact ASAP:</strong> Reach out within 2-4 hours while interest is high</p>
                    <p><strong>📱 Use ${booking.preferredContactMethod}:</strong> During ${booking.preferredContactTime}</p>
                    <p><strong>💰 Address Concerns:</strong> Ask about payment preferences or concerns</p>
                    <p><strong>🎁 Offer Incentives:</strong> Consider flexible payment terms or discounts</p>
                    <p><strong>📍 Suggest Site Visit:</strong> Invite them to see the warehouse</p>
                </div>
            </div>

            <div class="footer">
                <p><strong>Thank you for being a valued partner with Logic-i!</strong></p>
                <p>Quick follow-ups on payment-pending inquiries have a 70% higher conversion rate!</p>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    This is an automated email. For support, contact us at support@logic-i.com
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send confirmation email function
const sendConfirmationEmail = async ({ to, type, booking, warehouse, payment, customer }) => {
  try {
    let subject, htmlContent;

    switch (type) {
      case 'customer':
        subject = `Booking Confirmed - ${booking.booking_number} | Logic-i`;
        htmlContent = getCustomerEmailTemplate(booking, warehouse, payment);
        break;
        
      case 'owner':
        subject = `New Confirmed Booking - ${booking.booking_number} | Logic-i`;
        htmlContent = getOwnerEmailTemplate(booking, warehouse, payment, customer);
        break;
        
      case 'customer_payment_pending':
        subject = `Warehouse Inquiry Received - We'll Contact You Soon | Logic-i`;
        htmlContent = getCustomerPaymentPendingTemplate(booking, warehouse, customer);
        break;
        
      case 'owner_payment_cancelled_inquiry':
        subject = `New High-Interest Inquiry - Payment Pending | Logic-i`;
        htmlContent = getOwnerPaymentCancelledInquiryTemplate(booking, warehouse, customer);
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const mailOptions = {
      from: {
        name: 'Logic-i',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    return result;

  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendConfirmationEmail
};
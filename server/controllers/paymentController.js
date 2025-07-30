// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, ConfirmedBooking, Warehouse, User } = require('../models');
const { sendConfirmationEmail } = require('../services/emailService');
const sequelize = require('../config/database');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for booking
exports.createBookingOrder = async (req, res) => {
  try {
    const {
      warehouse_id,
      fullName,
      email,
      phoneNumber,
      companyName,
      preferredContactMethod,
      preferredContactTime,
      preferredStartDate,
      message
    } = req.body;

    // Validate required fields
    if (!warehouse_id || !fullName || !email || !phoneNumber || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Check if warehouse exists and is approved
    const warehouse = await Warehouse.findOne({
      where: { 
        id: warehouse_id,
        approval_status: 'approved'
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found or not available for booking'
      });
    }

    // Generate unique receipt
    const receipt = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Fixed amount: ₹1000 = 100000 paise
    const amount = 100000; // ₹1000 in paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto capture payment
      notes: {
        warehouse_id: warehouse_id,
        warehouse_name: warehouse.name,
        customer_name: fullName,
        customer_email: email,
        customer_phone: phoneNumber,
        company_name: companyName
      }
    });

    // Store payment record
    const bookingDetails = {
      fullName,
      email,
      phoneNumber,
      companyName,
      preferredContactMethod,
      preferredContactTime,
      preferredStartDate,
      message,
      warehouse_name: warehouse.name,
      warehouse_address: warehouse.address,
      warehouse_city: warehouse.city
    };

    const payment = await Payment.create({
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      status: 'created',
      warehouse_id: warehouse_id,
      user_id: req.userId || null, // If user is logged in
      guest_name: req.userId ? null : fullName,
      guest_email: req.userId ? null : email,
      guest_phone: req.userId ? null : phoneNumber,
      booking_details: bookingDetails,
      receipt: receipt
    });

    res.status(200).json({
      success: true,
      data: {
        order_id: razorpayOrder.id,
        amount: amount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        payment_id: payment.id,
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          address: warehouse.address,
          city: warehouse.city
        },
        booking_details: bookingDetails
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create booking order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify payment and create confirmed booking
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({
      where: { razorpay_order_id: razorpay_order_id },
      include: [{
        model: Warehouse,
        as: 'warehouse',
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Get payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    await sequelize.transaction(async (t) => {
      // Update payment record
      await payment.update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'paid',
        payment_method: razorpayPayment.method,
        gateway_response: razorpayPayment
      }, { transaction: t });

      // Generate booking number
      const bookingNumber = `WB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create confirmed booking
      const confirmedBooking = await ConfirmedBooking.create({
        booking_number: bookingNumber,
        fullName: payment.booking_details.fullName,
        email: payment.booking_details.email,
        phoneNumber: payment.booking_details.phoneNumber,
        companyName: payment.booking_details.companyName,
        preferredContactMethod: payment.booking_details.preferredContactMethod,
        preferredContactTime: payment.booking_details.preferredContactTime,
        preferredStartDate: payment.booking_details.preferredStartDate,
        message: payment.booking_details.message,
        amount_paid: payment.amount,
        payment_date: new Date(),
        warehouse_id: payment.warehouse_id,
        owner_id: payment.warehouse.owner_id,
        payment_id: payment.id,
        user_id: payment.user_id,
        booking_metadata: {
          payment_method: razorpayPayment.method,
          razorpay_payment_id: razorpay_payment_id,
          booking_created_at: new Date()
        }
      }, { transaction: t });

      // Send confirmation emails
      try {
        // Email to customer
        await sendConfirmationEmail({
          to: payment.booking_details.email,
          type: 'customer',
          booking: confirmedBooking,
          warehouse: payment.warehouse,
          payment: payment
        });

        // Email to warehouse owner
        await sendConfirmationEmail({
          to: payment.warehouse.owner.email,
          type: 'owner',
          booking: confirmedBooking,
          warehouse: payment.warehouse,
          payment: payment,
          customer: {
            name: payment.booking_details.fullName,
            email: payment.booking_details.email,
            phone: payment.booking_details.phoneNumber,
            company: payment.booking_details.companyName
          }
        });
      } catch (emailError) {
        // Don't fail the transaction if email fails
      }

      return confirmedBooking;
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      data: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        booking_number: payment.booking_details.booking_number,
        status: 'confirmed'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Handle payment failure
exports.handlePaymentFailure = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      error_code,
      error_description
    } = req.body;

    // Find and update payment record
    const payment = await Payment.findOne({
      where: { razorpay_order_id: razorpay_order_id }
    });

    if (payment) {
      await payment.update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'failed',
        failure_reason: error_description,
        gateway_response: req.body
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure'
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const payment = await Payment.findByPk(payment_id, {
      include: [{
        model: Warehouse,
        as: 'warehouse',
        attributes: ['id', 'name', 'address', 'city']
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.payment_method,
        warehouse: payment.warehouse,
        booking_details: payment.booking_details,
        created_at: payment.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
};

// Get confirmed bookings (for owners)
exports.getConfirmedBookings = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      status,
      warehouse_id 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = { owner_id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (warehouse_id) {
      whereClause.warehouse_id = warehouse_id;
    }

    const { count, rows: bookings } = await ConfirmedBooking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['name', 'address', 'city']
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['razorpay_payment_id', 'payment_method', 'amount']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch confirmed bookings'
    });
  }
};

// Razorpay webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    if (!webhookSecret) {
      return res.status(200).send('OK');
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      default:
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
};

// Helper function to handle payment captured webhook
async function handlePaymentCaptured(event) {
  try {
    const paymentData = event.payload.payment.entity;
    const orderId = paymentData.order_id;

    const payment = await Payment.findOne({
      where: { razorpay_order_id: orderId }
    });

    if (payment && payment.status !== 'paid') {
      await payment.update({
        razorpay_payment_id: paymentData.id,
        status: 'paid',
        payment_method: paymentData.method,
        gateway_response: paymentData
      });
    }
  } catch (error) {
  }
}

// Helper function to handle payment failed webhook
async function handlePaymentFailed(event) {
  try {
    const paymentData = event.payload.payment.entity;
    const orderId = paymentData.order_id;

    const payment = await Payment.findOne({
      where: { razorpay_order_id: orderId }
    });

    if (payment) {
      await payment.update({
        razorpay_payment_id: paymentData.id,
        status: 'failed',
        failure_reason: paymentData.error_description,
        gateway_response: paymentData
      });
    }
  } catch (error) {
  }
}
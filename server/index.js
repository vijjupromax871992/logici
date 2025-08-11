// Location: /backend/index.js 
require('dotenv').config({ path: '../.env' }); 
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database'); 
const session = require('express-session');
const passport = require('./config/authConfig');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const fs = require('fs');

const healthRoutes = require('./routes/health');
const rolesRoutes = require('./routes/roles');
const permissionsRoutes = require('./routes/permissions');
const usersRoutes = require('./routes/users');
const inquiryTypesRoutes = require('./routes/inquiryTypes');
const warehouseRoutes = require('./routes/warehouses');
const bookingsRoutes = require('./routes/bookings');
const inquiriesRouter = require('./routes/inquiries');
const authRoutes = require('./auth/routes/auth.routes');
const adminRoutes = require('./routes/admin'); 
const analyticsRoutes = require('./routes/analytics');
const publicWarehouseRoutes = require('./routes/publicWarehouseRoutes');
const paymentRoutes = require('./routes/payments'); // New payment routes
const logsRoutes = require('./routes/logs'); // Frontend error logging
const contactsRoutes = require('./routes/contacts'); // Contact form routes

const app = express();

// Dynamic CORS configuration based on environment
const allowedOrigins = [
  'https://logic-i.com', 
  'https://www.logic-i.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log blocked origin to backend logger instead of console
      const logger = require('./utils/logger');
      logger.warn(`Blocked CORS origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Session configuration
const store = new SequelizeStore({
  db: sequelize,
});
store.sync();

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Logging based on environment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.use(morgan('dev'));

// For webhook route, we need raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// For all other routes, use JSON middleware with increased size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use(healthRoutes);
app.use(rolesRoutes);
app.use(permissionsRoutes);
app.use(usersRoutes);
app.use(inquiryTypesRoutes);
app.use(warehouseRoutes);
app.use(bookingsRoutes);
app.use(inquiriesRouter);
app.use(publicWarehouseRoutes);
app.use(paymentRoutes); // Add payment routes
app.use(logsRoutes); // Add logs routes
app.use(contactsRoutes); // Add contacts routes

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Placeholder image for missing warehouse images
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFdElEQVR4nO3dW4hVZRjG8deMR/CcJ0QlFbTCNLDAIjPwAJaYERFdZGTdSRJSSHmhBoFUdNFNYGFQZHQiIwixJJQkUBSJSMgDkaihJ7Tw1GyY/hevDTKKs9fM+r613vX/wbswzF577ffZe6+19/42QgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBAawGYCWwusAbYDnwI7gQ+BVcByYIEky7pLzdrMRmZ2n5mNNrOR1sHM6JPZUcwDDgL/kK8zwCrgWjM/mtlYM/vDivOXmU00865Y6WwEsIfGuAxsAwYqtNMBLA3LvAHsqtju0iJXnBrb7vYKD4dRwLoCfy95OWxm9+ffbPWz1cCF9O8+gL7M+nsAWzLrWhYLjm3BbXx7uzP7HAG8lFnP5LLH0gTcSO6YCJwvO0AyMxsLnMisa1WL+hvIrOdw2WNpAp7nJR6kGrOBk5l1HW5x/XGZdewteyxt51YKx82UZyRwIrOu+Ga2q8X1BwHnM+s5UfZY2oqNBU6nH5uBc7mTrk05BfS0uH4XcCSznvNlj6Wt2IOUB9PY9UDbP7OBfjO7u539mdnt7v40/drj1OPRssfSNmwh5YHUZw+wCLiZP3ENsMH93y6Z9awoeyxtw54lfRA3dLwZQshgIwmD1yK+I7Oz7CG0DVtP7SMh1J+9UfYQ2oYNB36M+V/I8Gl3H132ENqKTSPqpkJGu/v+0vtvRzYW+COOg0JGpbuPdvfTnmymu58tckdUqLOzZnZX2eNoJLuJ8oDqOJZn1jXL3c+4+zeZy0z+9HrZY2g0m0T8lj+n5u6zgeOZ/e9L9bdlt7LXP0d/zX1m4yEqsMnACcrR1xsOrAWuZPY5o+x6GseWEJW6NcwD3gO+7eTvZ2Y2y8wmmtm95iHQdWZLiQIsZUzqZC1/SXXVbZqZ/R5/QKmCu7+QWcfTZY8hmjuq2YaS2bHjNsfMrLvs4Ud3n5XZz9+xcFcPdh/Fj0UeNrNpZnavu7+XuXzc3UeXPf5o7n+SebDssdSe2RXgYIc/H/gXeKbD9Q+7+8qyx9/fwbcyj39tZl1lj6X2bBhwrMPfmZnZZTPbYmaTivxGZGbP1fldEOd2d/+qwwf8Z7u6iA5YJ3EKO3cQ2O/uw83sUTO7RcRgZp+5+/vAZ8DXwJl0rKVUbYANVdxH5e6PhRrZ7w3yDhJqZbG7PfTQgRXxFTM6YDFWyTcZn0WKsUq+2WIuYr68kXFXlBhL5A/U6kXMlzcyjpYwjlAXNtFrPJdP08SGJc6Q2JB4sOzjCHVgz5c8PZrGUyVPkwYqzGWJyYhgZvurOiHpVNrgdryqxdRCsWx5jb7HJ5lZPKO0EbPeGr333wPcWOPvI5ViVwOTiJ/DI1UcUCiELa7xQOJEpLr4Fl9aw/7/Acat1N/1dU+VxLcnq5aZmf1oFU9ZJn2wRyje9T19YlZnZubuj5tZTEi0gNnCKucE7OD31vT0FjF9Yk3ZXDpf0OJq2sjL6QO2VR9Q+GfczmXUW8T8kLYL2JmCnG8KxXLg77THEJJR6SGz9sSj1Uuf8N0CNNKMujvM7F1qFjuXGsgeILnzLxotYvriWtwWJX3YMg5JFc6GEXdK5caO/nrM9DWYXU8yvkXmDxZigfWGuRvt/2wuUXNVZ2eBY+5+n5mNMTMbgLKEtmU2HZjj7pvcfW+Lvg/TBwYXuswEthJTK1nRnL7V9P2I9N5i2+6AhxBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCKFh/gbt2aSJE3jO5QAAAABJRU5ErkJggg==';

// Placeholder image handler for default-warehouse.jpg specifically 
app.get('/uploads/default.jpg', (req, res) => {
  const [header, base64Data] = PLACEHOLDER_IMAGE.split(',');
  const contentType = header.split(':')[1].split(';')[0];
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  
  const imageBuffer = Buffer.from(base64Data, 'base64');
  res.send(imageBuffer);
});

app.use('/uploads/:filename', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const [header, base64Data] = PLACEHOLDER_IMAGE.split(',');
      const contentType = header.split(':')[1].split(';')[0];
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      const imageBuffer = Buffer.from(base64Data, 'base64');
      return res.send(imageBuffer);
    }
    next();
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use('/auth', authRoutes);  
app.use('/admin', adminRoutes);
app.use('/api', analyticsRoutes);

app.use((err, req, res, next) => {
  // Handle specific errors
  if (err.status === 413 || err.code === 'LIMIT_FILE_SIZE' || err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Please reduce file size or data payload.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'File size exceeds limit'
    });
  }
  
  if (err.status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Generic error handler
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.status === 500 ? 'Something went wrong!' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Default 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 8080;

sequelize
  .authenticate()
  .then(() => {
    return sequelize.sync({ 
      force: false,
      alter: false,
      logging: process.env.NODE_ENV === 'development'
    });
  })
  .then(() => {
    app.listen(PORT, () => {
    });
  })
  .catch((error) => {
  });
# Logic-i Project Instructions for Claude Code

## Project Overview
Logic-i is a warehouse management platform with React frontend and Node.js backend, deployed on Ubuntu 24.04.

---

## 🏗️ **Architecture**

### **Frontend** (React + TypeScript)
- **Path**: `/var/www/logic-i/client/`
- **Build Output**: `/var/www/logic-i/client/dist/`
- **Tech Stack**: React, TypeScript, Tailwind CSS
- **Routes**: 
  - `/` - Homepage
  - `/user/dashboard` - User dashboard
  - `/admin/dashboard` - Admin dashboard
  - `/auth/*` - Authentication routes

### **Backend** (Node.js + Express)
- **Path**: `/var/www/logic-i/server/`
- **Port**: 5000 (PM2 managed)
- **Database**: MySQL
- **Tech Stack**: Express, Sequelize, JWT, Nodemailer

---

## 🗂️ **Key File Locations**

### **Configuration Files**
```
/var/www/logic-i/server/.env                    # Environment variables
/var/www/logic-i/server/package.json            # Dependencies
/etc/nginx/sites-available/logic-i              # Nginx config
/var/www/logic-i/server/index.js                # Main server entry
```

### **Authentication System**
```
/var/www/logic-i/server/auth/controllers/auth.controller.js    # Auth logic
/var/www/logic-i/server/auth/routes/auth.routes.js            # Auth routes
/var/www/logic-i/client/src/components/Login/                 # Login components
/var/www/logic-i/client/src/components/Register/              # Registration
```

### **Database Models**
```
/var/www/logic-i/server/models/User.js          # User model
/var/www/logic-i/server/models/RegisterOtp.js   # OTP model
/var/www/logic-i/server/models/               # Other models
```

---

## 🔧 **Common Operations**

### **Restart Services**
```bash
pm2 restart logic-i-backend --update-env    # Backend restart
systemctl reload nginx                       # Nginx reload
```

### **View Logs**
```bash
pm2 logs logic-i-backend --lines 50          # App logs
pm2 logs logic-i-backend --err --lines 20    # Error logs only
tail -f ~/.pm2/logs/logic-i-backend-out.log  # Live output logs
tail -f /var/log/nginx/error.log             # Nginx errors
```

### **Database Access**
```bash
mysql -u root -plogic@2020 logici_db         # MySQL access
```

---

## 📧 **Email Configuration (Zoho)**

### **Current Setup**
- **Provider**: Zoho Mail
- **SMTP**: smtp.zoho.in:587
- **Account**: support@logic-i.com
- **App Password**: U31PfbueGYC1

### **Email Templates**
- **Location**: `/var/www/logic-i/server/auth/controllers/auth.controller.js`
- **Features**: HTML templates with Logic-i branding

---

## 🚨 **Common Issues & Solutions**

### **OTP Not Working**
- Check SKIP_EMAIL flag in .env
- Verify Zoho credentials
- Check PM2 logs for email errors

### **500 Internal Server Error**
- Check PM2 error logs: `pm2 logs logic-i-backend --err`
- Restart backend: `pm2 restart logic-i-backend`

### **413 Request Entity Too Large**
- Backend limit: 50MB (express.json)
- Nginx limit: 50M (client_max_body_size)

### **CORS Issues**
- Allowed origins: https://logic-i.com, localhost:5173
- Config in: `/var/www/logic-i/server/index.js`

### **Redirect Issues**
- User routes: `/user/*`
- Admin routes: `/admin/*`
- 404 handler: Routes to `/404`

---

## 🛠️ **Development Workflow**

### **Before Making Changes**
1. Check current status: `pm2 status`
2. View recent logs: `pm2 logs --lines 20`
3. Test endpoints: `curl -X GET https://logic-i.com/health`

### **After Making Changes**
1. Test config: `nginx -t`
2. Restart services: `pm2 restart logic-i-backend && systemctl reload nginx`
3. Verify logs: `pm2 logs --lines 10`

---

## 📊 **System Information**

### **Server Details**
- **OS**: Ubuntu 24.04 LTS
- **CPU**: 2%
- **Memory**: 13% usage
- **Disk**: 8GB / 100GB
- **IP**: 89.116.122.199

### **Ports & Services**
- **Frontend**: Nginx (80/443)
- **Backend**: PM2 → Node.js (5000)
- **Database**: MySQL (3306)

---

## 🔍 **Quick Diagnostics**

### **Health Checks**
```bash
curl https://logic-i.com/health              # Backend health
systemctl status nginx                       # Nginx status  
pm2 status                                   # PM2 processes
mysql -u root -plogic@2020 -e "SELECT 1"    # DB connection
```

### **Common File Searches**
```bash
# Find routes
grep -r "router\." /var/www/logic-i/server/routes/

# Find components  
find /var/www/logic-i/client/src/components -name "*.tsx"

# Find environment variables
grep -E "process\.env\." /var/www/logic-i/server/ -r
```

---

## ⚡ **Performance Notes**

- **File upload limit**: 50MB
- **JWT expiry**: 24 hours  
- **OTP expiry**: 5 minutes
- **Session timeout**: Configured in express-session

---

## 🔐 **Security**

- **JWT Secret**: Set in .env
- **CORS**: Restricted to specific domains
- **File uploads**: Size limited to 50MB
- **Email**: App-specific password for Zoho

---

*Last updated: 2025-08-07*
*For emergency access: ssh root@89.116.122.199*
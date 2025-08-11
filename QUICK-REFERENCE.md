# Logic-i Quick Reference

## 🔥 **Instant Commands**

### **Logs** (Most Important)
```bash
pm2 logs logic-i-backend --lines 30        # Recent logs
pm2 logs logic-i-backend --err --lines 10  # Errors only
tail -f ~/.pm2/logs/logic-i-backend-out.log # Live logs
```

### **Restart Services**
```bash
pm2 restart logic-i-backend --update-env   # Backend
systemctl reload nginx                     # Frontend/Proxy
```

### **Health Checks**
```bash
curl https://logic-i.com/health            # Backend
pm2 status                                 # PM2 processes
systemctl status nginx                     # Nginx status
```

---

## 📂 **Key Files** (Edit These)

### **Backend Configuration**
- `/var/www/logic-i/server/.env` - Environment variables
- `/var/www/logic-i/server/index.js` - Main server file
- `/var/www/logic-i/server/auth/controllers/auth.controller.js` - Auth logic

### **Frontend Routes**
- `/var/www/logic-i/client/src/App.jsx` - Main routing
- `/var/www/logic-i/client/src/components/` - Components

### **Server Configuration**
- `/etc/nginx/sites-available/logic-i` - Nginx config

---

## 🛠️ **Common Fixes**

### **500 Error**
1. `pm2 logs logic-i-backend --err`
2. `pm2 restart logic-i-backend`

### **OTP Not Sending**
1. Check SKIP_EMAIL in `.env`
2. Verify Zoho credentials
3. `pm2 logs | grep "EMAIL OTP"`

### **403/CORS**
- Check allowed origins in `/var/www/logic-i/server/index.js`

### **413 Too Large**
- Already fixed: 50MB limit in Express + Nginx

---

## 🔍 **Quick Search Commands**

```bash
# Find routes
grep -r "app.use\|router\." /var/www/logic-i/server/ | head -10

# Find components
find /var/www/logic-i/client/src -name "*.tsx" | head -10

# Find environment usage
grep -r "process.env" /var/www/logic-i/server/ | head -5

# Find database models  
ls /var/www/logic-i/server/models/
```

---

## 📊 **System Status**

| Service | Status | Port | Path |
|---------|--------|------|------|
| Frontend | Nginx | 80/443 | `/var/www/logic-i/client/dist/` |
| Backend | PM2 | 5000 | `/var/www/logic-i/server/` |
| Database | MySQL | 3306 | `logici_db` |

---

## 🎯 **Authentication Flow**

1. **Registration**: Email OTP → `/user/dashboard`
2. **Login**: Email/Mobile OTP → Dashboard
3. **Email Provider**: Zoho (support@logic-i.com)
4. **JWT**: 24-hour expiry

---

*Server: 89.116.122.199 | OS: Ubuntu 24.04 LTS | Last Updated: Aug 2025*
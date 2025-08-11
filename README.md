# Logic-i - Warehouse Management Platform

A comprehensive warehouse management system built with React frontend and Node.js backend.

## 🚀 Quick Start

### Development
```bash
# Backend
cd /var/www/logic-i/server
npm run dev

# Frontend  
cd /var/www/logic-i/client
npm run dev
```

### Production (Current Setup)
- **Frontend**: Served by Nginx from `/var/www/logic-i/client/dist/`
- **Backend**: Managed by PM2 on port 5000
- **Database**: MySQL on port 3306

## 📁 Project Structure

```
logic-i/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── config/        # Configuration files
│   └── dist/              # Production build
├── server/                # Node.js backend
│   ├── auth/              # Authentication system
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   └── utils/             # Utility functions
└── CLAUDE-INSTRUCTIONS.md # Claude Code reference
```

## 🔧 Common Commands

```bash
# View logs
pm2 logs logic-i-backend

# Restart services
pm2 restart logic-i-backend --update-env
systemctl reload nginx

# Database access
mysql -u root -plogic@2020 logici_db

# Check health
curl https://logic-i.com/health
```

## 📧 Contact
- **Email**: support@logic-i.com
- **Domain**: https://logic-i.com
- **Server**: Ubuntu 24.04 LTS (89.116.122.199)

---

**For detailed instructions, see [CLAUDE-INSTRUCTIONS.md](./CLAUDE-INSTRUCTIONS.md)**
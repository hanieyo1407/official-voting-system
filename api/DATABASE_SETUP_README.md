# Voting System - Database Setup & Production Deployment

## 🚀 **Production-Ready Setup (No Prisma)**

Since you mentioned issues with Prisma in production, I've configured the system to work directly with PostgreSQL using raw SQL queries, which is more reliable for production deployments.

## 📋 **Initial Setup**

### **1. Database Initialization**

Run the database setup script to create all necessary tables:

```bash
npm run db:setup
```

Or manually:

```bash
node -r ts-node/register src/db/init.js
```

This will create:
- ✅ `AdminUser` table with role-based access control
- ✅ `AuditLog` table for tracking admin actions
- ✅ `RateLimit` table for rate limiting functionality
- ✅ Default super admin account

### **2. Default Super Admin Credentials**

After running the setup, you can log in with:

- **Username**: `superadmin`
- **Email**: `admin@sjbu-voting.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 🛠 **API Endpoints**

### **Authentication Routes**
```http
POST /login          # User login (rate limited)
POST /logout         # User logout
```

### **Voting Routes**
```http
POST /vote           # Cast vote (rate limited, cached)
POST /verify         # Verify vote (cached)
GET  /positions      # Get all positions (cached)
GET  /positions/:id/candidates  # Get candidates (cached)
```

### **Admin Routes** (`/admin/*`)
```http
POST /admin/login                    # Admin login
POST /admin/logout                   # Admin logout
POST /admin/create                   # Create admin (super_admin only)
GET  /admin/profile                  # Get admin profile
GET  /admin/all                      # List all admins (admin+)
GET  /admin/stats                    # Admin statistics (admin+)
PUT  /admin/:adminId/role            # Update admin role (super_admin)
DELETE /admin/:adminId/deactivate    # Deactivate admin (super_admin)
POST /admin/change-password          # Change password
```

### **Statistics Routes** (`/stats/*`)
```http
GET /stats/overall           # Overall voting statistics
GET /stats/position/:id      # Position-specific stats
GET /stats/trends            # Voting trends
GET /stats/demographics      # Voter demographics
GET /stats/top-candidates    # Top performing candidates
GET /stats/summary           # Election summary
```

### **Audit Routes** (`/audit/*`)
```http
GET /audit/vote/:id          # Audit single vote
POST /audit/full             # Full system audit (super_admin)
GET /audit/fraud-detection   # Fraud detection analysis
GET /audit/suspicious        # List suspicious votes
GET /audit/logs              # Audit logs
```

## 🔒 **Security Features**

### **Rate Limiting**
- **General API**: 100 requests/15min per IP
- **Voting**: 3 votes/5min per IP
- **Authentication**: 5 attempts/15min per IP
- **Admin**: 200 requests/5min per IP

### **Caching**
- Position and candidate data cached for 10 minutes
- Statistics cached for 30 minutes
- Vote verification cached for 5 minutes
- Automatic cache invalidation on data changes

### **Logging**
- All authentication events logged
- All voting activities logged
- Admin actions tracked
- Security events monitored
- Daily log rotation

## 📊 **Admin Dashboard Features**

### **Role-Based Access Control**
- **Super Admin**: Full system access, user management
- **Admin**: Statistics, auditing, monitoring
- **Moderator**: Read-only access to stats and logs

### **Statistics & Analytics**
- Real-time voter turnout percentages
- Position-wise and candidate-wise analytics
- Voting trend analysis
- Voter demographics
- Election summaries

### **Audit & Fraud Detection**
- Individual vote auditing with risk scoring
- Automated fraud pattern detection
- Suspicious vote identification
- Comprehensive audit reporting
- Security event monitoring

## 🚀 **Production Deployment**

### **Environment Variables** (`.env`)
```env
DATABASE_URL="postgresql://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require"

DATABASE_USER="avnadmin"
DATABASE_PASSWORD="AVNS_4NMugWcbAOIjkUAmCn7"
DATABASE_HOST="sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com"
DATABASE_PORT=24897
DATABASE_NAME="defaultdb"

PG_CA_CERT="-----BEGIN CERTIFICATE-----..."
JWT_SECRET="scienceandtechclub"
```

### **Deployment Steps**

1. **Set Environment Variables**
   ```bash
   export DATABASE_URL="your_connection_string"
   export JWT_SECRET="your_secure_secret"
   ```

2. **Initialize Database**
   ```bash
   npm run db:setup
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 🔧 **Monitoring & Maintenance**

### **Cache Management**
- Automatic cache warming on startup
- Manual cache invalidation available
- Cache performance monitoring
- Memory usage optimization

### **Log Management**
- Daily log rotation
- Structured logging with Winston
- Security event tracking
- Error monitoring and alerting

### **Database Maintenance**
- Automatic old rate limit cleanup
- Audit log archiving (recommended)
- Performance monitoring queries

## 📈 **Performance Optimizations**

### **Database**
- Connection pooling (max 20 connections)
- Query optimization with indexes
- Automatic timeout handling

### **Application**
- Response caching for frequent queries
- Rate limiting to prevent abuse
- Memory-efficient cache management
- Background job processing

## 🛡️ **Security Best Practices**

1. **Change Default Passwords**
   ```bash
   POST /admin/change-password
   ```

2. **Use HTTPS in Production**
   ```javascript
   // In production, set:
   secure: true, // for cookies
   ```

3. **Monitor Security Logs**
   ```bash
   tail -f logs/voting-YYYY-MM-DD.log | grep SECURITY
   ```

4. **Regular Audits**
   ```bash
   curl -X POST http://your-server/audit/full \
     -H "Cookie: admin_token=your_token"
   ```

## 📞 **Support**

For issues or questions:
1. Check the logs in `logs/` directory
2. Verify database connectivity
3. Ensure all environment variables are set
4. Check rate limiting if endpoints return 429 errors

## 🎯 **Quick Start Commands**

```bash
# Setup database
npm run db:setup

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View logs
tail -f logs/voting-$(date +%Y-%m-%d).log
```

Your voting system is now production-ready with enterprise-grade security, monitoring, and performance optimization! 🎉
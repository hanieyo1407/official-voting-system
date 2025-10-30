# SJBU Voting System - Complete API Manual

## 📋 **Table of Contents**
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Position Management](#position-management)
- [Candidate Management](#candidate-management)
- [Voting System](#voting-system)
- [Admin Management](#admin-management)
- [Statistics & Analytics](#statistics--analytics)
- [Audit & Fraud Detection](#audit--fraud-detection)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Best Practices](#best-practices)

## 🚀 **Quick Start**

### **1. Database Setup**
```bash
npm run db:setup
```

### **2. Default Admin Credentials**
- **Username**: `superadmin`
- **Email**: `admin@sjbu-voting.com`
- **Password**: `admin123`

⚠️ **Change this password immediately!**

### **3. API Documentation**
Visit: `http://localhost:3000/api-docs`

---

## 🔐 **Authentication**

### **User Authentication**
Users authenticate with voucher codes and receive JWT tokens in HTTP-only cookies.

#### **Login**
```http
POST /login
Content-Type: application/json

{
  "voucher": "VCHR123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "voucher": "VCHR123456"
  }
}
```

**Rate Limit**: 5 attempts per 15 minutes per IP

### **Admin Authentication**
Admins use email/password and receive separate admin JWT tokens.

#### **Admin Login**
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@sjbu-voting.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Admin login successful",
  "admin": {
    "id": 1,
    "username": "superadmin",
    "email": "admin@sjbu-voting.com",
    "role": "super_admin",
    "isActive": true,
    "lastLogin": "2025-01-16T19:43:06.151Z",
    "createdAt": "2025-01-16T19:43:06.151Z"
  }
}
```

---

## 👥 **User Management**

### **Get All Users** (Admin Only)
```http
GET /users
Cookie: token=your_user_jwt_token
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "voucher": "VCHR123456"
    }
  ]
}
```

### **Create New User**
```http
POST /users
Content-Type: application/json

{
  "voucher": "VCHR123456"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "voucher": "VCHR123456"
  }
}
```

---

## 🏛️ **Position Management**

### **Get All Positions**
```http
GET /positions
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "position_name": "President"
    }
  ]
}
```

### **Create New Position**
```http
POST /positions
Content-Type: application/json

{
  "position_name": "Vice President"
}
```

**Response:**
```json
{
  "data": {
    "id": 2,
    "position_name": "Vice President"
  }
}
```

---

## 👤 **Candidate Management**

### **Get Candidates by Position**
```http
GET /positions/1/candidates
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "manifesto": "I will lead with integrity",
      "position_id": 1
    }
  ]
}
```

### **Add Candidate to Position**
```http
POST /positions/1/candidates
Content-Type: application/json

{
  "name": "Jane Smith",
  "manifesto": "Innovation and progress for all"
}
```

**Response:**
```json
{
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "manifesto": "Innovation and progress for all",
    "position_id": 1
  }
}
```

---

## 🗳️ **Voting System**

### **Cast a Vote** (Rate Limited)
```http
POST /vote
Content-Type: application/json
Cookie: token=your_user_jwt_token

{
  "voucher": "VCHR123456",
  "candidateId": 1,
  "positionId": 1
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "voucher": "VCHR123456",
    "candidate_id": 1,
    "position_id": 1,
    "verification_code": "ABC123DEF456"
  }
}
```

**Rate Limits**:
- 3 votes per 5 minutes per IP
- 5 votes per hour per user

### **Verify a Vote**
```http
POST /verify
Content-Type: application/json

{
  "verification_code": "ABC123DEF456"
}
```

**Response:**
```json
{
  "status": "found",
  "vote": {
    "id": 1,
    "voucher": "VCHR123456",
    "candidate_id": 1,
    "position_id": 1,
    "verification_code": "ABC123DEF456"
  }
}
```

---

## 🔧 **Admin Management**

### **Create New Admin** (Super Admin Only)
```http
POST /admin/create
Content-Type: application/json
Cookie: admin_token=your_admin_jwt_token

{
  "username": "newadmin",
  "email": "newadmin@sjbu-voting.com",
  "password": "securepassword123",
  "role": "admin"
}
```

**Response:**
```json
{
  "message": "Admin user created successfully",
  "admin": {
    "id": 2,
    "username": "newadmin",
    "email": "newadmin@sjbu-voting.com",
    "role": "admin",
    "createdAt": "2025-01-16T19:43:06.151Z"
  }
}
```

### **Get All Admins** (Admin+ Only)
```http
GET /admin/all
Cookie: admin_token=your_admin_jwt_token
```

**Response:**
```json
{
  "admins": [
    {
      "id": 1,
      "username": "superadmin",
      "email": "admin@sjbu-voting.com",
      "role": "super_admin",
      "isActive": true,
      "lastLogin": "2025-01-16T19:43:06.151Z",
      "createdAt": "2025-01-16T19:43:06.151Z"
    }
  ]
}
```

### **Update Admin Role** (Super Admin Only)
```http
PUT /admin/2/role
Content-Type: application/json
Cookie: admin_token=your_admin_jwt_token

{
  "role": "moderator"
}
```

**Response:**
```json
{
  "message": "Admin role updated successfully",
  "admin": {
    "id": 2,
    "username": "newadmin",
    "email": "newadmin@sjbu-voting.com",
    "role": "moderator"
  }
}
```

### **Change Admin Password**
```http
POST /admin/change-password
Content-Type: application/json
Cookie: admin_token=your_admin_jwt_token

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## 📊 **Statistics & Analytics**

### **Overall Voting Statistics**
```http
GET /stats/overall
Cookie: admin_token=your_admin_jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVoters": 1000,
    "totalVotesCast": 850,
    "voterTurnout": 85.0,
    "positionsWithStats": [
      {
        "positionId": 1,
        "positionName": "President",
        "totalCandidates": 3,
        "totalVotes": 850,
        "voterTurnout": 85.0,
        "candidates": [
          {
            "candidateId": 1,
            "candidateName": "John Doe",
            "voteCount": 450,
            "votePercentage": 52.94
          }
        ]
      }
    ],
    "overallStats": {
      "totalPositions": 3,
      "totalCandidates": 9,
      "averageVotesPerPosition": 283.33,
      "mostVotedPosition": "President",
      "leastVotedPosition": "Treasurer"
    }
  }
}
```

### **Position-Specific Statistics**
```http
GET /stats/position/1
Cookie: admin_token=your_admin_jwt_token
```

### **Voting Trends**
```http
GET /stats/trends
Cookie: admin_token=your_admin_jwt_token
```

### **Voter Demographics**
```http
GET /stats/demographics
Cookie: admin_token=your_admin_jwt_token
```

### **Top Performing Candidates**
```http
GET /stats/top-candidates?limit=5
Cookie: admin_token=your_admin_jwt_token
```

### **Election Summary**
```http
GET /stats/summary
Cookie: admin_token=your_admin_jwt_token
```

---

## 🔍 **Audit & Fraud Detection**

### **Audit Single Vote**
```http
GET /audit/vote/1
Cookie: admin_token=your_admin_jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "voteId": 1,
    "voucher": "VCHR123456",
    "verificationCode": "ABC123DEF456",
    "candidateId": 1,
    "positionId": 1,
    "timestamp": "2025-01-16T19:43:06.151Z",
    "isValid": true,
    "issues": [],
    "riskScore": 0
  }
}
```

### **Full System Audit** (Super Admin Only)
```http
POST /audit/full
Cookie: admin_token=your_admin_jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVotesAudited": 850,
    "validVotes": 840,
    "suspiciousVotes": 8,
    "invalidVotes": 2,
    "riskDistribution": {
      "low": 820,
      "medium": 25,
      "high": 3,
      "critical": 2
    },
    "commonIssues": [
      {
        "issue": "Duplicate votes detected: 2 votes for same position",
        "count": 5,
        "severity": "high"
      }
    ],
    "recommendations": [
      "Review votes with high risk scores for potential irregularities",
      "Implement stricter duplicate vote prevention mechanisms"
    ]
  }
}
```

### **Fraud Detection Analysis**
```http
GET /audit/fraud-detection
Cookie: admin_token=your_admin_jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isSuspicious": false,
    "riskLevel": "low",
    "riskFactors": [],
    "confidence": 95,
    "details": {}
  }
}
```

### **Get Suspicious Votes**
```http
GET /audit/suspicious?threshold=30
Cookie: admin_token=your_admin_jwt_token
```

---

## 📚 **API Documentation**

### **Interactive API Documentation**
Visit: `http://localhost:3000/api-docs`

Features:
- **Interactive Testing**: Test all endpoints directly from the browser
- **Request/Response Examples**: See real examples for each endpoint
- **Schema Validation**: View detailed request/response schemas
- **Authentication**: Built-in auth token management
- **Code Generation**: Generate client code in multiple languages

### **API Schema**
The API follows OpenAPI 3.0 specification with:
- Comprehensive request/response documentation
- Authentication requirements clearly marked
- Rate limiting information included
- Error response schemas defined
- Example requests and responses provided

---

## ❌ **Error Handling**

### **Standard Error Response Format**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### **Common HTTP Status Codes**

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad request (missing/invalid data) |
| `401` | Unauthorized (invalid/missing auth) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

### **Rate Limit Error Response**
```json
{
  "error": "Too many voting attempts, please wait before trying again.",
  "retryAfter": "5 minutes"
}
```

---

## 🚦 **Rate Limiting**

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-16T20:43:06.151Z
```

### **Rate Limit Categories**

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Voting | 3 votes | 5 minutes |
| Authentication | 5 attempts | 15 minutes |
| Admin Panel | 200 requests | 5 minutes |

---

## 🛡️ **Security Best Practices**

### **Authentication Security**
1. **Use HTTPS in production**
2. **Store tokens securely** (HTTP-only cookies)
3. **Implement proper logout** to clear tokens
4. **Monitor for suspicious login attempts**

### **API Security**
1. **Validate all input data**
2. **Use parameterized queries** (SQL injection prevention)
3. **Implement proper error handling** (no sensitive data leaks)
4. **Regular security audits**

### **Voting Security**
1. **One vote per user per position**
2. **Verification codes for vote integrity**
3. **Rate limiting to prevent spam**
4. **Comprehensive audit trails**

---

## 🔧 **Development & Testing**

### **Testing Endpoints**

#### **1. Setup Test Data**
```bash
# Create positions
POST /positions
{
  "position_name": "President"
}

# Create candidates
POST /positions/1/candidates
{
  "name": "John Doe",
  "manifesto": "Leadership and vision"
}

# Create users
POST /users
{
  "voucher": "VCHR123456"
}
```

#### **2. Test Voting Flow**
```bash
# Login
POST /login
{
  "voucher": "VCHR123456"
}

# Vote
POST /vote
Cookie: token=your_jwt_token
{
  "voucher": "VCHR123456",
  "candidateId": 1,
  "positionId": 1
}

# Verify vote
POST /verify
{
  "verification_code": "ABC123DEF456"
}
```

#### **3. Test Admin Functions**
```bash
# Admin login
POST /admin/login
{
  "email": "admin@sjbu-voting.com",
  "password": "admin123"
}

# Get statistics
GET /stats/overall
Cookie: admin_token=your_admin_token

# Run fraud detection
GET /audit/fraud-detection
Cookie: admin_token=your_admin_token
```

---

## 📈 **Monitoring & Logs**

### **Log Files**
- **Location**: `logs/voting-YYYY-MM-DD.log`
- **Authentication events**: All login/logout activities
- **Voting activities**: All vote casts and verifications
- **Admin actions**: All administrative operations
- **Security events**: Failed logins, rate limit violations
- **System errors**: Application errors and exceptions

### **Monitoring Endpoints**
```bash
# System health check
GET /api-docs

# Cache statistics
# (Available in logs)

# Rate limiting status
# (Check response headers)
```

---

## 🚀 **Production Deployment**

### **Environment Variables**
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your_secure_secret"
NODE_ENV="production"
```

### **Performance Optimization**
- **Caching**: Automatic cache warming and invalidation
- **Connection Pooling**: Up to 20 database connections
- **Rate Limiting**: DDoS protection
- **Logging**: Structured logging with rotation

### **Security Checklist**
- [ ] Change default admin password
- [ ] Set strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up log monitoring
- [ ] Regular security audits

---

## 📞 **Support & Troubleshooting**

### **Common Issues**

#### **"Rate limit exceeded"**
- Wait for the specified time period
- Check if you're making requests too frequently
- Consider implementing exponential backoff

#### **"Unauthorized" errors**
- Check if your JWT token is valid
- Ensure you're using the correct cookie/token
- Verify token hasn't expired (5min for users, 8h for admins)

#### **Database connection errors**
- Verify DATABASE_URL is correct
- Check database server is running
- Ensure SSL certificate is valid (if using SSL)

### **Getting Help**
1. Check the logs in `logs/` directory
2. Verify your request format matches the documentation
3. Test endpoints using the interactive API docs
4. Check rate limit headers in responses

---

## 🎯 **API Endpoints Summary**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | ❌ |
| POST | `/logout` | User logout | ❌ |
| GET | `/users` | Get all users | ✅ (User) |
| POST | `/users` | Create user | ❌ |
| GET | `/positions` | Get positions | ❌ |
| POST | `/positions` | Create position | ❌ |
| GET | `/positions/:id/candidates` | Get candidates | ❌ |
| POST | `/positions/:id/candidates` | Add candidate | ❌ |
| POST | `/vote` | Cast vote | ✅ (User) |
| POST | `/verify` | Verify vote | ❌ |
| POST | `/admin/login` | Admin login | ❌ |
| POST | `/admin/logout` | Admin logout | ✅ (Admin) |
| GET | `/admin/profile` | Admin profile | ✅ (Admin) |
| POST | `/admin/create` | Create admin | ✅ (Super) |
| GET | `/admin/all` | List admins | ✅ (Admin+) |
| GET | `/admin/stats` | Admin stats | ✅ (Admin+) |
| PUT | `/admin/:id/role` | Update role | ✅ (Super) |
| DELETE | `/admin/:id/deactivate` | Deactivate admin | ✅ (Super) |
| POST | `/admin/change-password` | Change password | ✅ (Admin) |
| GET | `/stats/overall` | Overall stats | ✅ (Admin+) |
| GET | `/stats/position/:id` | Position stats | ✅ (Admin+) |
| GET | `/stats/trends` | Voting trends | ✅ (Admin+) |
| GET | `/stats/demographics` | Voter demographics | ✅ (Admin+) |
| GET | `/stats/top-candidates` | Top candidates | ✅ (Admin+) |
| GET | `/stats/summary` | Election summary | ✅ (Admin+) |
| GET | `/audit/vote/:id` | Audit vote | ✅ (Admin+) |
| POST | `/audit/full` | Full audit | ✅ (Super) |
| GET | `/audit/fraud-detection` | Fraud detection | ✅ (Admin+) |
| GET | `/audit/suspicious` | Suspicious votes | ✅ (Admin+) |
| GET | `/audit/logs` | Audit logs | ✅ (Admin+) |
| GET | `/api-docs` | API documentation | ❌ |

**Legend**: ✅ (Super) = Super Admin only, ✅ (Admin+) = Admin and Super Admin, ✅ (User) = Authenticated user

---

## 🎉 **Conclusion**

This API provides a complete voting system with:
- ✅ **Secure authentication** and authorization
- ✅ **Comprehensive logging** and audit trails
- ✅ **Advanced analytics** and reporting
- ✅ **Fraud detection** and prevention
- ✅ **Rate limiting** and DDoS protection
- ✅ **Interactive documentation** and testing
- ✅ **Production-ready** deployment configuration

The system is designed for reliability, security, and scalability in production environments.
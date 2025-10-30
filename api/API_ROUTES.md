# SJBU Voting System - API Routes Documentation

## 📋 Complete List of API Endpoints

This document provides a comprehensive overview of all available API endpoints in the SJBU Voting System.

## 🔐 Authentication Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `POST` | `/api/app/login` | User login with voucher code | ❌ Public |
| `POST` | `/api/app/logout` | User logout | ❌ Public |
| `POST` | `/api/app/admin/login` | Admin login with email/password | ❌ Public |
| `POST` | `/api/app/admin/logout` | Admin logout | ✅ Admin Required |

## 👥 User Management Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/app/users` | Get all registered users | ✅ User Token |
| `POST` | `/api/app/users` | Create new user with voucher | ❌ Public |

## 🏛️ Position Management Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/app/positions` | Get all voting positions | ❌ Public |
| `POST` | `/api/app/positions` | Create new voting position | ❌ Public |
| `GET` | `/api/app/positions/{positionId}/candidates` | Get candidates for specific position | ❌ Public |
| `POST` | `/api/app/positions/{positionId}/candidates` | Add candidate to position | ❌ Public |

## 🗳️ Voting Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `POST` | `/api/app/vote` | Cast a vote (rate limited: 3 votes/5min per IP, 5 votes/hour per user) | ✅ User Token |
| `POST` | `/api/app/verify` | Verify vote using verification code | ❌ Public |

## 🔧 Admin Management Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/app/admin/profile` | Get current admin profile | ✅ Admin Token |
| `POST` | `/api/app/admin/change-password` | Change admin password | ✅ Admin Token |
| `POST` | `/api/app/admin/create` | Create new admin user | ✅ Super Admin |
| `GET` | `/api/app/admin/all` | Get all admin users | ✅ Admin+ |
| `GET` | `/api/app/admin/stats` | Get admin system statistics | ✅ Admin+ |
| `PUT` | `/api/app/admin/{adminId}/role` | Update admin role | ✅ Super Admin |
| `DELETE` | `/api/app/admin/{adminId}/deactivate` | Deactivate admin account | ✅ Super Admin |

## 📊 Statistics Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/app/stats/overall` | Overall voting statistics | ✅ Admin+ |
| `GET` | `/api/app/stats/position/{positionId}` | Position-specific statistics | ✅ Admin+ |
| `GET` | `/api/app/stats/trends` | Voting trends (last 30 days) | ✅ Admin+ |
| `GET` | `/api/app/stats/demographics` | Voter demographics and trends | ✅ Admin+ |
| `GET` | `/api/app/stats/top-candidates` | Top performing candidates | ✅ Admin+ |
| `GET` | `/api/app/stats/summary` | Complete election summary | ✅ Admin+ |

## 🔍 Audit Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/app/audit/vote/{voteId}` | Audit single vote for irregularities | ✅ Admin+ |
| `POST` | `/api/app/audit/full` | Complete system audit | ✅ Super Admin |
| `GET` | `/api/app/audit/fraud-detection` | Analyze voting patterns for fraud | ✅ Admin+ |
| `GET` | `/api/app/audit/suspicious` | Get suspicious votes by risk score | ✅ Admin+ |
| `GET` | `/api/app/audit/logs` | Get system audit logs | ✅ Admin+ |

## 📚 Documentation Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/app/api-docs` | Interactive API documentation (Swagger UI) | ❌ Public |

## 🌐 Route Summary

### Total Routes: 25

#### By Category:
- **🔐 Authentication:** 4 routes
- **👥 User Management:** 2 routes
- **🏛️ Position Management:** 4 routes
- **🗳️ Voting:** 2 routes
- **🔧 Admin Management:** 9 routes
- **📊 Statistics:** 6 routes
- **🔍 Audit:** 5 routes
- **📚 Documentation:** 1 route

#### By Security Level:
- **🔓 Public Routes:** 8 routes (login, positions, candidates, voting, verification, docs)
- **🔒 User Authenticated:** 2 routes (voting, user listing)
- **🛡️ Admin+ Required:** 12 routes (statistics, admin management, audit features)
- **👑 Super Admin Only:** 3 routes (full audit, admin creation, role management)

## 🚀 Base URL Structure

```
https://your-domain.com/api/app/
├── 🔐 /login                    (Authentication)
├── 👥 /users                    (User Management)
├── 🏛️ /positions                (Position Management)
├── 🗳️ /vote                     (Voting)
├── 🔧 /admin/                   (Admin Management)
├── 📊 /stats/                   (Statistics)
├── 🔍 /audit/                   (Audit)
└── 📚 /api-docs                (Documentation)
```

## 🔒 Security Features

- **JWT Authentication** for protected routes
- **Role-based Access Control** (User, Admin, Super Admin)
- **Rate Limiting** on voting and authentication endpoints
- **Input Validation** and sanitization
- **Audit Logging** for all administrative actions
- **SSL/TLS Encryption** for all communications

## 📊 Response Formats

All API responses follow a consistent format:

### Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🚦 Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (missing/invalid data)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **429**: Too many requests (rate limited)
- **500**: Internal server error

## 📖 API Documentation

Interactive API documentation is available at:
```
/api/app/api-docs
```

This provides detailed information about each endpoint including:
- Request/response schemas
- Parameter descriptions
- Example requests and responses
- Authentication requirements

## 🔄 Rate Limits

- **General API:** 100 requests/15 minutes per IP
- **Voting:** 3 votes/5 minutes per IP, 5 votes/hour per user
- **Authentication:** 5 attempts/15 minutes per IP
- **Admin Actions:** Higher limits for authenticated admin users

## 📝 Notes

- All timestamps are returned in ISO 8601 format
- Vote verification codes are unique 12-character alphanumeric strings
- Admin roles: `super_admin`, `admin`, `moderator`
- Position and candidate management is public for flexibility
- Comprehensive audit trails for all administrative actions
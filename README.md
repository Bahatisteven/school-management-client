# School Management System - Client Application

A web application for parents and students to manage school fees, view academic records, track attendance, and access class timetables. Built with Node.js, Express, React, and MongoDB with robust security features.

## Overview

This client application allows students and parents to interact with the school management system securely. Students can view their academic performance and manage fees, while parents can oversee multiple children from a single dashboard. All access requires device verification by administrators.

## Core Features

**Authentication & Security**
- JWT-based authentication with device verification
- SHA-512 + bcrypt password hashing (12 rounds)
- Role-based access (Student, Parent)
- Secure HTTP headers and rate limiting
- Session expiry after 24 hours

**Fee Management**
- View current fee balance
- Make fee deposits
- Request withdrawals (subject to available balance)
- Complete transaction history with filtering
- Low balance warnings

**Academic Records**
- View grades by subject and term
- Track attendance status (present/absent/late/excused)
- Access class timetables
- Filter attendance by date range

**Parent Features**
- Manage multiple children from one account
- View each child's academic performance
- Handle fee payments for all children
- Individual timetables per child

**User Experience**
- Responsive design for desktop and mobile
- Clean, intuitive interface
- Real-time loading states
- Clear error messages and success notifications

## Tech Stack

**Backend**
- Node.js v16+ with Express.js v5.2.1
- MongoDB v7.0 with Mongoose ODM
- JWT authentication with device verification
- Password security: SHA-512 pre-hash + bcrypt (12 rounds)
- Validation: express-validator, Joi
- Security: Helmet, express-rate-limit
- Development: Nodemon

**Frontend**
- React v19.2.4 with Vite v8.0.1
- React Router v7.13.1
- Axios for HTTP requests
- Context API for state management
- Tailwind CSS v4.2.2 for styling
- Lucide React icons

**DevOps**
- Docker & Docker Compose
- Nginx for production
- MongoDB 7.0 containerized

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB v5+
- npm or yarn

### Local Development

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your settings
npm run dev
```

Backend runs on http://localhost:5000

2. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on http://localhost:5173

### Docker Deployment

```bash
# Create .env file with required variables
docker-compose up -d
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: port 27018 (external)

## Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management_shared
JWT_SECRET=your_secure_secret_key_minimum_32_chars
TOKEN_EXPIRY=24h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

**Authentication**
- `POST /api/auth/register` - Register (student/parent)
- `POST /api/auth/login` - Login with device ID
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get profile

**Fee Management**
- `POST /api/fees/deposit` - Make deposit
- `POST /api/fees/withdraw` - Request withdrawal
- `GET /api/fees/balance` - Get balance
- `GET /api/fees/balance/:childStudentId` - Get child's balance (parent)
- `GET /api/fees/history` - Transaction history
- `GET /api/fees/history/:childStudentId` - Child's history (parent)

**Academic Records**
- `GET /api/academic/grades` - Get grades
- `GET /api/academic/grades/:childStudentId` - Child's grades (parent)
- `GET /api/academic/attendance` - Attendance records
- `GET /api/academic/attendance/:childStudentId` - Child's attendance (parent)
- `GET /api/academic/timetable` - Class timetable
- `GET /api/academic/timetable/:childStudentId` - Child's timetable (parent)

**Student Management**
- `GET /api/students/profile` - Get profile
- `PUT /api/students/profile` - Update profile
- `GET /api/students/children` - Get children (parent only)

All endpoints require:
- Authorization: Bearer {token}
- X-Device-ID: {device-id}

## Authentication Flow

1. **Registration**
   - User registers with email, password, and role (student/parent)
   - System generates unique student ID
   - Password hashed with SHA-512 then bcrypt

2. **Login**
   - User provides email, password, and device ID (auto-generated)
   - System checks if device is registered
   - New devices added as "pending verification"
   - Access denied until admin verifies device

3. **Device Verification**
   - Admin reviews pending devices in admin application
   - Upon approval, user can access the system
   - Multiple devices supported per user

4. **Session Management**
   - JWT token issued upon successful login
   - Token expires after 24 hours (configurable)
   - Must include token and device ID in all requests

## Project Structure

```
school-management-client/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & constants
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, validation, errors
│   │   ├── dtos/           # Data transfer objects
│   │   └── utils/          # Helper functions
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Auth context
│   │   └── styles/         # CSS files
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Security Features

- **Authentication**: JWT tokens with 24-hour expiry
- **Password Hashing**: SHA-512 + bcrypt (12 rounds)
- **Device Verification**: Admin-approved device access required
- **Role-Based Access**: Student and Parent permissions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs validated and sanitized
- **HTTP Security**: Helmet.js headers, CORS protection
- **DTOs**: Sensitive data filtered from responses
- **Balance Protection**: Withdrawals cannot exceed available balance

## Database Schemas

**User** - Authentication and device management  
**Student** - Student profiles and fee balances  
**Teacher** - Teacher profiles (read-only for clients)  
**Class** - Class details and schedules  
**Grade** - Academic grades by subject and term  
**Attendance** - Daily attendance records  
**FeeTransaction** - Fee deposits and withdrawals  

## User Roles

**Student**
- View own academic records
- Manage own fee payments
- Access grades, attendance, timetable

**Parent**
- Manage multiple children
- View all children's academic records
- Handle fee payments for children
- Access consolidated information

## Key Implementation Details

**Device ID Management**
- Device ID auto-generated client-side (localStorage)
- Stored with device name and timestamp
- Requires admin approval before system access
- Supports multiple devices per user

**Parent-Child Relationship**
- Parents linked to students via student IDs
- Separate API endpoints for accessing child data
- All parent operations include child verification

**Fee Transaction Rules**
- Deposits immediately update balance
- Withdrawals require sufficient balance
- Transactions are immutable once created
- Complete audit trail maintained

**Shared Database**
- Client and Admin apps use same MongoDB database
- Ensures data consistency
- Real-time updates across applications

## Troubleshooting

**Cannot login - "Device not verified"**
- Contact school administrator
- Admin must approve device in admin application
- Check Verifications page in admin panel

**MongoDB connection failed**
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

**Token expired**
- Login again to get new token
- Default expiry is 24 hours

**Fee balance incorrect**
- Check transaction history for discrepancies
- Contact administrator if issues persist

**Cannot view children (parent)**
- Verify parent role is set correctly
- Check if children are linked to parent account

## Production Deployment

**Backend**
1. Set strong JWT_SECRET (min 32 characters)
2. Use production MongoDB URI (MongoDB Atlas recommended)
3. Enable HTTPS
4. Configure proper CORS origins
5. Use PM2 for process management
6. Set up monitoring and logging

**Frontend**
1. Build: `npm run build`
2. Serve with Nginx
3. Enable HTTPS
4. Configure CDN (optional)
5. Set production API URL

**Security Checklist**
- Change all default credentials
- Enable MongoDB authentication
- Use environment variables for secrets
- Set NODE_ENV=production
- Configure firewall rules
- Set up automated backups

## Design Decisions

- **JWT over Sessions**: Stateless authentication for scalability
- **Device Verification**: Enhanced security for mobile/multi-device access
- **DTOs**: Prevent sensitive data exposure
- **Context API**: Simple state management without external libraries
- **Tailwind CSS**: Utility-first styling for rapid development
- **Shared Database**: Data consistency with admin application

## License

ISC

## Support

For technical issues or questions, contact your school administrator or the development team.

---

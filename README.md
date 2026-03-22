# School Management System - Client Application

A comprehensive school management system for parents and students to manage fees, view academic records, and access timetables.

## Features

### Authentication & Security
- JWT-based authentication with SHA-512 password hashing
- Device ID verification (admin approval required)
- Role-based access control (Student, Parent)
- Secure HTTP headers with Helmet
- Rate limiting for API protection

### Fee Management
- View current fee balance
- Make deposits
- Request withdrawals
- View transaction history
- Low balance alerts

### Academic Records
- View grades by subject
- Track attendance records
- Access class timetable
- Filter attendance by date range

### Parent Features
- Manage multiple children
- View each child's academic performance
- Handle fee payments for children

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- Helmet for security headers
- express-rate-limit for rate limiting

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API calls
- Context API for state management
- CSS for styling

## Project Structure

```
school-management-client/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and constants
│   │   ├── models/         # Mongoose models
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── dtos/           # Data transfer objects
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   ├── utils/          # Utilities and context
    │   ├── styles/         # CSS files
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management_client
JWT_SECRET=your_secure_jwt_secret_key
TOKEN_EXPIRY=24h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

5. Start MongoDB service:
```bash
# On Linux
sudo systemctl start mongod

# On macOS with Homebrew
brew services start mongodb-community
```

6. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

6. Build for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (student/parent)
- `POST /api/auth/login` - Login with email, password, and device ID
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify-device` - Admin: Verify user device
- `GET /api/auth/pending-verifications` - Admin: Get pending device verifications

### Fee Management
- `POST /api/fees/deposit` - Make fee deposit
- `POST /api/fees/withdraw` - Request fee withdrawal
- `GET /api/fees/balance` - Get current fee balance
- `GET /api/fees/balance/:childStudentId` - Parent: Get child's balance
- `GET /api/fees/history` - Get transaction history
- `GET /api/fees/history/:childStudentId` - Parent: Get child's transaction history

### Academic Records
- `GET /api/academic/grades` - Get student grades
- `GET /api/academic/grades/:childStudentId` - Parent: Get child's grades
- `GET /api/academic/attendance` - Get attendance records
- `GET /api/academic/attendance/:childStudentId` - Parent: Get child's attendance
- `GET /api/academic/timetable` - Get class timetable
- `GET /api/academic/timetable/:childStudentId` - Parent: Get child's timetable
- `POST /api/academic/grades` - Teacher: Add grade
- `POST /api/academic/attendance` - Teacher: Record attendance

### Student Management
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/children` - Parent: Get all children

## Authentication Flow

1. **Registration**:
   - User registers with email, password, and role (student/parent)
   - Password is hashed using bcryptjs (SHA-512 mode)
   - Student ID is auto-generated

2. **Login**:
   - User provides email, password, and device ID
   - System checks if device is registered
   - If new device, it's added as "pending verification"
   - User cannot access system until admin verifies device
   - If device is verified, JWT token is issued

3. **Device Verification**:
   - Admin reviews pending device verifications
   - Admin approves or rejects devices
   - User receives notification (if implemented)

4. **Session Management**:
   - JWT token expires in 24 hours (configurable)
   - Token must be included in Authorization header
   - Device ID must be included in X-Device-ID header

## User Roles

### Student
- View own academic records
- Manage own fee payments
- View grades, attendance, and timetable

### Parent
- Manage multiple children
- View children's academic records
- Handle fee payments for children
- Access all child-related information

### Teacher (Backend only)
- Add grades for students
- Record attendance
- View assigned classes

### Admin (Backend only)
- Verify user devices
- Manage users, classes, and teachers
- Full system access

## Security Features

- Password hashing with bcryptjs (SHA-512 mode, 12 rounds)
- JWT authentication with configurable expiry
- Device ID verification workflow
- Role-based access control
- Input validation and sanitization
- SQL injection protection (MongoDB)
- XSS protection via Helmet
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Secure HTTP headers

## Key Assumptions

1. MongoDB is running locally or connection string is provided
2. Device ID is generated client-side and stored in localStorage
3. Admin users are created directly in database (no public admin registration)
4. Fee balance cannot go negative
5. One student can belong to one class at a time
6. Parents can have multiple children
7. Teachers must be assigned to classes by admin
8. Academic year and terms are managed by admin

## Testing

### Manual Testing

1. **Register a new student**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "phoneNumber": "+250788123456",
    "dateOfBirth": "2005-01-15"
  }'
```

2. **Login** (will require device verification):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "deviceId": "device_123456",
    "deviceName": "Chrome Browser"
  }'
```

3. **Make fee deposit** (after device verification):
```bash
curl -X POST http://localhost:5000/api/fees/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Device-ID: device_123456" \
  -d '{
    "amount": 50000,
    "description": "Term 1 fees"
  }'
```

## Development

### Adding New Features

1. Create model in `backend/src/models/`
2. Create service in `backend/src/services/`
3. Create controller in `backend/src/controllers/`
4. Add routes in `backend/src/routes/`
5. Create frontend service in `frontend/src/services/`
6. Create/update React component in `frontend/src/pages/` or `frontend/src/components/`

### Code Style

- Use meaningful variable and function names
- Keep functions small and focused
- Use async/await for asynchronous operations
- Handle errors appropriately
- Add comments for complex logic
- Follow RESTful API conventions

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and is configured correctly
- Check port 5000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check VITE_API_URL in `.env`
- Check CORS settings in backend

### Device verification pending
- Contact admin to verify your device
- Check device ID in localStorage matches the one sent to backend

### Database connection errors
- Verify MongoDB is running
- Check MONGODB_URI in `.env`
- Ensure database user has correct permissions

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas or production database
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up process manager (PM2)
7. Configure reverse proxy (Nginx)

### Frontend
1. Build production bundle: `npm run build`
2. Serve static files with web server
3. Configure environment variables
4. Enable HTTPS
5. Set up CDN (optional)

## License

ISC

## Support

For issues and questions, please contact the development team.

# Signup System Guide for Online Judge Codester

## Overview

The signup system provides comprehensive registration options for both regular users and administrators, supporting both manual registration and Google OAuth integration.

## Features

### 🔐 **Dual Registration Modes**
- **User Registration**: Standard user accounts with basic privileges
- **Admin Registration**: Administrator accounts with full platform access
- **Mode Toggle**: Easy switching between user and admin registration

### 🌐 **Multiple Authentication Methods**
- **Google OAuth**: Quick registration using Google accounts
- **Manual Registration**: Traditional email/password registration
- **Admin Code Verification**: Secure admin access with special codes

### 🛡️ **Security Features**
- **Password Hashing**: Bcrypt encryption for all passwords
- **Admin Code Protection**: Secure admin code verification
- **Input Validation**: Comprehensive form validation
- **Error Handling**: User-friendly error messages

## Registration Flow

### **User Registration**

#### **Option 1: Google OAuth (Recommended)**
1. Navigate to `/register`
2. Select "User" mode (default)
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Account automatically created and logged in

#### **Option 2: Manual Registration**
1. Navigate to `/register`
2. Select "User" mode
3. Fill in required fields:
   - Full Name
   - Email Address
   - Password (min 6 characters)
   - Confirm Password
4. Click "Create User Account"
5. Account created and automatically logged in

### **Admin Registration**

#### **Option 1: Google OAuth**
1. Navigate to `/register`
2. Select "Admin" mode
3. Click "Continue with Google (Admin)"
4. Complete Google OAuth flow
5. Admin account created (requires admin email domain)

#### **Option 2: Manual Registration**
1. Navigate to `/register`
2. Select "Admin" mode
3. Fill in required fields:
   - Full Name
   - Email Address
   - Password (min 6 characters)
   - Confirm Password
   - **Admin Code** (required)
4. Click "Create Admin Account"
5. Admin account created and logged in

## Login Flow

### **User Login**

#### **Option 1: Google OAuth**
1. Navigate to `/login`
2. Select "User" mode
3. Click "Continue with Google"
4. Complete Google OAuth flow

#### **Option 2: Manual Login**
1. Navigate to `/login`
2. Select "User" mode
3. Enter email and password
4. Click "Sign In"

### **Admin Login**

#### **Option 1: Google OAuth**
1. Navigate to `/login`
2. Select "Admin" mode
3. Click "Continue with Google (Admin)"
4. Complete Google OAuth flow

#### **Option 2: Manual Login**
1. Navigate to `/login`
2. Select "Admin" mode
3. Enter email, password, and admin code
4. Click "Sign In as Admin"

## Admin Code System

### **Default Admin Codes**
The system comes with these default admin codes:
- `ADMIN2024`
- `SUPERADMIN`

### **Customizing Admin Codes**
Set environment variable `ADMIN_CODES` with comma-separated codes:

```bash
ADMIN_CODES=YOUR_ADMIN_CODE,ANOTHER_CODE,SECRET_CODE
```

### **Admin Code Security**
- Admin codes are verified server-side
- Invalid codes prevent admin registration
- Codes can be changed without code deployment
- Multiple codes supported for different admin levels

## 🔐 **Admin Access Methods**

### **Method 1: Admin Code Registration**
- Use admin codes during registration: `ADMIN2024`, `SUPERADMIN`
- Any email can become admin with valid admin code

### **Method 2: Specific Admin Email**
- **Primary Admin Email**: `vikrantkawadkar2099@gmail.com`
- Automatically recognized as admin when signing in with Google
- No admin code required for this specific email

### **Method 3: Email Pattern Detection**
- Any email containing "admin" (e.g., `admin@example.com`, `useradmin@gmail.com`)
- Automatically detected as admin on frontend

## 🛠️ **Configuration**

## API Endpoints

### **Registration**
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "adminCode": "ADMIN2024" // Optional for admin registration
}
```

### **Admin Code Verification**
```
POST /api/auth/verify-admin-code
```
**Body:**
```json
{
  "adminCode": "ADMIN2024"
}
```

### **Login**
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### **Get Current User**
```
GET /api/auth/me
```
**Headers:**
```
Authorization: Bearer <token>
```

## Database Schema

### **User Model**
```javascript
{
  email: String,        // Required, unique, lowercase
  name: String,         // Required
  password: String,     // Required, hashed
  role: String,         // 'user' or 'admin'
  isActive: Boolean,    // Account status
  stats: {
    problemsSolved: Number,
    currentStreak: Number,
    totalSubmissions: Number,
    accuracy: Number
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

### **Password Security**
- **Bcrypt Hashing**: All passwords hashed with bcrypt
- **Salt Rounds**: 10 salt rounds for security
- **Minimum Length**: 6 characters required
- **Password Comparison**: Secure comparison method

### **Admin Security**
- **Admin Code Verification**: Server-side validation
- **Role-based Access**: Admin routes protected
- **Account Status**: Active/inactive user management
- **JWT Tokens**: Secure authentication tokens

### **Input Validation**
- **Email Format**: Valid email address required
- **Password Strength**: Minimum length enforced
- **Required Fields**: All necessary fields validated
- **Duplicate Prevention**: Email uniqueness enforced

## Frontend Components

### **Register Page (`/register`)**
- Mode toggle (User/Admin)
- Google OAuth integration
- Manual registration form
- Real-time validation
- Error handling and display

### **Login Page (`/login`)**
- Mode toggle (User/Admin)
- Google OAuth integration
- Manual login form
- Password visibility toggle
- Error handling and display

### **Auth Service**
- Registration API calls
- Login API calls
- Token management
- User session handling

## Environment Configuration

### **Required Environment Variables**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/codester

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Admin Codes
ADMIN_CODES=ADMIN2024,SUPERADMIN

# Server
PORT=3001
NODE_ENV=development
```

### **Optional Environment Variables**
```bash
# API URL (for frontend)
VITE_API_URL=http://localhost:3001/api

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Usage Examples

### **Creating a Regular User**
```javascript
// Frontend registration
const userData = {
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword123"
};

const result = await authService.registerUser(userData);
```

### **Creating an Admin User**
```javascript
// Frontend admin registration
const adminData = {
  name: "Admin User",
  email: "admin@codester.com",
  password: "adminpassword123",
  adminCode: "ADMIN2024"
};

const result = await authService.registerUser(adminData);
```

### **User Login**
```javascript
// Frontend login
const loginData = {
  email: "john@example.com",
  password: "securepassword123"
};

const result = await authService.loginUser(loginData.email, loginData.password);
```

### **Admin Login**
```javascript
// Frontend admin login
const adminLoginData = {
  email: "admin@codester.com",
  password: "adminpassword123",
  adminCode: "ADMIN2024"
};

const result = await authService.loginUser(adminLoginData.email, adminLoginData.password);
```

## Error Handling

### **Common Registration Errors**
- `Missing required fields`: Fill in all required fields
- `Password too short`: Password must be 6+ characters
- `User already exists`: Email already registered
- `Invalid admin code`: Admin code verification failed

### **Common Login Errors**
- `Invalid credentials`: Wrong email or password
- `Account deactivated`: User account disabled
- `Missing required fields`: Fill in all required fields

### **Frontend Error Display**
- Real-time validation feedback
- User-friendly error messages
- Loading states during operations
- Success confirmations

## Best Practices

### **Security**
- Use strong admin codes
- Regularly rotate admin codes
- Monitor admin registrations
- Implement rate limiting
- Use HTTPS in production

### **User Experience**
- Clear error messages
- Loading indicators
- Form validation
- Responsive design
- Accessibility features

### **Development**
- Test both registration modes
- Verify admin code functionality
- Check Google OAuth integration
- Validate form submissions
- Test error scenarios

## Troubleshooting

### **Common Issues**

1. **Admin Registration Fails**
   - Check admin code validity
   - Verify environment variables
   - Check server logs for errors

2. **Google OAuth Not Working**
   - Verify Google OAuth configuration
   - Check redirect URLs
   - Ensure proper domain setup

3. **Password Hashing Issues**
   - Check bcrypt installation
   - Verify password comparison
   - Test with known passwords

4. **JWT Token Problems**
   - Verify JWT_SECRET environment variable
   - Check token expiration
   - Validate token format

### **Debug Mode**
Enable debug logging:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## Future Enhancements

### **Planned Features**
- **Email Verification**: Confirm email addresses
- **Password Reset**: Forgot password functionality
- **Two-Factor Authentication**: Enhanced security
- **Social Login**: Additional OAuth providers
- **Bulk User Import**: Admin user management

### **Integration Possibilities**
- **Email Service**: Registration confirmations
- **SMS Verification**: Phone number verification
- **LDAP Integration**: Enterprise authentication
- **SSO Support**: Single sign-on integration

---

**Note**: This signup system is designed to be secure, scalable, and user-friendly. Always test thoroughly in development before deploying to production. 
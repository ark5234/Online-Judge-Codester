# Admin Mode Guide for Online Judge Codester

## Overview

The admin mode provides comprehensive management capabilities for the Online Judge platform, allowing administrators to manage users, problems, contests, and system settings.

## Features

### 🔐 Authentication & Authorization
- **Admin Route Protection**: Only users with admin role can access admin pages
- **Role-based Access Control**: Different permissions for admin vs regular users
- **Secure API Endpoints**: All admin endpoints require authentication and admin privileges

### 📊 Admin Dashboard
- **Overview Tab**: Platform statistics and recent activity
- **Users Tab**: Complete user management with search and filtering
- **Problems Tab**: Problem creation, editing, and management
- **Contests Tab**: Contest management and monitoring
- **Settings Tab**: System configuration and platform settings

### 👥 User Management
- **View All Users**: Complete list with detailed information
- **Search & Filter**: Find users by name, email, role, or status
- **Role Management**: Promote/demote users between user and admin roles
- **Status Control**: Activate/deactivate user accounts
- **User Statistics**: View user performance metrics
- **Delete Users**: Remove users from the platform

### 📝 Problem Management
- **Create Problems**: Add new coding problems with test cases
- **Edit Problems**: Modify existing problems and test cases
- **Problem Status**: Publish/draft problem states
- **Difficulty Management**: Set problem difficulty levels
- **Delete Problems**: Remove problems from the platform

### 🏆 Contest Management
- **Create Contests**: Set up new coding competitions
- **Monitor Participation**: Track contest participants and submissions
- **Contest Status**: Manage active, upcoming, and ended contests
- **Problem Assignment**: Assign problems to contests

### ⚙️ System Settings
- **Maintenance Mode**: Temporarily disable the platform
- **Registration Control**: Enable/disable new user registrations
- **Email Notifications**: Configure email notification settings
- **Platform Configuration**: Various system-level settings

## How to Access Admin Mode

### 1. Admin Role Assignment
Currently, admin access is determined by:
- Email containing "admin" (e.g., admin@codester.com)
- User ID being "admin"
- User having "admin" label

To customize admin detection, modify the `AuthContext.jsx`:

```javascript
const isAdminUser = userData.email?.includes('admin') || 
                   userData.$id === 'admin' || 
                   userData.labels?.includes('admin');
```

### 2. Accessing Admin Panel
1. Login with an admin account
2. Click on your profile dropdown in the navbar
3. Select "Admin Panel" from the dropdown menu
4. Or navigate directly to `/admin`

### 3. Admin Navigation
- **Desktop**: Admin link appears in the user dropdown menu
- **Mobile**: Admin link appears in the mobile menu
- **Direct URL**: Navigate to `/admin` (will redirect non-admins)

## API Endpoints

### Admin Statistics
```
GET /api/admin/stats
```
Returns platform statistics including user counts, problem counts, etc.

### User Management
```
GET /api/admin/users
PUT /api/admin/users/:userId/role
PUT /api/admin/users/:userId/status
DELETE /api/admin/users/:userId
```

### Problem Management
```
GET /api/admin/problems
POST /api/admin/problems
PUT /api/admin/problems/:problemId
DELETE /api/admin/problems/:problemId
```

### System Settings
```
GET /api/admin/settings
PUT /api/admin/settings
```

## Database Models

### User Model
```javascript
{
  email: String,
  name: String,
  role: String, // 'user' or 'admin'
  isActive: Boolean,
  stats: {
    problemsSolved: Number,
    currentStreak: Number,
    totalSubmissions: Number,
    accuracy: Number
  }
}
```

### Submission Model
```javascript
{
  user: ObjectId,
  problem: ObjectId,
  code: String,
  language: String,
  status: String,
  executionTime: Number,
  memoryUsed: Number,
  testCasesPassed: Number,
  totalTestCases: Number
}
```

## Security Features

### Backend Security
- **JWT Authentication**: All admin endpoints require valid JWT tokens
- **Admin Middleware**: `requireAdmin` middleware checks user role
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling and logging

### Frontend Security
- **Route Protection**: `AdminRoute` component prevents unauthorized access
- **Role Checking**: Admin status checked on every page load
- **Secure API Calls**: All admin API calls include authentication headers

## Customization

### Adding New Admin Features

1. **Create Admin Component**:
```javascript
// pages/AdminNewFeature.jsx
export default function AdminNewFeature() {
  // Your admin component
}
```

2. **Add Route**:
```javascript
// App.jsx
<Route path="/admin/new-feature" element={
  <AdminRoute>
    <AdminNewFeature />
  </AdminRoute>
} />
```

3. **Add API Endpoint**:
```javascript
// backend/server/production-server.js
app.get('/api/admin/new-feature', authenticateToken, requireAdmin, async (req, res) => {
  // Your admin endpoint
});
```

### Customizing Admin Detection

Modify the admin detection logic in `AuthContext.jsx`:

```javascript
// Example: Check for custom admin attribute
const isAdminUser = userData.customAttributes?.admin === true;

// Example: Check specific email domains
const isAdminUser = userData.email?.endsWith('@codester.com');

// Example: Check user labels
const isAdminUser = userData.labels?.includes('admin');
```

## Best Practices

### Security
- Always validate admin permissions on both frontend and backend
- Use HTTPS in production
- Implement rate limiting for admin endpoints
- Log all admin actions for audit purposes

### User Experience
- Provide clear feedback for admin actions
- Use loading states for async operations
- Implement confirmation dialogs for destructive actions
- Show success/error messages for all operations

### Performance
- Implement pagination for large datasets
- Use efficient database queries with proper indexing
- Cache frequently accessed data
- Optimize API responses

## Troubleshooting

### Common Issues

1. **Admin Access Not Working**
   - Check if user email contains "admin"
   - Verify JWT token is valid
   - Check browser console for errors

2. **API Endpoints Not Responding**
   - Verify backend server is running
   - Check authentication headers
   - Review server logs for errors

3. **Database Connection Issues**
   - Verify MongoDB connection
   - Check database permissions
   - Review connection string

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed platform usage analytics
- **Bulk Operations**: Mass user/problem management
- **Audit Logs**: Complete action history
- **Advanced Permissions**: Granular role-based permissions
- **API Documentation**: Interactive API documentation
- **Real-time Notifications**: Live admin notifications

### Integration Possibilities
- **Email Integration**: Automated email notifications
- **Slack Integration**: Admin notifications to Slack
- **Analytics Integration**: Google Analytics integration
- **Backup System**: Automated database backups

## Support

For admin-related issues:
1. Check the browser console for errors
2. Review server logs
3. Verify database connectivity
4. Test API endpoints directly
5. Check authentication tokens

---

**Note**: This admin system is designed to be secure and scalable. Always test changes in a development environment before deploying to production. 
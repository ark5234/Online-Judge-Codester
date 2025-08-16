const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://online-judge-codester.onrender.com/api';

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    }
    
    // If no JWT token, try to get Appwrite user data for fallback headers
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const appwriteJwt = localStorage.getItem('APPWRITE_JWT');
      if (user.$id) {
        return {
          'Content-Type': 'application/json',
          // Use real Appwrite JWT if present; backend flexibleAuth only needs identity
          'x-appwrite-token': appwriteJwt || user.$id,
          'x-user-email': user.email,
          'x-user-name': user.name,
          'x-user-avatar': user.avatar || '',
        };
      }
    } catch {}
    
    // No authentication available
    return {
      'Content-Type': 'application/json',
    };
  }

  // Get admin stats
  async getAdminStats() {
    try {
      const response = await fetch(`${this.baseURL}/admin/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // Get all users
  async getUsers() {
    try {
      const response = await fetch(`${this.baseURL}/admin/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Backend currently returns raw array; normalize to { users: [...] }
      if (Array.isArray(data)) {
        return { users: data };
      }
      if (!data.users && data.length === undefined) {
        data.users = [];
      }
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Leaderboard (public-ish) endpoint wrapper
  async getLeaderboard(limit = 100) {
    try {
      const response = await fetch(`${this.baseURL}/leaderboard?limit=${limit}`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return await response.json();
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
      throw e;
    }
  }

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await fetch(`${this.baseURL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId, isActive) {
    try {
      const response = await fetch(`${this.baseURL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get problems (for admin management)
  async getProblems() {
    try {
      const response = await fetch(`${this.baseURL}/admin/problems`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching problems:', error);
      throw error;
    }
  }

  // Create problem
  async createProblem(problemData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/problems`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(problemData),
      });

      if (!response.ok) {
        throw new Error('Failed to create problem');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating problem:', error);
      throw error;
    }
  }

  // Update problem
  async updateProblem(problemId, problemData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/problems/${problemId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(problemData),
      });

      if (!response.ok) {
        throw new Error('Failed to update problem');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating problem:', error);
      throw error;
    }
  }

  // Delete problem
  async deleteProblem(problemId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/problems/${problemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete problem');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting problem:', error);
      throw error;
    }
  }

  // Get submissions (for admin review)
  async getSubmissions(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}/admin/submissions?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // Get system settings
  async getSystemSettings() {
    try {
      const response = await fetch(`${this.baseURL}/admin/settings`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  // Update system settings
  async updateSystemSettings(settings) {
    try {
      const response = await fetch(`${this.baseURL}/admin/settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update system settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }
}

export default new AdminService(); 
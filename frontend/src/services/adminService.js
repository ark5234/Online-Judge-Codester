const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
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
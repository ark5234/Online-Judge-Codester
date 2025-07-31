import { Client, Account } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6881edab0015c849630d');

export const account = new Account(client);

// Production configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-render-backend.onrender.com';
const COMPILER_URL = import.meta.env.VITE_COMPILER_URL || 'https://your-compiler-ec2-instance.com';

// API endpoints
export const API_ENDPOINTS = {
  // Backend endpoints
  HEALTH: `${BACKEND_URL}/api/health`,
  STATS: `${BACKEND_URL}/api/stats`,
  PROBLEMS: `${BACKEND_URL}/api/problems`,
  SUBMISSIONS: `${BACKEND_URL}/api/submissions`,
  USERS: `${BACKEND_URL}/api/users`,
  DISCUSSIONS: `${BACKEND_URL}/api/discussions`,
  
  // Compiler endpoints
  COMPILE: `${COMPILER_URL}/compile`,
  EXECUTE: `${COMPILER_URL}/execute`,
  COMPILER_HEALTH: `${COMPILER_URL}/health`,
  
  // AI endpoints
  AI_REVIEW: `${BACKEND_URL}/api/ai/review`,
  AI_SUGGEST: `${BACKEND_URL}/api/ai/suggest`,
};

// API service functions
export const apiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Service unavailable' };
    }
  },

  // Get statistics
  async getStats() {
    try {
      const response = await fetch(API_ENDPOINTS.STATS);
      return await response.json();
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  },

  // Compile and execute code
  async executeCode(code, language, input = '') {
    try {
      const response = await fetch(API_ENDPOINTS.EXECUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Code execution failed:', error);
      return {
        success: false,
        output: `Error: ${error.message}`,
        error: error.message,
      };
    }
  },

  // AI review
  async getAIReview(code, language) {
    try {
      const response = await fetch(API_ENDPOINTS.AI_REVIEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI review failed:', error);
      return {
        success: false,
        review: `Error: ${error.message}`,
      };
    }
  },

  // Get problems
  async getProblems() {
    try {
      const response = await fetch(API_ENDPOINTS.PROBLEMS);
      return await response.json();
    } catch (error) {
      console.error('Failed to get problems:', error);
      return [];
    }
  },

  // Submit solution
  async submitSolution(problemId, code, language) {
    try {
      const response = await fetch(API_ENDPOINTS.SUBMISSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId,
          code,
          language,
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Submission failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  },
};

export default apiService; 
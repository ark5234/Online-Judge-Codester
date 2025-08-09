import { Client, Account } from 'appwrite';

export const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6881edab0015c849630d');

export const account = new Account(client);

// JWT fallback utilities to work when 3rd-party cookies are blocked
const JWT_KEY = 'APPWRITE_JWT';
export function setJwt(jwt) {
  try {
    if (jwt) {
      localStorage.setItem(JWT_KEY, jwt);
      client.setJWT(jwt);
    } else {
      localStorage.removeItem(JWT_KEY);
      client.setJWT(undefined);
    }
  } catch {}
}

export function restoreJwtFromStorage() {
  try {
    const jwt = localStorage.getItem(JWT_KEY);
    if (jwt) client.setJWT(jwt);
    return jwt || null;
  } catch { return null; }
}

// Production configuration
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://online-judge-codester.onrender.com/api';
const COMPILER_URL = import.meta.env.VITE_COMPILER_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Backend endpoints
  HEALTH: `${BACKEND_URL}/health`,
  STATS: `${BACKEND_URL}/stats`,
  PROBLEMS: `${BACKEND_URL}/problems`,
  SUBMISSIONS: `${BACKEND_URL}/submissions`,
  USERS: `${BACKEND_URL}/users`,
  DISCUSSIONS: `${BACKEND_URL}/discussions`,
  
  // Compiler endpoints
  COMPILE: `${COMPILER_URL}/compile`,
  EXECUTE: `${COMPILER_URL}/execute`,
  COMPILER_HEALTH: `${COMPILER_URL}/health`,
  
  // AI endpoints
  AI_REVIEW: `${BACKEND_URL}/ai/review`,
  AI_SUGGEST: `${BACKEND_URL}/ai/suggest`,
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
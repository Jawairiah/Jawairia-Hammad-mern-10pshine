const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// Notes API
export const notesApi = {
  // Get all notes
  getAll: async () => {
    return await apiCall('/notes');
  },

  // Get single note
  getById: async (id) => {
    return await apiCall(`/notes/${id}`);
  },

  // Create note
  create: async (noteData) => {
    return await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  // Update note
  update: async (id, noteData) => {
    return await apiCall(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  // Delete note
  delete: async (id) => {
    return await apiCall(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authApi = {
  signup: async (userData) => {
    return await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return await apiCall('/auth/me');
  },
};
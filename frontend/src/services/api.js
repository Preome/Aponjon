const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  get: (endpoint) => fetch(`${API_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  
  post: (endpoint, body) => fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  }),
  
  put: (endpoint, body) => fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  }),
  
  delete: (endpoint) => fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
};
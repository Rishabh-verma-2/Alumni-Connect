import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/user/signup', userData),
  login: (userData) => {
    if (userData.role === 'admin') {
      return api.post('/user/admin/login', userData);
    }
    return api.post('/user/login', userData);
  },
  logout: () => api.post('/user/logout'),
  verifyOTP: (otpData) => api.post('/user/verify', otpData),
  resendOTP: (emailData) => api.post('/user/resend-otp', emailData),
  forgotPassword: (emailData) => api.post('/user/forget-password', emailData),
  resetPassword: (resetData) => api.post('/user/reset-password', resetData),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: (token) => api.get('/admin/dashboard-stats', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllUsers: (token) => api.get('/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getLoginLogs: (token) => api.get('/admin/login-logs', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAuditLogs: (token) => api.get('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  sendBroadcast: (data, token) => api.post('/admin/broadcast', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  testConnection: () => api.get('/admin/test'),
  createTestLogs: () => api.post('/admin/create-test-logs'),
  deleteAllLogs: () => api.delete('/admin/delete-all-logs'),
};

// Student API calls
export const studentAPI = {
  getDashboardStats: (token) => api.get('/student/dashboard-stats', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  createEnrollment: (enrollmentData, token) => api.post('/student/enrollments', enrollmentData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteEnrollment: (enrollmentId, token) => api.delete(`/student/enrollments/${enrollmentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllEnrollments: (token) => api.get('/student/enrollments', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllStudents: (token) => api.get('/student/all', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getProfile: (userId, token) => api.get(`/student/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (userId, profileData, token) => api.put(`/student/profile/${userId}`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  uploadProfileImage: (userId, formData, token) => api.post(`/student/profile/${userId}/upload-image`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }),
};

// Alumni API calls
export const alumniAPI = {
  getAllAlumni: (token) => api.get('/alumni', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  getProfile: (alumniId, token) => api.get(`/alumni/${alumniId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  updateProfile: (alumniId, profileData, token) => api.put(`/alumni/${alumniId}`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

// Notification API calls
export const notificationAPI = {
  sendConnectionRequest: (receiverId, token) => api.post('/connection-request', { receiverId }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  respondToConnectionRequest: (requestId, action, token) => api.post('/connection-response', { requestId, action }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getNotifications: (token) => api.get('/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  markAsRead: (notificationId, token) => api.patch(`/notifications/${notificationId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  clearAll: (token) => api.delete('/notifications/clear-all', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getConnectionRequests: (token) => api.get('/connection-requests', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getSentConnectionRequests: (token) => api.get('/sent-connection-requests', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getConnections: (token) => api.get('/connections', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  removeConnection: (connectionId, token) => api.delete(`/connections/${connectionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const chatAPI = {
  getUserChats: (token) => api.get('/chats', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getOrCreateChat: (participantId, token) => api.get(`/chat/${participantId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  sendMessage: (chatId, message, token) => api.post(`/chat/${chatId}/message`, message, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getUnreadCount: (token) => api.get('/unread-count', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteChat: (chatId, token) => api.delete(`/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteMessage: (chatId, messageId, token) => api.delete(`/chat/${chatId}/message/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  leaveChat: (chatId, token) => api.post(`/chat/${chatId}/leave`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  toggleMessageReaction: (chatId, messageId, reaction, token) => api.post(`/chat/${chatId}/message/${messageId}/reaction`, { reaction }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

// Posts API calls
export const postsAPI = {
  getAllPosts: (token) => api.get('/posts', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  createPost: (postData, token) => api.post('/posts', postData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }),
  likePost: (postId, token) => api.post(`/posts/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  commentOnPost: (postId, commentData, token) => api.post(`/posts/${postId}/comment`, commentData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deletePost: (postId, token) => api.delete(`/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updatePost: (postId, postData, token) => api.put(`/posts/${postId}`, postData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteComment: (postId, commentId, token) => api.delete(`/posts/${postId}/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

// Community API calls
export const communityAPI = {
  // Community CRUD
  getAllCommunities: (filters, token) => api.get('/communities', {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  getCommunityById: (id, token) => api.get(`/communities/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  createCommunity: (communityData, token) => api.post('/communities', communityData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateCommunity: (id, communityData, token) => api.put(`/communities/${id}`, communityData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteCommunity: (id, token) => api.delete(`/communities/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // Member management
  joinCommunity: (id, token) => api.post(`/communities/${id}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  leaveCommunity: (id, token) => api.post(`/communities/${id}/leave`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  approveMember: (id, requestUserId, token) => api.post(`/communities/${id}/approve`, { requestUserId }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  removeMember: (id, memberUserId, token) => api.post(`/communities/${id}/remove`, { memberUserId }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getCommunityMembers: (id, token) => api.get(`/communities/${id}/members`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),

  // Community posts
  getCommunityPosts: (id, token) => api.get(`/communities/${id}/posts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  createCommunityPost: (id, postData, token) => api.post(`/communities/${id}/posts`, postData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateCommunityPost: (id, postId, postData, token) => api.put(`/communities/${id}/posts/${postId}`, postData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteCommunityPost: (id, postId, token) => api.delete(`/communities/${id}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  togglePinPost: (id, postId, token) => api.post(`/communities/${id}/posts/${postId}/pin`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // User communities
  getUserCommunities: (userId, token) => api.get(`/communities/user/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
};

// Test API connection
export const testAPI = {
  ping: () => api.get('/student/test')
};

export default api;
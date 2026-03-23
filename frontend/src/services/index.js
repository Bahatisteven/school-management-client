import api from './api';

function generateDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export const authService = {
  register: async (data) => {
    // Include the browser's deviceId so the device appears in the admin
    // verification queue immediately after registration
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    const deviceName = navigator.userAgent.split(' ')[0] || 'Unknown Device';

    const response = await api.post('/auth/register', {
      ...data,
      deviceId,
      deviceName,
    });
    return response.data;
  },

  login: async (email, password) => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    const deviceName = navigator.userAgent.split(' ')[0] || 'Unknown Device';

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        deviceId,
        deviceName,
      });

      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (err) {
      // Device-verification responses come back as 403 — surface them as
      // normal return values so the UI can show a helpful info message
      if (err.response?.data?.requiresVerification) {
        return err.response.data;
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const feeService = {
  deposit: async (amount, description, childStudentId = null) => {
    const payload = { amount, description };
    if (childStudentId) payload.childStudentId = childStudentId;
    
    const response = await api.post('/fees/deposit', payload);
    return response.data;
  },

  withdraw: async (amount, description, childStudentId = null) => {
    const payload = { amount, description };
    if (childStudentId) payload.childStudentId = childStudentId;
    
    const response = await api.post('/fees/withdraw', payload);
    return response.data;
  },

  getBalance: async (childStudentId = null) => {
    const url = childStudentId ? `/fees/balance/${childStudentId}` : '/fees/balance';
    const response = await api.get(url);
    return response.data;
  },

  getHistory: async (childStudentId = null) => {
    const url = childStudentId ? `/fees/history/${childStudentId}` : '/fees/history';
    const response = await api.get(url);
    return response.data;
  },
};

export const academicService = {
  getGrades: async (childStudentId = null) => {
    const url = childStudentId ? `/academic/grades/${childStudentId}` : '/academic/grades';
    const response = await api.get(url);
    return response.data;
  },

  getAttendance: async (childStudentId = null, startDate = null, endDate = null) => {
    const url = childStudentId ? `/academic/attendance/${childStudentId}` : '/academic/attendance';
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(url, { params });
    return response.data;
  },

  getTimetable: async (childStudentId = null) => {
    const url = childStudentId ? `/academic/timetable/${childStudentId}` : '/academic/timetable';
    const response = await api.get(url);
    return response.data;
  },
};

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  getChildren: async () => {
    const response = await api.get('/students/children');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/students/profile', data);
    return response.data;
  },
};

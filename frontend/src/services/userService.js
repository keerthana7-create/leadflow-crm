import api from './api';

export const userService = {
  getUsers: async () => {
    const { data } = await api.get('/users');
    return data.data.users;
  },

  getUser: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data.data.user;
  },

  createUser: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data.data.user;
  },

  updateUser: async (id, updates) => {
    const { data } = await api.put(`/users/${id}`, updates);
    return data.data.user;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

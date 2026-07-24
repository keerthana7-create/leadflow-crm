import api from './api';

export const leadService = {
  getLeads: async (params = {}) => {
    const { data } = await api.get('/leads', { params });
    return data; // { data: leads[], pagination }
  },

  getLead: async (id) => {
    const { data } = await api.get(`/leads/${id}`);
    return data.data?.lead || data.data;
  },

  createLead: async (leadData) => {
    const { data } = await api.post('/leads', leadData);
    return data.data?.lead || data.data;
  },

  updateLead: async (id, updates) => {
    const { data } = await api.put(`/leads/${id}`, updates);
    return data.data?.lead || data.data;
  },

  deleteLead: async (id) => {
    const { data } = await api.delete(`/leads/${id}`);
    return data;
  },

  assignLead: async (id, userId) => {
    const { data } = await api.post(`/leads/${id}/assign`, { userId });
    return data.data?.lead || data.data;
  },

  addNote: async (id, text) => {
    const { data } = await api.post(`/leads/${id}/note`, { text, body: text });
    return data.data?.note || data.data;
  },

  getNotes: async (id) => {
    const { data } = await api.get(`/leads/${id}/notes`);
    return data.data?.notes || data.data;
  },

  getActivities: async (id) => {
    const { data } = await api.get(`/leads/${id}/activity`);
    return data.data?.activities || data.data;
  },

  getDashboardStats: async () => {
    const { data } = await api.get('/leads/dashboard');
    return data.data;
  },

  exportCSV: async (params = {}) => {
    const response = await api.get('/leads/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

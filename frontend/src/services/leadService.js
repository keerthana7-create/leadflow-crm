import api from './api';

export const leadService = {
  getLeads: async (params = {}) => {
    const { data } = await api.get('/leads', { params });
    const leadsList = Array.isArray(data.data?.leads)
      ? data.data.leads
      : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    return {
      data: leadsList,
      pagination: {
        page: data.data?.page || 1,
        limit: params.limit || 10,
        total: data.data?.total || leadsList.length,
        pages: data.data?.pages || 1,
      },
    };
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
    // Support both PUT and PATCH
    const { data } = await api.patch(`/leads/${id}`, updates);
    return data.data?.lead || data.data;
  },

  deleteLead: async (id) => {
    const { data } = await api.delete(`/leads/${id}`);
    return data;
  },

  assignLead: async (id, userId) => {
    const { data } = await api.patch(`/leads/${id}`, { assignedTo: userId });
    return data.data?.lead || data.data;
  },

  addNote: async (id, text) => {
    const { data } = await api.post(`/leads/${id}/notes`, { content: text });
    return data.data?.note || data.data;
  },

  getNotes: async (id) => {
    const { data } = await api.get(`/leads/${id}/notes`);
    return data.data?.notes || data.data || [];
  },

  getActivities: async (id) => {
    const { data } = await api.get(`/leads/${id}/activities`);
    return data.data?.activities || data.data || [];
  },

  getDashboardStats: async () => {
    const { data } = await api.get('/leads/dashboard');
    return data.data || data;
  },

  exportCSV: async (params = {}) => {
    const response = await api.get('/leads', { params: { ...params, limit: 1000 } });
    return response.data;
  },
};

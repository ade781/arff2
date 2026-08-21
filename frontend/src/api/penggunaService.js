import axiosInstance from './axiosInstance';

export const penggunaService = {
  async getAllPengguna() {
    const response = await axiosInstance.get('/pengguna');
    return response.data?.data?.pengguna || [];
  },

  async getPenggunaById(id) {
    const response = await axiosInstance.get(`/pengguna/${id}`);
    return response.data?.data?.pengguna;
  },

  async createPengguna(payload) {
    const response = await axiosInstance.post('/pengguna', payload);
    return response.data?.data?.pengguna;
  },

  async updatePengguna(id, payload) {
    const response = await axiosInstance.put(`/pengguna/${id}`, payload);
    return response.data?.data?.pengguna;
  },

  async resetPassword(id, newPassword) {
    const response = await axiosInstance.put(`/pengguna/${id}/reset-password`, { newPassword });
    return response.data;
  },

  async deletePengguna(id) {
    const response = await axiosInstance.delete(`/pengguna/${id}`);
    return response.data;
  },
};

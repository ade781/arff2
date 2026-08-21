import axiosInstance from './axiosInstance';

export const autentikasiService = {
  async login(username, password) {
    const res = await axiosInstance.post('/autentikasi/login', { username, password });
    return res.data.data;
  },

  async getProfile() {
    const res = await axiosInstance.get('/autentikasi/profil');
    return res.data.data;
  },
};

import axiosInstance from './axiosInstance';

export const laporanNonAnggotaService = {
  async getAllLaporan(params = {}) {
    const res = await axiosInstance.get('/laporan-non-anggota', { params });
    return res.data.data.laporan || [];
  },

  async submitAduan(payload, file = null) {
    if (file) {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, v);
        }
      });
      formData.append('foto', file);

      const res = await axiosInstance.post('/laporan-non-anggota', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    }

    const res = await axiosInstance.post('/laporan-non-anggota', payload);
    return res.data.data;
  },
};

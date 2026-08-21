import axiosInstance, { API_BASE_URL } from './axiosInstance';

export const laporanAnggotaService = {
  async getAllLaporan(params = {}) {
    const res = await axiosInstance.get('/laporan-anggota', { params });
    return res.data.data.laporan || res.data.data.inspections || [];
  },

  async submitLaporan(payload, file = null) {
    if (file) {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          formData.append(k, JSON.stringify(v));
        } else if (v !== undefined && v !== null) {
          formData.append(k, v);
        }
      });
      formData.append('foto', file);

      const res = await axiosInstance.post('/laporan-anggota', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data.laporan;
    }

    const res = await axiosInstance.post('/laporan-anggota', payload);
    return res.data.data.laporan;
  },

  async exportCsv(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/laporan-anggota/export/csv?${query}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  async getLaporanById(id) {
    const res = await axiosInstance.get(`/laporan-anggota/${id}`);
    return res.data.data.laporan;
  },
};

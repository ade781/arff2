import axiosInstance from './axiosInstance';

export const itemService = {
  async getAllItems(params = {}) {
    const res = await axiosInstance.get('/item', { params });
    return res.data.data.items || res.data.data.equipment || [];
  },

  async getItemById(id) {
    const res = await axiosInstance.get(`/item/${id}`);
    return res.data.data;
  },

  async getItemByQr(kodeQr) {
    const res = await axiosInstance.get(`/item/qr/${encodeURIComponent(kodeQr)}`);
    return res.data.data;
  },

  async getItemQrCode(id) {
    const res = await axiosInstance.get(`/item/${id}/qr-code`);
    return res.data.data;
  },

  async createItem(payload) {
    const res = await axiosInstance.post('/item', payload);
    return res.data.data.item;
  },

  async updateItem(id, payload) {
    const res = await axiosInstance.put(`/item/${id}`, payload);
    return res.data.data.item;
  },

  async deleteItem(id) {
    const res = await axiosInstance.delete(`/item/${id}`);
    return res.data;
  },
};

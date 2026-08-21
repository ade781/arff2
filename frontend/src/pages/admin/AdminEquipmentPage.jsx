import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ItemForm from '../../components/equipment/ItemForm';
import ItemTable from '../../components/equipment/ItemTable';
import QrModal from '../../components/equipment/QrModal';
import { EMPTY_ITEM_FORM } from '../../constants/itemConstants';
import { itemService } from '../../api/itemService';
import { getErrorMessage } from '../../api/axiosInstance';

export default function AdminEquipmentPage() {
  const { items, loadingItems, loadItems, setNotice } = useOutletContext();
  const navigate = useNavigate();
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  function startEdit(item) {
    setEditingItem(item);
    setItemForm({
      kodeItem: item.kodeItem || item.kodeEquipment || '',
      namaItem: item.namaItem || item.nama || '',
      jenis: item.jenis || item.tipe || 'apar',
      zona: String(item.zona || '1'),
      gedung: item.gedung || '',
      lantai: item.lantai || 'Lantai 1',
      lokasi: item.lokasi || '',
      detailLokasi: item.detailLokasi || '',
      tipeMedia: item.tipeMedia || 'DCP',
      ukuran: item.ukuran || '6.0 Kg',
      tipeHydrant: item.tipeHydrant || 'IHB',
      merk: item.merk || '',
      jumlah: item.jumlah || 1,
      exp: item.exp || '',
      status: item.status || 'aktif',
    });
    setIsFormOpen(true);
  }

  function startAdd() {
    setEditingItem(null);
    setItemForm(EMPTY_ITEM_FORM);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingItem(null);
    setItemForm(EMPTY_ITEM_FORM);
  }

  async function saveItem(event) {
    event.preventDefault();
    setLoadingForm(true);
    setNotice(null);

    try {
      if (editingItem) {
        await itemService.updateItem(editingItem.id, itemForm);
        setNotice({ type: 'success', message: `Equipment ${itemForm.kodeItem} berhasil diperbarui` });
      } else {
        await itemService.createItem(itemForm);
        setNotice({ type: 'success', message: `Equipment baru ${itemForm.kodeItem} berhasil ditambahkan` });
      }
      closeForm();
      await loadItems();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingForm(false);
    }
  }

  async function deleteItem(item) {
    const confirmed = window.confirm(`Hapus equipment ${item.kodeItem || item.kodeEquipment}?`);
    if (!confirmed) return;

    try {
      await itemService.deleteItem(item.id);
      setNotice({ type: 'success', message: 'Equipment berhasil dihapus' });
      await loadItems();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    }
  }

  async function openQr(item) {
    try {
      const data = await itemService.getItemQrCode(item.id);
      setQrData(data);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-4">
      {/* Modal Single QR */}
      <QrModal qrData={qrData} onClose={() => setQrData(null)} />

      {/* Modal Form Tambah / Edit Equipment */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <ItemForm
              form={itemForm}
              onChange={setItemForm}
              onSubmit={saveItem}
              onCancel={closeForm}
              loading={loadingForm}
              editing={Boolean(editingItem)}
            />
          </div>
        </div>
      )}

      {/* Tabel Master Equipment Full Width */}
      <ItemTable
        items={items}
        onEdit={startEdit}
        onDelete={deleteItem}
        onQr={openQr}
        loading={loadingItems}
        onAddNew={startAdd}
        onBatchQr={() => navigate('/admin/template-qr')}
      />
    </div>
  );
}

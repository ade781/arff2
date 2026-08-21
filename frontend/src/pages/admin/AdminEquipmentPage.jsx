import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Printer } from 'lucide-react';
import ItemForm from '../../components/equipment/ItemForm';
import ItemTable from '../../components/equipment/ItemTable';
import QrModal from '../../components/equipment/QrModal';
import BatchQrModal from '../../components/equipment/BatchQrModal';
import { EMPTY_ITEM_FORM } from '../../constants/itemConstants';
import { itemService } from '../../api/itemService';
import { getErrorMessage } from '../../api/axiosInstance';

export default function AdminEquipmentPage() {
  const { items, loadingItems, loadItems, setNotice } = useOutletContext();
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [editingItem, setEditingItem] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [showBatchQr, setShowBatchQr] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  function startEdit(item) {
    setEditingItem(item);
    setItemForm({
      kodeItem: item.kodeItem || item.kodeEquipment || '',
      namaItem: item.namaItem || item.nama || '',
      jenis: item.jenis || item.tipe || 'apar',
      zona: item.zona || 'A',
      lokasi: item.lokasi || '',
      detailLokasi: item.detailLokasi || '',
      exp: item.exp || '',
      status: item.status || 'aktif',
    });
  }

  function resetForm() {
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
        setNotice({ type: 'success', message: 'Equipment berhasil diperbarui' });
      } else {
        await itemService.createItem(itemForm);
        setNotice({ type: 'success', message: 'Equipment baru berhasil ditambahkan' });
      }
      resetForm();
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
      <QrModal qrData={qrData} onClose={() => setQrData(null)} />

      {showBatchQr ? (
        <BatchQrModal items={items} onClose={() => setShowBatchQr(false)} />
      ) : null}

      <div className="flex justify-end no-print">
        <button
          className="h-8 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm"
          type="button"
          onClick={() => setShowBatchQr(true)}
        >
          <Printer size={13} />
          <span>Cetak Lembar QR</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <ItemForm
          form={itemForm}
          onChange={setItemForm}
          onSubmit={saveItem}
          onCancel={resetForm}
          loading={loadingForm}
          editing={Boolean(editingItem)}
        />
        <ItemTable
          items={items}
          onEdit={startEdit}
          onDelete={deleteItem}
          onQr={openQr}
          loading={loadingItems}
          onAddNew={() => resetForm()}
        />
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import {
  Menu,
  Plus,
  Printer,
  RefreshCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { itemService } from '../../api/itemService';
import { laporanAnggotaService } from '../../api/laporanAnggotaService';
import { laporanNonAnggotaService } from '../../api/laporanNonAnggotaService';
import { getErrorMessage } from '../../api/axiosInstance';
import { EMPTY_ITEM_FORM } from '../../constants/itemConstants';
import AdminSidebar from '../../components/layout/AdminSidebar';
import ItemForm from '../../components/equipment/ItemForm';
import ItemTable from '../../components/equipment/ItemTable';
import QrModal from '../../components/equipment/QrModal';
import BatchQrModal from '../../components/equipment/BatchQrModal';
import MonitoringLaporan from '../../components/inspection/MonitoringLaporan';
import NoticeAlert from '../../components/common/NoticeAlert';

export default function AdminDashboardPage() {
  const { session, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [laporanAnggota, setLaporanAnggota] = useState([]);
  const [laporanNonAnggota, setLaporanNonAnggota] = useState([]);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [editingItem, setEditingItem] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [showBatchQr, setShowBatchQr] = useState(false);
  const [filters, setFilters] = useState({ hasilUmum: '', tanggalMulai: '', tanggalSelesai: '' });
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);
  const [notice, setNotice] = useState(null);

  const summary = useMemo(() => {
    const activeCount = items.filter((it) => it.status === 'aktif').length;
    const attentionCount = laporanAnggota.filter((l) => l.status !== 'baik').length + laporanNonAnggota.length;

    return {
      totalItems: items.length,
      activeItems: activeCount,
      totalLaporan: laporanAnggota.length,
      totalAduan: laporanNonAnggota.length,
      needsAttention: attentionCount,
    };
  }, [items, laporanAnggota, laporanNonAnggota]);

  async function loadItems() {
    setLoadingItems(true);
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadMonitoring(nextFilters = filters) {
    setLoadingMonitoring(true);
    try {
      const params = {};
      Object.entries(nextFilters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const [resAnggota, resNonAnggota] = await Promise.allSettled([
        laporanAnggotaService.getAllLaporan(params),
        laporanNonAnggotaService.getAllLaporan(),
      ]);

      if (resAnggota.status === 'fulfilled') {
        setLaporanAnggota(resAnggota.value);
      }
      if (resNonAnggota.status === 'fulfilled') {
        setLaporanNonAnggota(resNonAnggota.value);
      }
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoadingMonitoring(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    
    if (!ignore) {
      loadItems();
    }
    
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    
    if (!ignore) {
      loadMonitoring(filters);
    }
    
    return () => { ignore = true; };
  }, [filters]);

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
    setActiveTab('items');
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

  const pageTitle = {
    dashboard: 'Ringkasan Sistem',
    items: 'Master Data Equipment',
    monitoring: 'Monitoring & Aduan',
  }[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col lg:flex-row">
      <QrModal qrData={qrData} onClose={() => setQrData(null)} />

      {showBatchQr ? (
        <BatchQrModal items={items} onClose={() => setShowBatchQr(false)} />
      ) : null}

      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        session={session}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        itemsCount={items.length}
        laporanCount={laporanAnggota.length}
        aduanCount={laporanNonAnggota.length}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 border rounded text-gray-600"
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu size={16} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-none">{pageTitle}</h2>
              <span className="text-[11px] text-gray-500">Admin ARFF YIA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'items' ? (
              <button
                className="h-8 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                type="button"
                onClick={() => setShowBatchQr(true)}
              >
                <Printer size={13} />
                <span>Cetak Lembar QR</span>
              </button>
            ) : null}

            <button
              className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              type="button"
              onClick={() => {
                loadItems();
                loadMonitoring(filters);
              }}
              title="Refresh Data"
            >
              <RefreshCcw size={13} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 max-w-6xl w-full mx-auto space-y-4">
          <NoticeAlert notice={notice} />

          {/* Tab: Dashboard */}
          {activeTab === 'dashboard' ? (
            <div className="space-y-4">
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card p-3">
                  <p className="text-xs text-gray-500 font-medium">Total Equipment</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{summary.totalItems}</p>
                </div>

                <div className="card p-3">
                  <p className="text-xs text-gray-500 font-medium">Laporan Anggota</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{summary.totalLaporan}</p>
                </div>

                <div className="card p-3">
                  <p className="text-xs text-gray-500 font-medium">Aduan Non-Anggota</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{summary.totalAduan}</p>
                </div>

                <div className="card p-3">
                  <p className="text-xs text-gray-500 font-medium">Perlu Perhatian</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{summary.needsAttention}</p>
                </div>
              </section>

              <div className="flex gap-2">
                <button
                  className="h-8 inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('items');
                  }}
                >
                  <Plus size={13} /> Tambah Equipment
                </button>
                <button
                  className="h-8 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                  type="button"
                  onClick={() => setActiveTab('monitoring')}
                >
                  Lihat Log Monitoring
                </button>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-700 mb-2">Equipment Terbaru</h3>
                <ItemTable
                  items={items.slice(0, 5)}
                  onEdit={startEdit}
                  onDelete={deleteItem}
                  onQr={openQr}
                  loading={loadingItems}
                />
              </div>
            </div>
          ) : null}

          {/* Tab: Master Equipment */}
          {activeTab === 'items' ? (
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
          ) : null}

          {/* Tab: Monitoring & Aduan */}
          {activeTab === 'monitoring' ? (
            <MonitoringLaporan
              laporanAnggota={laporanAnggota}
              laporanNonAnggota={laporanNonAnggota}
              filters={filters}
              onFiltersChange={setFilters}
              onRefresh={() => loadMonitoring(filters)}
              loading={loadingMonitoring}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

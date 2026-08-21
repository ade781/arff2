import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { penggunaService } from '../../api/penggunaService';
import { getErrorMessage } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function AdminPenggunaPage() {
  const { user: currentAdmin } = useAuth();
  const { setNotice } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [resetModalUser, setResetModalUser] = useState(null);

  const [formNama, setFormNama] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('petugas');
  const [formRegu, setFormRegu] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await penggunaService.getAllPengguna();
      setUsers(data);
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const petugasCount = users.filter((u) => u.role === 'petugas').length;
    return {
      total: users.length,
      admin: adminCount,
      petugas: petugasCount,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = !filterRole || u.role === filterRole;
      const matchSearch =
        !searchTerm ||
        u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.regu && u.regu.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchRole && matchSearch;
    });
  }, [users, filterRole, searchTerm]);

  function openCreateModal() {
    setEditingUser(null);
    setFormNama('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('petugas');
    setFormRegu('');
    setFormModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setFormNama(user.nama);
    setFormUsername(user.username);
    setFormPassword('');
    setFormRole(user.role);
    setFormRegu(user.regu || '');
    setFormModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      if (editingUser) {

        await penggunaService.updatePengguna(editingUser.id, {
          nama: formNama,
          username: formUsername,
          role: formRole,
          regu: formRole === 'petugas' ? formRegu : null,
        });
        setNotice({ type: 'success', message: `Data pengguna '${formUsername}' berhasil diperbarui` });
      } else {

        await penggunaService.createPengguna({
          nama: formNama,
          username: formUsername,
          password: formPassword,
          role: formRole,
          regu: formRole === 'petugas' ? formRegu : null,
        });
        setNotice({ type: 'success', message: `Pengguna baru '${formUsername}' berhasil ditambahkan` });
      }

      setFormModalOpen(false);
      await loadUsers();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!resetModalUser) return;
    setResetting(true);
    setNotice(null);

    try {
      await penggunaService.resetPassword(resetModalUser.id, newPassword);
      setNotice({
        type: 'success',
        message: `Password untuk akun '${resetModalUser.username}' berhasil direset`,
      });
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setResetting(false);
    }
  }

  async function handleDeleteUser(user) {
    if (user.id === currentAdmin?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus akun '${user.nama}' (${user.username})?`
    );
    if (!confirmed) return;

    try {
      await penggunaService.deletePengguna(user.id);
      setNotice({ type: 'success', message: `Akun '${user.username}' berhasil dihapus` });
      await loadUsers();
    } catch (err) {
      setNotice({ type: 'error', message: getErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-5">

      <section className="grid gap-3.5 grid-cols-1 sm:grid-cols-3">
        <div className="card p-4 bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Pengguna
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Akun terdaftar di sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users size={22} />
          </div>
        </div>

        <div className="card p-4 bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Administrator
            </p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.admin}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Hak akses penuh sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Shield size={22} />
          </div>
        </div>

        <div className="card p-4 bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Petugas Lapangan
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.petugas}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Akses scan & input inspeksi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck size={22} />
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-4 bg-white border border-gray-200 shadow-xs">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold uppercase text-gray-900 tracking-wide">
              Daftar Pengguna ARFF ({filteredUsers.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola akun login untuk Administrator dan Petugas Pemeriksaan Lapangan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="h-8.5 px-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
              title="Segarkan Data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Segarkan</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="h-8.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-sm transition"
            >
              <Plus size={14} />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>

        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-12 text-xs">
          <div className="relative sm:col-span-8 flex items-center">
            <Search className="absolute left-2.5 text-gray-400 pointer-events-none" size={14} />
            <input
              className="field field-with-icon text-xs h-9 w-full"
              placeholder="Cari nama pengguna, username, regu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:col-span-4">
            <select
              className="field text-xs h-9 cursor-pointer w-full font-medium"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Semua Role (Admin & Petugas)</option>
              <option value="admin">Khusus Administrator</option>
              <option value="petugas">Khusus Petugas Lapangan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Nama & Username</th>
                <th className="px-4 py-3 whitespace-nowrap">Role</th>
                <th className="px-4 py-3 whitespace-nowrap">Unit / Regu</th>
                <th className="px-4 py-3 whitespace-nowrap">Terdaftar Pada</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentAdmin?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {u.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{u.nama}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                  Anda
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] font-mono text-gray-500">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Shield size={11} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCheck size={11} /> Petugas
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-800">{u.unit || 'ARFF YIA'}</p>
                        {u.regu ? (
                          <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            {u.regu}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Semua Regu</span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => openEditModal(u)}
                            title="Edit Data Pengguna"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => {
                              setResetModalUser(u);
                              setNewPassword('');
                            }}
                            title="Reset Password"
                          >
                            <KeyRound size={14} className="text-amber-600" />
                          </button>

                          <button
                            className={`icon-button-danger ${isCurrent ? 'opacity-30 cursor-not-allowed' : ''}`}
                            type="button"
                            disabled={isCurrent}
                            onClick={() => handleDeleteUser(u)}
                            title={isCurrent ? 'Akun aktif tidak bisa dihapus' : 'Hapus Akun'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-xs">
                    {loading ? 'Memuat data pengguna...' : 'Tidak ada data pengguna yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="card w-full max-w-md bg-white rounded-xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {editingUser ? `Edit Pengguna (@${editingUser.username})` : 'Tambah Pengguna Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 rounded-full p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  className="field text-xs h-9"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  className="field text-xs h-9 font-mono"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Contoh: rian_arff"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Password Awal <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="field text-xs h-9"
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Role Hak Akses <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="field text-xs h-9 cursor-pointer font-semibold"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                  >
                    <option value="petugas">Petugas Lapangan</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Regu Operasional
                  </label>
                  <select
                    className="field text-xs h-9 cursor-pointer"
                    value={formRegu}
                    onChange={(e) => setFormRegu(e.target.value)}
                    disabled={formRole === 'admin'}
                  >
                    <option value="">Semua / Fleksibel</option>
                    <option value="Regu Alfa">Regu Alfa</option>
                    <option value="Regu Bravo">Regu Bravo</option>
                    <option value="Regu Charlie">Regu Charlie</option>
                    <option value="Regu Delta">Regu Delta</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="h-8.5 px-3 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-8.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="animate-spin" size={13} /> : null}
                  <span>{editingUser ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="card w-full max-w-sm bg-white rounded-xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <KeyRound size={16} className="text-amber-600" />
                <span>Reset Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-gray-400 hover:text-gray-700 rounded-full p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Ubah password login untuk akun <strong>{resetModalUser.nama}</strong> (@{resetModalUser.username}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  className="field text-xs h-9"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru (min 6 karakter)"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="h-8.5 px-3 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="h-8.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {resetting ? <Loader2 className="animate-spin" size={13} /> : null}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

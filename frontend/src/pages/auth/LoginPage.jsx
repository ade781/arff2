import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Flame, KeyRound, Loader2, LogIn, MessageSquareWarning, ShieldCheck, User } from 'lucide-react';
import { autentikasiService } from '../../api/autentikasiService';
import { getErrorMessage } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage({ onOpenPublicReport }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await autentikasiService.login(username, password);
      login(data);
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/petugas');
      }
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  }

  function handleOpenPublicReport() {
    if (onOpenPublicReport) {
      onOpenPublicReport();
    } else {
      navigate('/aduan');
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 p-7 sm:p-8 relative z-10">
        {/* Header Branding */}
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 shadow-xs mb-1">
            <Flame size={24} className="animate-pulse" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            ARFF YIA
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Airport Rescue and Fire Fighting
          </p>
          <p className="text-[11px] text-slate-400">
            Sistem Digital Inspeksi APAR & Fire Hydrant Bandara
          </p>
        </div>

        {/* Error Alert */}
        {error ? (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 text-slate-400 pointer-events-none" size={15} />
              <input
                className="field field-with-icon text-xs h-10 w-full rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Masukkan username petugas / admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 text-slate-400 pointer-events-none" size={15} />
              <input
                className="field field-with-icon text-xs h-10 w-full rounded-lg"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Masuk ke Sistem</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Public Aduan */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer"
            type="button"
            onClick={handleOpenPublicReport}
          >
            <MessageSquareWarning size={14} className="text-amber-500" />
            <span>Form Aduan Kerusakan Fasilitas (Publik)</span>
          </button>
        </div>
      </div>
    </main>
  );
}

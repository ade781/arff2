import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { autentikasiService } from '../../api/autentikasiService';
import { getErrorMessage } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
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
    navigate('/aduan');
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-6 shadow-xs">

        <div className="mb-6 text-center space-y-1">
          <h1 className="text-lg font-bold text-gray-900">ARFF YIA</h1>
          <p className="text-xs text-gray-500">Sistem Pemeriksaan Fasilitas Bandara</p>
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              className="field text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              className="field text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              required
            />
          </div>

          <button
            className="w-full h-9 rounded bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin inline mr-1" size={14} /> : null}
            Masuk
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <button
            className="text-xs text-gray-600 hover:text-gray-900 underline cursor-pointer"
            type="button"
            onClick={handleOpenPublicReport}
          >
            Form Aduan Kerusakan (Non-Anggota)
          </button>
        </div>
      </div>
    </main>
  );
}

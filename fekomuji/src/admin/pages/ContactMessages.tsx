import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiMail, FiArchive, FiTrash2, FiEye, FiRefreshCw, FiFilter, FiX, FiCheck } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  handled_by?: number | null;
  handled_at?: string | null;
  created_at: string;
}

const API_BASE = 'http://localhost:8000/api';

const ContactMessages: React.FC = () => {
  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [status, setStatus] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [search, setSearch] = useState('');

  const [viewItem, setViewItem] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      params.set('per_page', '20');

      const res = await fetch(`${API_BASE}/admin/contact-messages?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) throw new Error(data?.message || 'Butuh akses admin');
      const rows: ContactMessage[] = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setItems(rows);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const updateMessage = async (id: number, payload: Partial<ContactMessage>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/admin/contact-messages/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Gagal memperbarui pesan');
      setSuccess('Pesan diperbarui');
      fetchMessages();
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui pesan');
    } finally {
      setLoading(false);
    }
  };

  const removeMessage = async (id: number) => {
    if (!confirm('Hapus pesan ini?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal menghapus pesan');
      setSuccess('Pesan dihapus');
      fetchMessages();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus pesan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Pesan Pengguna">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesan Pengguna</h1>
            <p className="text-gray-600 text-sm">Daftar pesan yang dikirim dari halaman Contact.</p>
          </div>
          <button onClick={fetchMessages} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
            <FiRefreshCw /> Muat Ulang
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, subjek, pesan"
              className="pl-9 pr-3 py-2 border rounded-lg w-72"
            />
          </div>
          <button onClick={fetchMessages} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white">
            <FiFilter /> Terapkan
          </button>
          <div className="ml-auto flex items-center gap-2">
            {(['all','new','read','archived'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${status===s?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-700 border-gray-300'}`}
              >
                {s === 'all' ? 'Semua' : s === 'new' ? 'Baru' : s === 'read' ? 'Dibaca' : 'Arsip'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700">{success}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600">
            <div className="col-span-3">Pengirim</div>
            <div className="col-span-3">Subjek</div>
            <div className="col-span-3">Waktu</div>
            <div className="col-span-3 text-right">Aksi</div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Memuat...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">Tidak ada pesan.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((m) => (
                <li key={m.id} className="px-4 py-3 grid md:grid-cols-12 gap-3 items-start">
                  <div className="md:col-span-3">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {m.status === 'new' && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700"><FiMail /> Baru</span>}
                      <span>{m.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{m.email}</div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="text-gray-900">{m.subject}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{m.message}</div>
                  </div>
                  <div className="md:col-span-3 text-sm text-gray-600">
                    {new Date(m.created_at).toLocaleString('id-ID')}
                  </div>
                  <div className="md:col-span-3 flex items-center justify-end gap-2">
                    <button onClick={() => setViewItem(m)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"><FiEye /> Lihat</button>
                    {m.status !== 'read' && (
                      <button onClick={() => updateMessage(m.id, { status: 'read' })} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-green-700 border-green-600 hover:bg-green-50"><FiCheck /> Tandai Dibaca</button>
                    )}
                    {m.status !== 'archived' && (
                      <button onClick={() => updateMessage(m.id, { status: 'archived' })} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-amber-700 border-amber-600 hover:bg-amber-50"><FiArchive /> Arsipkan</button>
                    )}
                    <button onClick={() => removeMessage(m.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-red-700 border-red-600 hover:bg-red-50"><FiTrash2 /> Hapus</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* View Modal */}
        {viewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Detail Pesan</h3>
                <button onClick={() => setViewItem(null)} className="p-1.5 rounded hover:bg-gray-100"><FiX /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="font-medium text-gray-700">Nama:</span> {viewItem.name}</div>
                <div><span className="font-medium text-gray-700">Email:</span> {viewItem.email}</div>
                <div><span className="font-medium text-gray-700">Subjek:</span> {viewItem.subject}</div>
                <div>
                  <span className="font-medium text-gray-700">Pesan:</span>
                  <p className="mt-1 whitespace-pre-line text-gray-900">{viewItem.message}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                {viewItem.status !== 'read' && (
                  <button onClick={() => { setViewItem(null); updateMessage(viewItem.id, { status: 'read' }); }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-green-700 border-green-600 hover:bg-green-50"><FiCheck /> Tandai Dibaca</button>
                )}
                {viewItem.status !== 'archived' && (
                  <button onClick={() => { setViewItem(null); updateMessage(viewItem.id, { status: 'archived' }); }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-amber-700 border-amber-600 hover:bg-amber-50"><FiArchive /> Arsipkan</button>
                )}
                <button onClick={() => setViewItem(null)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700"><FiX /> Tutup</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactMessages;

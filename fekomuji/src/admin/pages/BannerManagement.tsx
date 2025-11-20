import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiTrash2, FiEdit, FiSave, FiX, FiImage, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  bg_color?: string | null;
  image_path?: string | null;
  is_active?: boolean;
  order?: number;
  created_at?: string;
};

const API_BASE = 'http://localhost:8000/api';
const STORAGE_BASE = 'http://localhost:8000/storage';

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedActive, setSelectedActive] = useState<string[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<{ title: string; subtitle: string; bg_color: string; image: File | null }>({
    title: '',
    subtitle: '',
    bg_color: '',
    image: null,
  });
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [addMeta, setAddMeta] = useState<{ width: number; height: number; sizeKB: number } | null>(null);
  const [autoActivate, setAutoActivate] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<Record<string, { w: number; h: number }>>({});
  const [editForm, setEditForm] = useState<{ title: string; subtitle: string; bg_color: string; image: File | null }>({
    title: '',
    subtitle: '',
    bg_color: '',
    image: null,
  });

  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/banners`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        throw new Error(data?.message || 'Butuh login admin untuk mengakses banner');
      }
      const list: Banner[] = Array.isArray(data.data) ? data.data : [];
      setBanners(list);
      setSelectedActive(list.filter((b) => b.is_active).map((b) => b.id));
    } catch (e) {
      setError('Gagal memuat daftar banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = (id: string) => {
    const isSelected = selectedActive.includes(id);
    if (isSelected) {
      setSelectedActive((prev) => prev.filter((x) => x !== id));
    } else {
      if (selectedActive.length >= 3) return; // limit 3
      setSelectedActive((prev) => [...prev, id]);
    }
  };

  const activateIds = async (ids: string[]) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/admin/banners/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        throw new Error(data?.message || 'Butuh login admin untuk menyimpan banner aktif');
      }
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan banner aktif');
      setSuccess('Banner aktif berhasil disimpan');
      setSelectedActive(ids);
      fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan banner aktif');
    } finally {
      setLoading(false);
    }
  };

  const saveActive = async () => {
    if (selectedActive.length > 3) {
      setError('Maksimal 3 banner aktif. Kurangi pilihan.');
      return;
    }
    await activateIds(selectedActive);
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title || !addForm.image) {
      setError('Isi judul dan pilih gambar');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append('title', addForm.title);
      if (addForm.subtitle) fd.append('subtitle', addForm.subtitle);
      if (addForm.bg_color) fd.append('bg_color', addForm.bg_color);
      fd.append('image', addForm.image);

      const res = await fetch(`${API_BASE}/admin/banners`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        throw new Error(data?.message || 'Butuh login admin untuk membuat banner');
      }
      if (!res.ok) throw new Error(data.message || 'Gagal membuat banner');
      const created: Banner | undefined = data?.data;
      setSuccess('Banner berhasil dibuat');
      setIsAdding(false);
      setAddForm({ title: '', subtitle: '', bg_color: '', image: null });
      setAddPreview(null);
      setAddMeta(null);
      if (autoActivate && created?.id) {
        if (selectedActive.length >= 3) {
          setSuccess('Banner berhasil dibuat. Slot aktif penuh (3). Nonaktifkan salah satu untuk mengaktifkan banner ini.');
        } else {
          await activateIds([...selectedActive, created.id]);
        }
      }
      fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Gagal membuat banner');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageChange = (file: File | null) => {
    setAddForm((p) => ({ ...p, image: file }));
    // Revoke previous URL if exists
    if (addPreview) {
      try { URL.revokeObjectURL(addPreview); } catch {}
    }
    setAddPreview(null);
    setAddMeta(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setAddPreview(url);
      setAddMeta({ width: img.naturalWidth, height: img.naturalHeight, sizeKB: Math.round(file.size / 1024) });
    };
    img.src = url;
  };

  // Cleanup on modal close
  useEffect(() => {
    if (!isAdding && addPreview) {
      try { URL.revokeObjectURL(addPreview); } catch {}
      setAddPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdding]);

  const startEdit = (b: Banner) => {
    setEditingId(b.id);
    setEditForm({ title: b.title || '', subtitle: b.subtitle || '', bg_color: b.bg_color || '', image: null });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', subtitle: '', bg_color: '', image: null });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      if (editForm.title) fd.append('title', editForm.title);
      fd.append('subtitle', editForm.subtitle || '');
      fd.append('bg_color', editForm.bg_color || '');
      if (editForm.image) fd.append('image', editForm.image);

      const res = await fetch(`${API_BASE}/admin/banners/${editingId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        throw new Error(data?.message || 'Butuh login admin untuk memperbarui banner');
      }
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui banner');
      setSuccess('Banner berhasil diperbarui');
      cancelEdit();
      fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui banner');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        throw new Error(data?.message || 'Butuh login admin untuk menghapus banner');
      }
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus banner');
      setSuccess('Banner dihapus');
      setSelectedActive((prev) => prev.filter((x) => x !== id));
      fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Kelola Banner">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Banner</h1>
            <p className="text-gray-600 text-sm">Tambah, ubah, hapus, dan pilih maksimal 3 banner aktif untuk halaman Events.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
            onClick={() => setIsAdding(true)}
          >
            <FiPlus /> Tambah Banner
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
            <FiAlertTriangle /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2">
            <FiCheckCircle /> <span>{success}</span>
          </div>
        )}

        {/* Active selection toolbar */}
        <div className="mb-6 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-sm text-gray-700">
            Dipilih aktif: <span className="font-semibold">{selectedActive.length}</span> / 3
          </div>
          <button
            onClick={saveActive}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm"
          >
            <FiSave /> Simpan Banner Aktif
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiImage className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada banner</h3>
            <p className="text-gray-600 mt-1 mb-6">Tambahkan banner pertama kamu agar tampil di halaman Events.</p>
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <FiPlus /> Tambah Banner
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => {
            const imgUrl = b.image_path ? `${STORAGE_BASE}/${b.image_path}` : '';
            const active = selectedActive.includes(b.id);
            return (
              <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        const w = (e.currentTarget as HTMLImageElement).naturalWidth;
                        const h = (e.currentTarget as HTMLImageElement).naturalHeight;
                        setImgDims((prev) => ({ ...prev, [b.id]: { w, h } }));
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 flex items-center gap-2"><FiImage /> Tidak ada gambar</div>
                  )}
                  {imgDims[b.id] && (
                    <div className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded-md">
                      {imgDims[b.id].w}×{imgDims[b.id].h}px
                    </div>
                  )}
                  <button
                    onClick={() => toggleActive(b.id)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'} ${selectedActive.length >= 3 && !active ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedActive.length >= 3 && !active}
                  >
                    {active ? 'Aktif' : 'Pilih Aktif'}
                  </button>
                  {active && (
                    <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">AKTIF</span>
                  )}
                </div>
                <div className="p-4">
                  {editingId === b.id ? (
                    <form onSubmit={submitEdit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Judul"
                        value={editForm.title}
                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Subjudul"
                        value={editForm.subtitle}
                        onChange={(e) => setEditForm((p) => ({ ...p, subtitle: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Warna latar (opsional, contoh: #1e40af)"
                        value={editForm.bg_color}
                        onChange={(e) => setEditForm((p) => ({ ...p, bg_color: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
                        className="w-full"
                      />
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700">
                          <FiX /> Batal
                        </button>
                        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white">
                          <FiSave /> Simpan
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
                      {b.subtitle && <p className="text-gray-600 text-sm">{b.subtitle}</p>}
                      <div className="mt-4 flex items-center justify-between">
                        <button onClick={() => startEdit(b)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">
                          <FiEdit /> Edit
                        </button>
                        <button onClick={() => remove(b.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-600 text-red-700 hover:bg-red-50">
                          <FiTrash2 /> Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Add Form Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tambah Banner</h2>
                <button onClick={() => setIsAdding(false)} className="p-1.5 rounded hover:bg-gray-100">
                  <FiX />
                </button>
              </div>
              <form onSubmit={submitAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
                  <input
                    type="text"
                    value={addForm.subtitle}
                    onChange={(e) => setAddForm((p) => ({ ...p, subtitle: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna latar (opsional)</label>
                  <input
                    type="text"
                    placeholder="#1e40af atau bg-blue-600"
                    value={addForm.bg_color}
                    onChange={(e) => setAddForm((p) => ({ ...p, bg_color: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                  {addPreview ? (
                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200">
                      <div className="relative h-40 bg-gray-100">
                        <img src={addPreview} alt="Preview" className="w-full h-full object-cover" />
                        {addMeta && (
                          <div className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded-md">
                            {addMeta.width}×{addMeta.height}px • {addMeta.sizeKB} KB
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiImage /> <span>Pilih atau seret gambar ke sini</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAddImageChange(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-600">
                    Direkomendasikan: <span className="font-semibold">1600×600px</span> (rasio 8:3). Maks 4MB. Format: JPG/PNG/WebP.
                  </p>
                  {addMeta && (() => {
                    const ratio = addMeta.width / addMeta.height;
                    const rec = 1600 / 600;
                    const diff = Math.abs(ratio - rec) / rec;
                    const small = addMeta.width < 1200 || addMeta.height < 400;
                    if (small || diff > 0.15) {
                      return (
                        <p className="mt-1 text-xs text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded">
                          Rasio/ukuran kurang ideal, gambar bisa terpotong di hero. Pertimbangkan 1600×600px.
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={autoActivate} onChange={(e) => setAutoActivate(e.target.checked)} />
                    Aktifkan setelah simpan (maks 3)
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700">
                      <FiX /> Batal
                    </button>
                    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white">
                      <FiSave /> {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BannerManagement;

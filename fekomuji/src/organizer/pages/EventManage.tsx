import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiDownload, FiCheckCircle, FiXCircle, FiMail, FiCalendar, FiArrowLeft, FiSearch, FiCreditCard, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface Participant {
  id: number;
  user: { id: number; name: string; email: string; };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface TicketCategory {
  id: number;
  nama_kategori: string;
  harga: number;
  kuota: number;
  terjual: number;
  deskripsi?: string;
  is_active: boolean;
}

interface Event {
  id: number;
  judul: string;
  tanggal_mulai: string;
  lokasi: string;
  kuota: number;
  terdaftar?: number;
}

const EventManage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'peserta' | 'tiket'>('peserta');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketCategory | null>(null);
  const [ticketForm, setTicketForm] = useState({
    nama_kategori: '', harga: '', kuota: '', deskripsi: '', is_active: true
  });

  const fetchEventDetails = React.useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data.data || data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [id]);

  const fetchParticipants = React.useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${id}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Participants data:', data);
        // Handle berbagai format response
        const participantsData = Array.isArray(data) ? data :
                                Array.isArray(data.data) ? data.data :
                                Array.isArray(data.registrations) ? data.registrations : [];
        setParticipants(participantsData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [id]);

  const fetchTicketCategories = React.useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${id}/ticket-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTicketCategories(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
    fetchTicketCategories();
  }, [fetchEventDetails, fetchParticipants, fetchTicketCategories]);

  const handleApprove = async (participantId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/registrations/${participantId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchParticipants();
        alert('Peserta berhasil disetujui!');
      }
    } catch (error) {
      alert('Gagal menyetujui peserta');
    }
  };

  const handleReject = async (participantId: number) => {
    if (!confirm('Yakin ingin menolak peserta ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/registrations/${participantId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchParticipants();
        alert('Peserta berhasil ditolak!');
      }
    } catch (error) {
      alert('Gagal menolak peserta');
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) return alert('Tidak ada data');
    let csv = 'data:text/csv;charset=utf-8,';
    csv += `Peserta - ${event?.judul}\n\n`;
    csv += 'No,Nama,Email,Status,Tanggal\n';
    filteredParticipants.forEach((p, i) => {
      const status = p.status === 'approved' ? 'Disetujui' : p.status === 'rejected' ? 'Ditolak' : 'Pending';
      csv += `${i + 1},"${p?.user?.name || 'N/A'}","${p?.user?.email || 'N/A'}",${status},${new Date(p.created_at).toLocaleDateString('id-ID')}\n`;
    });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Peserta_${event?.judul?.replace(/\s+/g, '_') || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingTicket
        ? `http://localhost:8000/api/events/${id}/ticket-categories/${editingTicket.id}`
        : `http://localhost:8000/api/events/${id}/ticket-categories`;
      const response = await fetch(url, {
        method: editingTicket ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticketForm,
          harga: parseFloat(ticketForm.harga),
          kuota: parseInt(ticketForm.kuota)
        })
      });
      if (response.ok) {
        fetchTicketCategories();
        handleCloseTicketModal();
        alert('Kategori tiket berhasil disimpan!');
      }
    } catch (error) {
      alert('Gagal menyimpan kategori tiket');
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm('Yakin hapus kategori ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/events/${id}/ticket-categories/${ticketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTicketCategories();
      alert('Kategori tiket berhasil dihapus!');
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleEditTicket = (ticket: TicketCategory) => {
    setEditingTicket(ticket);
    setTicketForm({
      nama_kategori: ticket.nama_kategori,
      harga: ticket.harga.toString(),
      kuota: ticket.kuota.toString(),
      deskripsi: ticket.deskripsi || '',
      is_active: ticket.is_active
    });
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setEditingTicket(null);
    setTicketForm({ nama_kategori: '', harga: '', kuota: '', deskripsi: '', is_active: true });
  };

  const filteredParticipants = participants.filter(p => {
    const matchSearch = p?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <OrganizerLayout title={`Kelola - ${event?.judul || 'Event'}`}>
      <div className="mb-6">
        <button onClick={() => navigate('/organizer/events-card')} className="flex items-center gap-2 text-gray-600 hover:opacity-70 mb-4">
          <FiArrowLeft className="w-5 h-5" />Kembali
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#004aad' }}>{event?.judul}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
              <div className="flex items-center gap-2"><FiCalendar className="w-4 h-4" />{event && formatDate(event.tanggal_mulai)}</div>
              <div className="flex items-center gap-2"><FiUsers className="w-4 h-4" />{event?.terdaftar || 0} / {event?.kuota}</div>
            </div>
          </div>
          {activeTab === 'peserta' && (
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 shadow-lg" style={{ backgroundColor: '#5eed9c' }}>
              <FiDownload className="w-5 h-5" />Export
            </button>
          )}
          {activeTab === 'tiket' && (
            <button onClick={() => setShowTicketModal(true)} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 shadow-lg" style={{ backgroundColor: '#004aad' }}>
              <FiPlus className="w-5 h-5" />Tambah Kategori
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('peserta')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'peserta' ? 'border-current' : 'border-transparent text-gray-500'}`} style={activeTab === 'peserta' ? { color: '#004aad' } : {}}>
            <FiUsers className="w-5 h-5" />Peserta
          </button>
          <button onClick={() => setActiveTab('tiket')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'tiket' ? 'border-current' : 'border-transparent text-gray-500'}`} style={activeTab === 'tiket' ? { color: '#5eed9c' } : {}}>
            <FiCreditCard className="w-5 h-5" />Kategori Tiket
          </button>
        </div>
      </div>

      {activeTab === 'peserta' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border-2" style={{ borderColor: '#004aad' }}>
              <div className="flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-medium">Total</p><p className="text-3xl font-bold mt-2" style={{ color: '#004aad' }}>{participants.length}</p></div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#004aad20' }}><FiUsers className="w-6 h-6" style={{ color: '#004aad' }} /></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border-2" style={{ borderColor: '#5eed9c' }}>
              <div className="flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-medium">Disetujui</p><p className="text-3xl font-bold mt-2" style={{ color: '#5eed9c' }}>{participants.filter(p => p.status === 'approved').length}</p></div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5eed9c20' }}><FiCheckCircle className="w-6 h-6" style={{ color: '#5eed9c' }} /></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-medium">Pending</p><p className="text-3xl font-bold mt-2 text-gray-600">{participants.filter(p => p.status === 'pending').length}</p></div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100"><FiCalendar className="w-6 h-6 text-gray-600" /></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-medium">Ditolak</p><p className="text-3xl font-bold mt-2 text-red-600">{participants.filter(p => p.status === 'rejected').length}</p></div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50"><FiXCircle className="w-6 h-6 text-red-600" /></div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2">
              <option value="all">Semua Status</option>
              <option value="approved">Disetujui</option>
              <option value="pending">Pending</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Peserta</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredParticipants.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}>
                            {p?.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4"><div className="text-sm font-medium text-gray-900">{p?.user?.name || 'N/A'}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="flex items-center text-sm text-gray-600"><FiMail className="w-4 h-4 mr-2" />{p?.user?.email || 'N/A'}</div></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status === 'approved' ? 'Disetujui' : p.status === 'rejected' ? 'Ditolak' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(p.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        {p.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleApprove(p.id)} className="p-2 hover:bg-green-50 rounded-lg" style={{ color: '#5eed9c' }}><FiCheckCircle className="w-5 h-5" /></button>
                            <button onClick={() => handleReject(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiXCircle className="w-5 h-5" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredParticipants.length === 0 && (
                <div className="text-center py-12"><FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Belum ada peserta</p></div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'tiket' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ticketCategories.map((ticket) => (
            <div key={ticket.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.nama_kategori}</h3>
                  <p className="text-2xl font-bold mb-2" style={{ color: '#004aad' }}>{formatCurrency(ticket.harga)}</p>
                  {ticket.deskripsi && <p className="text-sm text-gray-600 mb-3">{ticket.deskripsi}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ticket.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="mb-4 p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Terjual</span>
                  <span className="font-bold" style={{ color: '#004aad' }}>{ticket.terjual} / {ticket.kuota}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min((ticket.terjual / ticket.kuota) * 100, 100)}%`, background: 'linear-gradient(90deg, #004aad 0%, #5eed9c 100%)' }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditTicket(ticket)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl hover:opacity-90 font-medium" style={{ backgroundColor: '#004aad' }}>
                  <FiEdit className="w-4 h-4" />Edit
                </button>
                <button onClick={() => handleDeleteTicket(ticket.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200"><FiTrash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
          {ticketCategories.length === 0 && (
            <div className="col-span-full text-center py-16">
              <FiCreditCard className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Kategori Tiket</h3>
              <p className="text-gray-500 mb-6">Buat kategori tiket untuk event ini</p>
              <button onClick={() => setShowTicketModal(true)} className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90" style={{ backgroundColor: '#004aad' }}>
                <FiPlus className="w-5 h-5" />Tambah Kategori
              </button>
            </div>
          )}
        </div>
      )}

      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#004aad' }}>{editingTicket ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <form onSubmit={handleSaveTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori *</label>
                <input type="text" value={ticketForm.nama_kategori} onChange={(e) => setTicketForm({ ...ticketForm, nama_kategori: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2" placeholder="VIP, Regular, dll" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harga *</label>
                <input type="number" value={ticketForm.harga} onChange={(e) => setTicketForm({ ...ticketForm, harga: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2" placeholder="50000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kuota *</label>
                <input type="number" value={ticketForm.kuota} onChange={(e) => setTicketForm({ ...ticketForm, kuota: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2" placeholder="100" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea value={ticketForm.deskripsi} onChange={(e) => setTicketForm({ ...ticketForm, deskripsi: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 resize-none" rows={3} placeholder="Deskripsi kategori..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={ticketForm.is_active} onChange={(e) => setTicketForm({ ...ticketForm, is_active: e.target.checked })} className="w-5 h-5 rounded" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Aktifkan kategori ini</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseTicketModal} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 text-white rounded-xl hover:opacity-90 font-medium shadow-lg" style={{ backgroundColor: '#004aad' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default EventManage;

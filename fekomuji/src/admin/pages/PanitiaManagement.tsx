import React, { useState, useEffect } from 'react';
import { FiUsers, FiCheck, FiX, FiPause, FiEye, FiFilter, FiDownload, FiSearch } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface Panitia {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  plan_type: 'trial' | 'premium' | 'free';
  created_at: string;
  approved_at?: string;
  trial_end?: string;
  premium_end?: string;
  total_events: number;
  total_revenue: number;
}

const PanitiaManagement: React.FC = () => {
  const [panitias, setPanitias] = useState<Panitia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPanitia, setSelectedPanitia] = useState<Panitia | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'view'>('view');
  const [planType, setPlanType] = useState<'trial' | 'premium'>('trial');
  const [premiumDuration, setPremiumDuration] = useState(1);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPanitias();
  }, []);

  const fetchPanitias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/panitias-management', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPanitias(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching panitias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (panitia: Panitia, action: 'approve' | 'reject' | 'suspend') => {
    setSelectedPanitia(panitia);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedPanitia) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = `http://localhost:8000/api/admin/panitias/${selectedPanitia.id}/${actionType}`;
      
      let body = {};
      if (actionType === 'approve') {
        body = { plan_type: planType, premium_duration: premiumDuration };
      } else if (actionType === 'reject') {
        body = { reason: rejectionReason };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowModal(false);
        fetchPanitias();
        // Reset form
        setPlanType('trial');
        setPremiumDuration(1);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const filteredPanitias = panitias.filter(panitia => {
    const matchesFilter = filter === 'all' || panitia.status === filter;
    const matchesSearch = panitia.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         panitia.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         panitia.organization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPlanBadge = (planType: string) => {
    const colors = {
      trial: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      free: 'bg-gray-100 text-gray-800'
    };
    return colors[planType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Panitia</h1>
            <p className="text-gray-600">Kelola pendaftaran dan status panitia event</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {panitias.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {panitias.filter(p => p.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {panitias.filter(p => p.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiPause className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {panitias.filter(p => p.status === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari panitia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panitia Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Panitia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredPanitias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data panitia
                    </td>
                  </tr>
                ) : (
                  filteredPanitias.map((panitia) => (
                    <tr key={panitia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{panitia.name}</div>
                          <div className="text-sm text-gray-500">{panitia.email}</div>
                          <div className="text-sm text-gray-500">{panitia.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{panitia.organization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(panitia.status)}`}>
                          {panitia.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadge(panitia.plan_type)}`}>
                          {panitia.plan_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {panitia.total_events}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {panitia.total_revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPanitia(panitia);
                            setActionType('view');
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {panitia.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(panitia, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(panitia, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {panitia.status === 'approved' && (
                          <button
                            onClick={() => handleAction(panitia, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <FiPause className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedPanitia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'view' && 'Detail Panitia'}
                {actionType === 'approve' && 'Setujui Panitia'}
                {actionType === 'reject' && 'Tolak Panitia'}
                {actionType === 'suspend' && 'Suspend Panitia'}
              </h3>

              {actionType === 'view' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama</label>
                    <p className="text-sm text-gray-900">{selectedPanitia.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedPanitia.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organisasi</label>
                    <p className="text-sm text-gray-900">{selectedPanitia.organization}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedPanitia.status)}`}>
                      {selectedPanitia.status}
                    </span>
                  </div>
                </div>
              )}

              {actionType === 'approve' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Plan *
                    </label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value as 'trial' | 'premium')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="trial">Trial (60 hari gratis)</option>
                      <option value="premium">Premium (berbayar)</option>
                    </select>
                  </div>
                  
                  {planType === 'premium' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durasi Premium (bulan) *
                      </label>
                      <select
                        value={premiumDuration}
                        onChange={(e) => setPremiumDuration(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 bulan</option>
                        <option value={3}>3 bulan</option>
                        <option value={6}>6 bulan</option>
                        <option value={12}>12 bulan</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan alasan penolakan..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                {actionType !== 'view' && (
                  <button
                    onClick={confirmAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Konfirmasi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PanitiaManagement;

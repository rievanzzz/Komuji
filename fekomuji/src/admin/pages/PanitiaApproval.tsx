import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiClock, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface PanitiaRequest {
  id: number;
  name: string;
  email: string;
  organization_name: string;
  organization_description: string;
  phone: string;
  address: string;
  website: string;
  created_at: string;
  days_waiting: number;
}

const PanitiaApproval: React.FC = () => {
  const [requests, setRequests] = useState<PanitiaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PanitiaRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [planType, setPlanType] = useState<'trial' | 'premium'>('trial');
  const [premiumDuration, setPremiumDuration] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/panitias/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request: PanitiaRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowModal(true);
    setRejectionReason('');
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const endpoint = actionType === 'approve' 
        ? `http://localhost:8000/api/admin/panitias/${selectedRequest.id}/approve`
        : `http://localhost:8000/api/admin/panitias/${selectedRequest.id}/reject`;

      const body = actionType === 'reject' 
        ? { reason: rejectionReason } 
        : { plan_type: planType, premium_duration: premiumDuration };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Remove the processed request from the list
        setRequests(requests.filter(r => r.id !== selectedRequest.id));
        setShowModal(false);
        setSelectedRequest(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Persetujuan Panitia">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Persetujuan Panitia">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Persetujuan Panitia</h1>
          <p className="text-gray-600 mt-2">Kelola permintaan upgrade ke panitia</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disetujui Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ditolak Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Permintaan Pending</h2>
          </div>
          
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <FiCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada permintaan pending</h3>
              <p className="text-gray-600">Semua permintaan upgrade panitia sudah diproses.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                          <p className="text-sm text-gray-600">{request.organization_name}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          <FiClock className="w-4 h-4" />
                          {request.days_waiting} hari menunggu
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail className="w-4 h-4" />
                          {request.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="w-4 h-4" />
                          {request.phone || 'Tidak ada'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(request.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {request.organization_description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-6">
                      <button
                        onClick={() => handleAction(request, 'approve')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                        Setujui
                      </button>
                      <button
                        onClick={() => handleAction(request, 'reject')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Setujui Permintaan' : 'Tolak Permintaan'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Nama:</strong> {selectedRequest.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Organisasi:</strong> {selectedRequest.organization_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedRequest.email}
                </p>
              </div>

              {actionType === 'approve' && (
                <div className="mb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Plan *
                    </label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value as 'trial' | 'premium')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Masukkan alasan penolakan..."
                    required
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={confirmAction}
                  disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    actionType === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                      : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                  }`}
                >
                  {processing ? 'Memproses...' : (actionType === 'approve' ? 'Setujui' : 'Tolak')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PanitiaApproval;

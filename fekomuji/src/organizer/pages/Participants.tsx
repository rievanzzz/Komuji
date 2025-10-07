import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiSearch, FiUser, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface Participant {
  id: string;
  user_id: string;
  event_id: string;
  name: string;
  email: string;
  event_name: string;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  check_in_status: 'not_checked' | 'checked_in';
  kode_pendaftaran: string;
}

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/participants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      } else {
        // Mock data for development
        setParticipants([
          {
            id: '1',
            user_id: '101',
            event_id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            event_name: 'Tech Conference 2024',
            registration_date: '2024-01-15T10:30:00Z',
            status: 'approved',
            payment_status: 'paid',
            check_in_status: 'checked_in',
            kode_pendaftaran: 'TC2024001'
          },
          {
            id: '2',
            user_id: '102',
            event_id: '1',
            name: 'Jane Smith',
            email: 'jane@example.com',
            event_name: 'Tech Conference 2024',
            registration_date: '2024-01-14T14:20:00Z',
            status: 'approved',
            payment_status: 'paid',
            check_in_status: 'not_checked',
            kode_pendaftaran: 'TC2024002'
          },
          {
            id: '3',
            user_id: '103',
            event_id: '2',
            name: 'Bob Wilson',
            email: 'bob@example.com',
            event_name: 'Workshop Design',
            registration_date: '2024-01-13T09:15:00Z',
            status: 'pending',
            payment_status: 'unpaid',
            check_in_status: 'not_checked',
            kode_pendaftaran: 'WD2024001'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  const handleUpdateStatus = async (participantId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/participants/${participantId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchParticipants(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || participant.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="text-green-600" size={16} />;
      case 'rejected': return <FiXCircle className="text-red-600" size={16} />;
      default: return <FiClock className="text-yellow-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Participants">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Participants">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Event Participants</h2>
          <p className="text-gray-600">Manage registrations and participant data</p>
        </div>
        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload size={20} />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <FiFilter className="mr-2" size={16} />
            {filteredParticipants.length} of {participants.length} participants
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Participant</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Event</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Registration Code</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Registration Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Payment</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Check-in</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{participant.name}</p>
                        <p className="text-sm text-gray-600">{participant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">{participant.event_name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-mono text-gray-900">{participant.kode_pendaftaran}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {new Date(participant.registration_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(participant.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}>
                        {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(participant.payment_status)}`}>
                      {participant.payment_status.charAt(0).toUpperCase() + participant.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      participant.check_in_status === 'checked_in' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {participant.check_in_status === 'checked_in' ? 'Checked In' : 'Not Checked'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {participant.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(participant.id, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(participant.id, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
            <p className="text-gray-600">No participants match your current filters.</p>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};

export default Participants;

import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiSearch, FiUser, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface Event {
  id: number;
  kategori_id?: number;
  harga_tiket?: number;
  created_by?: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path?: string;
  sertifikat_template_path?: string;
  is_published?: boolean;
  approval_type?: 'auto' | 'manual';
  kuota: number;
  terdaftar?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

interface Participant {
  id: string;
  user_id: string;
  event_id: string;
  name: string;
  email: string;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  check_in_status: 'not_checked' | 'checked_in';
  kode_pendaftaran: string;
}

const ParticipantsNew: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [updatingParticipant, setUpdatingParticipant] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/events?organizer=true&per_page=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and direct array response
        const eventsArray = data.data || data;
        setEvents(Array.isArray(eventsArray) ? eventsArray : []);
      } else {
        // Mock data for development
        setEvents([
          {
            id: 1,
            judul: "Workshop React Advanced",
            deskripsi: "Workshop mendalam tentang React.js untuk developer berpengalaman",
            is_published: true,
            terdaftar: 45,
            kuota: 50,
            harga_tiket: 150000,
            tanggal_mulai: "2024-02-15",
            waktu_mulai: "09:00",
            waktu_selesai: "17:00",
            lokasi: "Auditorium Utama"
          },
          {
            id: 2,
            judul: "Seminar Digital Marketing",
            deskripsi: "Strategi pemasaran digital terkini untuk bisnis modern",
            is_published: true,
            terdaftar: 78,
            kuota: 100,
            harga_tiket: 75000,
            tanggal_mulai: "2024-02-20",
            waktu_mulai: "13:00",
            waktu_selesai: "16:00",
            lokasi: "Ruang Seminar A"
          },
          {
            id: 3,
            judul: "Training UI/UX Design",
            deskripsi: "Pelatihan desain UI/UX untuk pemula",
            is_published: false,
            terdaftar: 23,
            kuota: 30,
            harga_tiket: 200000,
            tanggal_mulai: "2024-02-25",
            waktu_mulai: "10:00",
            waktu_selesai: "15:00",
            lokasi: "Lab Komputer"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: number) => {
    try {
      setParticipantsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Participants data received:', data);
        
        // Transform API response to match our interface
        const transformedParticipants = (data.data || []).map((reg: any, index: number) => ({
          id: reg.id?.toString() || index.toString(),
          user_id: reg.user_id?.toString() || '',
          event_id: eventId.toString(),
          name: reg.user_name || 'Unknown',
          email: reg.user_email || '',
          registration_date: reg.waktu_daftar || new Date().toISOString(),
          status: reg.status || 'pending',
          payment_status: 'paid', // Default since API doesn't provide this
          check_in_status: reg.kehadiran?.status === 'Hadir' ? 'checked_in' : 'not_checked',
          kode_pendaftaran: `EV${eventId}${String(index + 1).padStart(3, '0')}`
        }));
        
        setParticipants(transformedParticipants);
      } else {
        // Mock data for development
        setParticipants([
          {
            id: '1',
            user_id: '101',
            event_id: eventId.toString(),
            name: 'John Doe',
            email: 'john@example.com',
            registration_date: '2024-01-15T10:30:00Z',
            status: 'approved',
            payment_status: 'paid',
            check_in_status: 'checked_in',
            kode_pendaftaran: `EV${eventId}001`
          },
          {
            id: '2',
            user_id: '102',
            event_id: eventId.toString(),
            name: 'Jane Smith',
            email: 'jane@example.com',
            registration_date: '2024-01-14T14:20:00Z',
            status: 'approved',
            payment_status: 'paid',
            check_in_status: 'not_checked',
            kode_pendaftaran: `EV${eventId}002`
          },
          {
            id: '3',
            user_id: '103',
            event_id: eventId.toString(),
            name: 'Bob Wilson',
            email: 'bob@example.com',
            registration_date: '2024-01-13T09:15:00Z',
            status: 'pending',
            payment_status: 'unpaid',
            check_in_status: 'not_checked',
            kode_pendaftaran: `EV${eventId}003`
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    fetchParticipants(event.id);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setParticipants([]);
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  const handleUpdateStatus = async (participantId: string, newStatus: string) => {
    try {
      setUpdatingParticipant(participantId);
      const token = localStorage.getItem('token');
      const endpoint = newStatus === 'approved' 
        ? `http://localhost:8000/api/registrations/${participantId}/approve`
        : `http://localhost:8000/api/registrations/${participantId}/reject`;
        
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('status', newStatus);
      if (newStatus === 'rejected') {
        formData.append('alasan_ditolak', 'Ditolak oleh panitia');
      }
      
      const response = await fetch(endpoint, {
        method: 'POST', // Laravel expects POST with _method: PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || `Participant ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
        if (selectedEvent) {
          fetchParticipants(selectedEvent.id);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update status' }));
        alert('Error: ' + (errorData.message || 'Failed to update participant status'));
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      alert('Error updating participant status');
    } finally {
      setUpdatingParticipant(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (is_published?: boolean) => {
    const isPublished = is_published === true;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {isPublished ? 'Aktif' : 'Draft'}
      </span>
    );
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  // Show event selection view
  if (!selectedEvent) {
    return (
      <OrganizerLayout title="Participants">
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Participants Management</h1>
                <p className="text-gray-600 mt-2">Select an event to view and manage participants</p>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {events.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.judul}</h3>
                            {getStatusBadge(event.is_published)}
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{event.deskripsi}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>{formatDate(event.tanggal_mulai)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              <span>{event.lokasi}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiUsers className="w-4 h-4" />
                              <span>{event.terdaftar || 0}/{event.kuota} peserta</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{event.terdaftar || 0}</div>
                            <div className="text-sm text-gray-500">Participants</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500">Create an event first to manage participants</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  // Show participants view for selected event
  return (
    <OrganizerLayout title={`Participants - ${selectedEvent.judul}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToEvents}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to Events
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.judul}</h2>
            <p className="text-gray-600">Manage participants for this event</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload size={20} />
          Export to Excel
        </button>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
            <div className="text-sm text-gray-500">Total Registered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {participants.filter(p => p.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {participants.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {participants.filter(p => p.check_in_status === 'checked_in').length}
            </div>
            <div className="text-sm text-gray-500">Checked In</div>
          </div>
        </div>
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
        {participantsLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Participant</th>
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
                              disabled={updatingParticipant === participant.id}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                updatingParticipant === participant.id
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {updatingParticipant === participant.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(participant.id, 'rejected')}
                              disabled={updatingParticipant === participant.id}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                updatingParticipant === participant.id
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {updatingParticipant === participant.id ? 'Processing...' : 'Reject'}
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
        )}

        {filteredParticipants.length === 0 && !participantsLoading && (
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

export default ParticipantsNew;

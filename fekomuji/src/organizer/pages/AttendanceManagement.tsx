import React, { useState, useEffect } from 'react';
import { FiCamera, FiUsers, FiCheck, FiX, FiDownload, FiSearch, FiFilter, FiCalendar, FiClock } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';
import QRScanner from '../../components/QRScanner';
import { QRCodeService, type TicketQRData } from '../../services/qrCodeService';

interface AttendanceRecord {
  id: string;
  ticketId: string;
  participantName: string;
  participantEmail: string;
  ticketCategory: string;
  checkInTime: string;
  status: 'present' | 'absent';
  qrData?: TicketQRData;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  totalParticipants: number;
  checkedInCount: number;
}

const AttendanceManagement: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');
  const [loading, setLoading] = useState(false);

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch attendance when event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchAttendanceRecords(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (eventId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = async (qrData: TicketQRData) => {
    try {
      // Mark attendance
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${selectedEvent?.id}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketId: qrData.ticketId,
          participantName: qrData.participantName,
          participantEmail: qrData.participantEmail,
          checkInTime: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Refresh attendance records
        if (selectedEvent) {
          fetchAttendanceRecords(selectedEvent.id);
        }
        alert(`Check-in berhasil untuk ${qrData.participantName}`);
      } else {
        throw new Error('Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Gagal melakukan check-in');
    }
  };

  const handleQRScanError = (error: string) => {
    alert(`Error scanning QR: ${error}`);
  };

  const handleManualCheckIn = async (participantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${selectedEvent?.id}/manual-check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantId,
          checkInTime: new Date().toISOString()
        })
      });

      if (response.ok && selectedEvent) {
        fetchAttendanceRecords(selectedEvent.id);
      }
    } catch (error) {
      console.error('Manual check-in error:', error);
    }
  };

  const exportAttendance = () => {
    if (!selectedEvent || attendanceRecords.length === 0) return;

    const csvContent = [
      ['Nama', 'Email', 'Kategori Tiket', 'Status', 'Waktu Check-in'],
      ...attendanceRecords.map(record => [
        record.participantName,
        record.participantEmail,
        record.ticketCategory,
        record.status === 'present' ? 'Hadir' : 'Tidak Hadir',
        record.checkInTime ? new Date(record.checkInTime).toLocaleString('id-ID') : '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedEvent.title}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.participantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const attendanceRate = attendanceRecords.length > 0 ? (presentCount / attendanceRecords.length) * 100 : 0;

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Absensi</h1>
            <p className="text-gray-600">Kelola kehadiran peserta event</p>
          </div>
          
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiCamera size={18} />
            Scan QR Code
          </button>
        </div>

        {/* Event Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedEvent?.id === event.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <FiCalendar size={14} />
                    {new Date(event.date).toLocaleDateString('id-ID')}
                  </p>
                  <p className="flex items-center gap-1">
                    <FiClock size={14} />
                    {event.time}
                  </p>
                  <p className="flex items-center gap-1">
                    <FiUsers size={14} />
                    {event.checkedInCount}/{event.totalParticipants} hadir
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedEvent && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Peserta</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceRecords.length}</p>
                  </div>
                  <FiUsers className="text-blue-600" size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hadir</p>
                    <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                  </div>
                  <FiCheck className="text-green-600" size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tidak Hadir</p>
                    <p className="text-2xl font-bold text-red-600">{attendanceRecords.length - presentCount}</p>
                  </div>
                  <FiX className="text-red-600" size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tingkat Kehadiran</p>
                    <p className="text-2xl font-bold text-blue-600">{attendanceRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-blue-600">📊</div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'present' | 'absent')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="present">Hadir</option>
                    <option value="absent">Tidak Hadir</option>
                  </select>
                </div>

                <button
                  onClick={exportAttendance}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiDownload size={18} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Daftar Kehadiran</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peserta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori Tiket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.participantName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.participantEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {record.ticketCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'present' ? 'Hadir' : 'Tidak Hadir'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.checkInTime 
                            ? new Date(record.checkInTime).toLocaleString('id-ID')
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {record.status === 'absent' && (
                            <button
                              onClick={() => handleManualCheckIn(record.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Check-in Manual
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRecords.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tidak ada data kehadiran</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        onScanError={handleQRScanError}
        eventId={selectedEvent?.id}
      />
    </OrganizerLayout>
  );
};

export default AttendanceManagement;

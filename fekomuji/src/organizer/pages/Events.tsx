import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiEye, FiCalendar, FiUsers, FiMapPin, FiMoreVertical } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface Event {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota: number;
  terdaftar: number;
  is_published: boolean;
  flyer_path?: string;
  created_at: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

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
        console.log('Events data received:', data);
        setEvents(data.data || data.events || []);
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setEvents([]); // Set empty array instead of mock data
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDuplicateEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchEvents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.tanggal_mulai);
    
    if (!event.is_published) return 'bg-gray-100 text-gray-700';
    if (eventDate < now) return 'bg-red-100 text-red-700';
    if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.tanggal_mulai);
    
    if (!event.is_published) return 'Draft';
    if (eventDate < now) return 'Completed';
    if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'Upcoming';
    return 'Published';
  };

  if (loading) {
    return (
      <OrganizerLayout title="Events">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Events">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Manage Your Events</h2>
          <p className="text-gray-600">Create, edit, and manage your events</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Table
            </button>
          </div>
          
          {/* Add New Event Button */}
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <FiPlus size={20} />
            Add New Event
          </button>
        </div>
      </div>

      {/* Events Grid/Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Event Image */}
              <div className="relative h-48 bg-gray-200">
                {event.flyer_path ? (
                  <img
                    src={event.flyer_path}
                    alt={event.judul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiCalendar className="text-gray-400" size={48} />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event)}`}>
                    {getStatusText(event)}
                  </span>
                </div>

                {/* Action Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === event.id ? null : event.id)}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <FiMoreVertical size={16} />
                  </button>
                  
                  {showActionMenu === event.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-1">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2">
                          <FiEye size={14} /> View Details
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2">
                          <FiEdit size={14} /> Edit Event
                        </button>
                        <button 
                          onClick={() => handleDuplicateEvent(event.id)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                        >
                          <FiCopy size={14} /> Duplicate
                        </button>
                        <hr className="my-1" />
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Info */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.judul}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.deskripsi}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} />
                    <span>{formatDate(event.tanggal_mulai)} • {event.waktu_mulai}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin size={14} />
                    <span className="line-clamp-1">{event.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers size={14} />
                    <span>{event.terdaftar}/{event.kuota} participants</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Registration Progress</span>
                    <span>{Math.round((event.terdaftar / event.kuota) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.terdaftar / event.kuota) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Event</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Location</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Participants</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {event.flyer_path ? (
                            <img src={event.flyer_path} alt={event.judul} className="w-12 h-12 object-cover rounded-lg" />
                          ) : (
                            <FiCalendar className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{event.judul}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{event.deskripsi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(event.tanggal_mulai)}</p>
                        <p className="text-sm text-gray-600">{event.waktu_mulai} - {event.waktu_selesai}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{event.lokasi}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.terdaftar}/{event.kuota}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${(event.terdaftar / event.kuota) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event)}`}>
                        {getStatusText(event)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <FiEye size={16} />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <FiEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDuplicateEvent(event.id)}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <FiCopy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </OrganizerLayout>
  );
};

export default Events;

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiBarChart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface TicketType {
  id: string;
  event_id: string;
  event_name: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  is_active: boolean;
  sale_start: string;
  sale_end: string;
  created_at: string;
}

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    event_id: '',
    nama_kategori: '',
    deskripsi: '',
    harga: '',
    kuota: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch organizer's events first
      const eventsResponse = await fetch('http://localhost:8000/api/events?organizer=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const eventsList = eventsData.data || [];
        setEvents(eventsList); // Store events for form dropdown
        
        // Fetch ticket categories for each event
        const allTickets: TicketType[] = [];
        
        for (const event of eventsList) {
          try {
            const ticketsResponse = await fetch(`http://localhost:8000/api/events/${event.id}/ticket-categories`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (ticketsResponse.ok) {
              const ticketsData = await ticketsResponse.json();
              const eventTickets = ticketsData.map((ticket: any) => ({
                id: ticket.id.toString(),
                event_id: event.id.toString(),
                event_name: event.judul,
                name: ticket.nama_kategori,
                description: ticket.deskripsi || 'Kategori tiket',
                price: parseFloat(ticket.harga),
                quantity: ticket.kuota,
                sold: ticket.terjual,
                is_active: ticket.is_active,
                sale_start: event.created_at || '2024-01-01T00:00:00Z',
                sale_end: event.tanggal_mulai || '2024-12-31T23:59:59Z',
                created_at: ticket.created_at
              }));
              allTickets.push(...eventTickets);
            }
          } catch (error) {
            console.error(`Error fetching tickets for event ${event.id}:`, error);
          }
        }
        
        setTickets(allTickets);
      } else {
        console.error('Failed to fetch events');
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${formData.event_id}/ticket-categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_kategori: formData.nama_kategori,
          deskripsi: formData.deskripsi,
          harga: parseFloat(formData.harga),
          kuota: parseInt(formData.kuota)
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ event_id: '', nama_kategori: '', deskripsi: '', harga: '', kuota: '' });
        fetchTickets(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create ticket category');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket category');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;

    try {
      const token = localStorage.getItem('token');
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;
      
      const response = await fetch(`http://localhost:8000/api/events/${ticket.event_id}/ticket-categories/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTicketStatus = (ticket: TicketType) => {
    const now = new Date();
    const saleStart = new Date(ticket.sale_start);
    const saleEnd = new Date(ticket.sale_end);

    if (!ticket.is_active) return { text: 'Inactive', color: 'bg-gray-100 text-gray-700' };
    if (now < saleStart) return { text: 'Not Started', color: 'bg-yellow-100 text-yellow-700' };
    if (now > saleEnd) return { text: 'Sale Ended', color: 'bg-red-100 text-red-700' };
    if (ticket.sold >= ticket.quantity) return { text: 'Sold Out', color: 'bg-red-100 text-red-700' };
    return { text: 'On Sale', color: 'bg-green-100 text-green-700' };
  };

  // Calculate summary statistics
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.sold * ticket.price), 0);
  const totalSold = tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
  const totalAvailable = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  if (loading) {
    return (
      <OrganizerLayout title="Tickets">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Tickets">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ticket Management</h2>
          <p className="text-gray-600">Create and manage ticket types for your events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={20} />
          Create Ticket Type
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiDollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">{totalSold.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiBarChart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalAvailable > 0 ? Math.round((totalSold / totalAvailable) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiTrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Ticket Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Event</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Price</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Sales</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Sale Period</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => {
                const status = getTicketStatus(ticket);
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{ticket.name}</p>
                        <p className="text-sm text-gray-600">{ticket.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{ticket.event_name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{formatPrice(ticket.price)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.sold}/{ticket.quantity}
                        </p>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(ticket.sale_start)}</p>
                        <p className="text-xs text-gray-600">to {formatDate(ticket.sale_end)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <FiEdit size={16} />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <FiCopy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <FiBarChart className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket types found</h3>
            <p className="text-gray-600 mb-4">Create your first ticket type to start selling tickets.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={20} />
              Create Ticket Type
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Kategori Tiket</h3>
            
            <div className="space-y-4">
              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <select
                  value={formData.event_id}
                  onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.judul}</option>
                  ))}
                </select>
              </div>

              {/* Ticket Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.nama_kategori}
                  onChange={(e) => setFormData({...formData, nama_kategori: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Regular, VIP, Early Bird, dll"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Deskripsi kategori tiket"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({...formData, harga: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Quota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kuota</label>
                <input
                  type="number"
                  value={formData.kuota}
                  onChange={(e) => setFormData({...formData, kuota: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ event_id: '', nama_kategori: '', deskripsi: '', harga: '', kuota: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!formData.event_id || !formData.nama_kategori || !formData.harga || !formData.kuota}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buat Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default Tickets;

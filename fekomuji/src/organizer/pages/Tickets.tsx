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

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        // Mock data for development
        setTickets([
          {
            id: '1',
            event_id: '1',
            event_name: 'Tech Conference 2024',
            name: 'Early Bird',
            description: 'Limited time early bird pricing',
            price: 150000,
            quantity: 100,
            sold: 85,
            is_active: true,
            sale_start: '2024-01-01T00:00:00Z',
            sale_end: '2024-02-01T23:59:59Z',
            created_at: '2024-01-01T10:00:00Z'
          },
          {
            id: '2',
            event_id: '1',
            event_name: 'Tech Conference 2024',
            name: 'Regular',
            description: 'Standard ticket pricing',
            price: 200000,
            quantity: 300,
            sold: 157,
            is_active: true,
            sale_start: '2024-02-01T00:00:00Z',
            sale_end: '2024-03-10T23:59:59Z',
            created_at: '2024-01-01T10:00:00Z'
          },
          {
            id: '3',
            event_id: '2',
            event_name: 'Workshop Design Thinking',
            name: 'Standard',
            description: 'Workshop participation ticket',
            price: 75000,
            quantity: 50,
            sold: 45,
            is_active: true,
            sale_start: '2024-01-05T00:00:00Z',
            sale_end: '2024-02-15T23:59:59Z',
            created_at: '2024-01-05T14:30:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/tickets/${ticketId}`, {
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

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Ticket Type</h3>
            <p className="text-gray-600 mb-4">Ticket creation form will be implemented here.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default Tickets;

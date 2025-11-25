import React, { useState, useEffect } from 'react';
import { FiSearch, FiUserCheck, FiUserX, FiEye, FiTrash2, FiUsers, FiShield, FiCalendar, FiX } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'panitia' | 'organizer' | 'admin';
  is_active: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'waiting_approval';
  email_verified_at?: string | null;
  created_at: string;
  events_count?: number;
  is_approved?: boolean | number | null;
}

interface UserEvent {
  id: number;
  event_name: string;
  event_date: string;
  status: string;
  registered_at: string;
}

const UsersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'panitia' | 'pending'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Simpan semua users untuk stats
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [showEventsModal, setShowEventsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Gunakan endpoint yang sudah dibuat
      const endpoint = 'http://localhost:8000/api/admin/all-users';

      console.log('Fetching from:', endpoint);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response:', data);

      // Ambil users dari response
      let usersData = Array.isArray(data.data) ? data.data :
                     Array.isArray(data.users) ? data.users :
                     Array.isArray(data) ? data : [];

      console.log('Users data:', usersData);
      console.log('Users count:', usersData.length);

      // Debug: Tampilkan detail setiap user untuk cek role dan email_verified_at
      console.log('=== USER DETAILS ===');
      usersData.forEach((u: any) => {
        console.log(`User: ${u.name}, Role: ${u.role}, Email Verified: ${u.email_verified_at}, Type: ${typeof u.email_verified_at}`);
      });

      // Jika masih kosong, tampilkan pesan dan instruksi
      if (usersData.length === 0) {
        console.error('❌ No users found from any endpoint!');
        console.error('');
        console.error('📋 INSTRUKSI UNTUK BACKEND:');
        console.error('Buat endpoint di Laravel: GET /api/admin/all-users');
        console.error('');
        console.error('Route (routes/api.php):');
        console.error("Route::get('/admin/all-users', [UserController::class, 'getAllUsers']);");
        console.error('');
        console.error('Controller (UserController.php):');
        console.error('public function getAllUsers() {');
        console.error('  $users = User::with(["registrations"])->get();');
        console.error('  return response()->json([');
        console.error('    "status" => "success",');
        console.error('    "data" => $users');
        console.error('  ]);');
        console.error('}');
        console.error('');
        console.error('Atau gunakan endpoint yang sudah ada dengan data yang benar.');
      }

      // Filter berdasarkan tab
      let filteredUsers = usersData;

      if (activeTab === 'panitia') {
        // Hanya panitia/organizer yang sudah approved
        filteredUsers = usersData.filter((u: any) =>
          (u.role === 'panitia' || u.role === 'organizer') &&
          u.email_verified_at
        );
        console.log('Filtered panitia:', filteredUsers.length);
      } else if (activeTab === 'pending') {
        // Hanya panitia/organizer yang pending (belum approved)
        // Cek berbagai kemungkinan status pending
        filteredUsers = usersData.filter((u: any) => {
          const isPanitiaOrOrganizer = u.role === 'panitia' || u.role === 'organizer';

          // Berbagai kondisi pending:
          const isNotEmailVerified = !u.email_verified_at || u.email_verified_at === '' || u.email_verified_at === null;
          const isPendingStatus = u.status === 'pending' || u.status === 'waiting_approval';
          const isNotApproved = u.is_approved === false || u.is_approved === 0 || u.is_approved === null;
          const isNotActive = u.is_active === false;

          // User dianggap pending jika:
          // 1. Role panitia/organizer DAN (email belum verified ATAU status pending ATAU belum approved ATAU tidak aktif)
          const isPending = isPanitiaOrOrganizer && (isNotEmailVerified || isPendingStatus || isNotApproved || isNotActive);

          if (isPanitiaOrOrganizer) {
            console.log(`🔍 Checking user ${u.name}:`, {
              role: u.role,
              email_verified_at: u.email_verified_at,
              status: u.status,
              is_approved: u.is_approved,
              is_active: u.is_active,
              isPending: isPending
            });
          }

          return isPending;
        });
        console.log('✅ Filtered pending users:', filteredUsers.length);
        console.log('📋 Pending users list:', filteredUsers.map((u: any) => ({
          name: u.name,
          role: u.role,
          email_verified_at: u.email_verified_at,
          status: u.status,
          is_approved: u.is_approved,
          is_active: u.is_active
        })));
      } else {
        // Tab "Semua User" - tampilkan SEMUA users
        filteredUsers = usersData;
        console.log('All users (no filter):', filteredUsers.length);
      }

        const mappedUsers = filteredUsers.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          is_active: user.is_active !== undefined ? (user.is_active === 1 || user.is_active === true) : true,
          status: user.email_verified_at ? 'approved' : 'pending',
          email_verified_at: user.email_verified_at,
          created_at: user.created_at,
          events_count: user.events_count || user.registered_events_count || 0
        }));

      // Simpan semua users untuk stats (tanpa filter)
      const allMappedUsers = usersData.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        is_active: user.is_active !== undefined ? (user.is_active === 1 || user.is_active === true) : true,
        status: user.email_verified_at ? 'approved' : 'pending',
        email_verified_at: user.email_verified_at,
        created_at: user.created_at,
        events_count: user.events_count || user.registered_events_count || 0
      }));

      setAllUsers(allMappedUsers); // Simpan semua users
      setUsers(mappedUsers); // Simpan filtered users
      console.log(`Loaded ${mappedUsers.length} users for tab: ${activeTab}`);
      console.log(`Total all users: ${allMappedUsers.length}`);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUsers();
        alert('User berhasil dihapus!');
      } else {
        alert('Gagal menghapus user!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user!');
    }
  };

  const handleSuspendPanitia = async (userId: number) => {
    if (!confirm('Apakah Anda yakin ingin suspend panitia ini? Panitia akan diubah menjadi user biasa.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/organizers/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUsers();
        alert('Panitia berhasil di-suspend dan diubah menjadi user biasa!');
      } else {
        alert('Gagal suspend panitia!');
      }
    } catch (error) {
      console.error('Error suspending panitia:', error);
      alert('Gagal suspend panitia!');
    }
  };

  const handleApprovePanitia = async (userId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} panitia ini?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/organizers/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Approve/Reject response:', data);

        // Refresh data dari server
        await fetchUsers();
        alert(`Panitia berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}!`);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} panitia: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving panitia:', error);
      alert(`Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} panitia!`);
    }
  };

  const handleViewEvents = async (user: User) => {
    setSelectedUser(user);
    setShowEventsModal(true);

    try {
      const token = localStorage.getItem('token');

      // Gunakan endpoint yang benar
      const endpoint = `http://localhost:8000/api/admin/users/${user.id}/events`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let eventsData: UserEvent[] = [];

      if (response.ok) {
        const data = await response.json();
        const events = Array.isArray(data.data) ? data.data :
                      Array.isArray(data.registrations) ? data.registrations :
                      Array.isArray(data) ? data : [];

        eventsData = events.map((e: any) => ({
          id: e.id,
          event_name: e.event_name || e.event?.nama_event || e.nama_event || 'Unknown Event',
          event_date: e.event_date || e.event?.tanggal_mulai || e.tanggal_mulai || '',
          status: e.status || 'registered',
          registered_at: e.registered_at || e.created_at || ''
        }));

        console.log('Loaded events:', eventsData.length);
      }

      setUserEvents(eventsData);

      if (eventsData.length === 0) {
        // Mock events jika tidak ada
        const mockEvents: UserEvent[] = [
          {
            id: 1,
            event_name: 'Workshop React Advanced',
            event_date: '2025-01-15',
            status: 'approved',
            registered_at: '2025-01-10'
          },
          {
            id: 2,
            event_name: 'Seminar AI & Machine Learning',
            event_date: '2025-01-20',
            status: 'pending',
            registered_at: '2025-01-12'
          }
        ];
        setUserEvents(mockEvents);
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats selalu dari allUsers (semua data tanpa filter tab)
  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.is_active).length,
    panitia: allUsers.filter(u => (u.role === 'panitia' || u.role === 'organizer') && u.email_verified_at).length,
    pending: allUsers.filter(u => {
      const isPanitiaOrOrganizer = u.role === 'panitia' || u.role === 'organizer';
      const isNotEmailVerified = !u.email_verified_at || u.email_verified_at === '' || u.email_verified_at === null;
      const isPendingStatus = u.status === 'pending' || u.status === 'waiting_approval';
      const isNotApproved = u.is_approved === false || u.is_approved === 0 || u.is_approved === null;
      const isNotActive = u.is_active === false;
      return isPanitiaOrOrganizer && (isNotEmailVerified || isPendingStatus || isNotApproved || isNotActive);
    }).length
  };

  return (
    <AdminLayout title="Manajemen User">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1e3a8a' }}>Manajemen User</h1>
        <p className="text-gray-600">Kelola user, panitia, dan approval dengan mudah</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total User</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FiUsers className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-500 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">User Aktif</p>
              <p className="text-4xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FiUserCheck className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-400 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Panitia</p>
              <p className="text-4xl font-bold mt-2">{stats.panitia}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FiShield className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pending</p>
              <p className="text-4xl font-bold mt-2">{stats.pending}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FiCalendar className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="border-b-2 border-gray-100 px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-8 py-4 font-bold transition-all relative overflow-hidden ${
                  activeTab === 'all' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activeTab === 'all' && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}></div>
                )}
                <span className="relative flex items-center gap-2">
                  <FiUsers className="w-5 h-5" />
                  Semua User
                </span>
              </button>
              <button
                onClick={() => setActiveTab('panitia')}
                className={`px-8 py-4 font-bold transition-all relative overflow-hidden ${
                  activeTab === 'panitia' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activeTab === 'panitia' && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}></div>
                )}
                <span className="relative flex items-center gap-2">
                  <FiShield className="w-5 h-5" />
                  Panitia
                </span>
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-8 py-4 font-bold transition-all relative overflow-hidden ${
                  activeTab === 'pending' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activeTab === 'pending' && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}></div>
                )}
                <span className="relative flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  Pending Approval
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
              <tr>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">User</th>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Role</th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Event</th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="animate-pulse">Loading...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Tidak ada data user
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'panitia' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'panitia' ? 'Panitia' : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {user.status === 'pending' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          Pending
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleViewEvents(user)}
                        className="text-blue-900 hover:text-blue-700 font-semibold"
                      >
                        {user.events_count || 0} Event
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Untuk Panitia Pending: Approve & Reject */}
                        {(user.role === 'panitia' || user.role === 'organizer') &&
                         (user.status === 'pending' || !user.is_active || !user.email_verified_at) && (
                          <>
                            <button
                              onClick={() => handleApprovePanitia(user.id, 'approve')}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Setujui Panitia"
                            >
                              <FiUserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprovePanitia(user.id, 'reject')}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Tolak Panitia"
                            >
                              <FiUserX className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Untuk User Biasa: Hanya Hapus & View Events */}
                        {user.role !== 'admin' && user.role !== 'panitia' && user.role !== 'organizer' && (
                          <>
                            <button
                              onClick={() => handleViewEvents(user)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Lihat Event yang Diikuti"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Hapus User"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Untuk Panitia Approved: Suspend (ubah jadi user) */}
                        {(user.role === 'panitia' || user.role === 'organizer') && user.status === 'approved' && (
                          <button
                            onClick={() => handleSuspendPanitia(user.id)}
                            className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                            title="Suspend Panitia (Ubah jadi User Biasa)"
                          >
                            <FiUserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Event List */}
      {showEventsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-blue-100 text-sm mt-1">Event yang Diikuti</p>
                </div>
                <button
                  onClick={() => setShowEventsModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {userEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>User belum mengikuti event apapun</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-900 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{event.event_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {new Date(event.event_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            <span>
                              Daftar: {new Date(event.registered_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status === 'approved' ? 'bg-green-100 text-green-700' :
                          event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status === 'approved' ? 'Disetujui' :
                           event.status === 'rejected' ? 'Ditolak' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersManagement;

import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiSave, FiEdit2, FiCamera } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  bio: string;
  avatar: string;
  role: string;
  created_at: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  event_reminders: boolean;
  payment_notifications: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    event_reminders: true,
    payment_notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data.profile);
        setNotifications(data.notifications || notifications);
      } else {
        console.error('Failed to fetch profile:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        // Don't set mock data - let user see the actual error
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfile)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notifications)
      });

      if (response.ok) {
        // Success feedback
        console.log('Notifications updated successfully');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    } finally {
      setSaving(false);
    }
  };

  // Hanya tampilkan tab yang ada backend API-nya
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser, hasAPI: true },
    { id: 'security', label: 'Security', icon: FiLock, hasAPI: false },
    // { id: 'notifications', label: 'Notifications', icon: FiBell, hasAPI: false }, // Disabled - no backend
    // { id: 'billing', label: 'Billing', icon: FiCreditCard, hasAPI: false }, // Disabled - no backend
    // { id: 'privacy', label: 'Privacy', icon: FiShield, hasAPI: false } // Disabled - no backend
  ];

  if (loading) {
    return (
      <OrganizerLayout title="Settings">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'text-white border-2'
                      : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                  style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' } : {}}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === 'profile' && profile && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => handleSaveProfile(profile)}
                  disabled={saving}
                  className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}
                >
                  <FiSave size={16} />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <button className="flex items-center gap-2 font-medium hover:opacity-70 transition-colors" style={{ color: '#004aad' }}>
                      <FiCamera size={16} />
                      Ubah Avatar
                    </button>
                    <p className="text-sm text-gray-600 mt-1">JPG, PNG atau GIF. Maks 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      style={{ borderColor: '#004aad40' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      style={{ borderColor: '#004aad40' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      style={{ borderColor: '#004aad40' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Organisasi</label>
                    <input
                      type="text"
                      value={profile.organization}
                      onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      style={{ borderColor: '#004aad40' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                    style={{ borderColor: '#004aad40' }}
                    placeholder="Ceritakan tentang diri Anda..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#004aad' }}>Keamanan Akun</h2>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <FiLock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">Fitur Dalam Pengembangan</h3>
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      Fitur keamanan seperti ubah password dan two-factor authentication sedang dalam tahap pengembangan.
                      Untuk saat ini, silakan hubungi administrator jika ingin mengubah password Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default Settings;

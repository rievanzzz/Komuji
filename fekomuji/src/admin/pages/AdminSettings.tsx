import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiPercent, FiClock, FiMail, FiShield, FiDatabase, FiGlobe } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface SystemSettings {
  // Commission Settings
  commission_rate: number;
  min_commission: number;
  max_commission: number;

  // Plan Settings
  trial_duration_days: number;
  free_max_active_events: number;
  premium_max_active_events: number;

  // Auto Approval
  auto_approve_panitia: boolean;
  auto_approve_events: boolean;

  // Email Settings
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;

  // Platform Settings
  platform_name: string;
  platform_description: string;
  support_email: string;
  support_phone: string;

  // Security Settings
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_email_verification: boolean;
  // Platform owner
  platform_owner_user_id?: number;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    commission_rate: 5,
    min_commission: 1000,
    max_commission: 1000000,
    trial_duration_days: 60,
    free_max_active_events: 1,
    premium_max_active_events: 999,
    auto_approve_panitia: false,
    auto_approve_events: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Komuji Platform',
    platform_name: 'Komuji',
    platform_description: 'Platform Event Management Terpercaya',
    support_email: 'support@komuji.com',
    support_phone: '+62-21-1234-5678',
    session_timeout: 120,
    max_login_attempts: 5,
    password_min_length: 8,
    require_email_verification: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('commission');
  const [platformBank, setPlatformBank] = useState<any>({
    bank_code: 'BCA',
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    is_verified: true,
  });

  const bankOptions = [
    { code: 'BCA', name: 'Bank Central Asia' },
    { code: 'BNI', name: 'Bank Negara Indonesia' },
    { code: 'BRI', name: 'Bank Rakyat Indonesia' },
    { code: 'MANDIRI', name: 'Bank Mandiri' },
    { code: 'CIMB', name: 'CIMB Niaga' },
    { code: 'DANAMON', name: 'Bank Danamon' },
    { code: 'PERMATA', name: 'Bank Permata' },
    { code: 'MAYBANK', name: 'Maybank Indonesia' },
    { code: 'OCBC', name: 'OCBC NISP' },
    { code: 'PANIN', name: 'Panin Bank' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }

      // Fetch platform bank account
      const bankRes = await fetch('http://localhost:8000/api/admin/platform-bank-account', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (bankRes.ok) {
        const bank = await bankRes.json();
        if (bank?.data) {
          setPlatformBank({
            bank_code: '',
            bank_name: bank.data.bank_name,
            account_number: bank.data.account_number,
            account_holder_name: bank.data.account_holder_name,
            is_verified: bank.data.is_verified,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      let ok = response.ok;

      // Save platform bank account
      const bankSave = await fetch('http://localhost:8000/api/admin/platform-bank-account', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(platformBank)
      });

      ok = ok && bankSave.ok;

      alert(ok ? 'Pengaturan berhasil disimpan!' : 'Sebagian pengaturan gagal disimpan');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan!');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'commission', name: 'Komisi & Keuangan', icon: FiPercent },
    { id: 'plans', name: 'Paket & Durasi', icon: FiClock },
    { id: 'email', name: 'Email & SMTP', icon: FiMail },
    { id: 'platform', name: 'Platform', icon: FiGlobe },
    { id: 'security', name: 'Keamanan', icon: FiShield }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
            <p className="text-gray-600">Konfigurasi pengaturan platform dan sistem</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Commission & Finance Settings */}
              {activeTab === 'commission' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Komisi & Keuangan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commission Rate (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={settings.commission_rate}
                          onChange={(e) => updateSetting('commission_rate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Persentase komisi yang diambil platform dari setiap transaksi</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Komisi (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settings.min_commission}
                          onChange={(e) => updateSetting('min_commission', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Komisi (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settings.max_commission}
                          onChange={(e) => updateSetting('max_commission', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Platform Owner and Bank Account */}
                  <div className="pt-4 border-t">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Rekening Utama Platform (Admin)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Owner User ID</label>
                        <input
                          type="number"
                          min={1}
                          value={settings.platform_owner_user_id || 1}
                          onChange={(e) => updateSetting('platform_owner_user_id', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">ID user admin yang menerima dana di Xendit</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                        <select
                          value={platformBank.bank_code || ''}
                          onChange={(e) => setPlatformBank({ ...platformBank, bank_code: e.target.value, bank_name: '' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih Bank</option>
                          {bankOptions.map(b => (
                            <option key={b.code} value={b.code}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">No. Rekening</label>
                        <input
                          type="text"
                          value={platformBank.account_number}
                          onChange={(e) => setPlatformBank({ ...platformBank, account_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Atas Nama</label>
                        <input
                          type="text"
                          value={platformBank.account_holder_name}
                          onChange={(e) => setPlatformBank({ ...platformBank, account_holder_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nama Pemilik Rekening"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Dana real dari Xendit tetap mengalir ke merchant (secret key) admin. Data rekening ini dipakai untuk tampilan dan proses pencairan internal.</p>
                  </div>
                </div>
              )}

              {/* Plans & Duration Settings */}
              {activeTab === 'plans' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Paket & Durasi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durasi Trial (hari)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={settings.trial_duration_days}
                          onChange={(e) => updateSetting('trial_duration_days', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Event Paket Free
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settings.free_max_active_events}
                          onChange={(e) => updateSetting('free_max_active_events', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Event Paket Premium
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settings.premium_max_active_events}
                          onChange={(e) => updateSetting('premium_max_active_events', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">999 = unlimited</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="auto_approve_panitia"
                          checked={settings.auto_approve_panitia}
                          onChange={(e) => updateSetting('auto_approve_panitia', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="auto_approve_panitia" className="ml-2 block text-sm text-gray-900">
                          Auto Approve Panitia Baru
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="auto_approve_events"
                          checked={settings.auto_approve_events}
                          onChange={(e) => updateSetting('auto_approve_events', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="auto_approve_events" className="ml-2 block text-sm text-gray-900">
                          Auto Approve Event Baru
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Email & SMTP</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={settings.smtp_host}
                          onChange={(e) => updateSetting('smtp_host', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.smtp_port}
                          onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          value={settings.smtp_username}
                          onChange={(e) => updateSetting('smtp_username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Password
                        </label>
                        <input
                          type="password"
                          value={settings.smtp_password}
                          onChange={(e) => updateSetting('smtp_password', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Email
                        </label>
                        <input
                          type="email"
                          value={settings.from_email}
                          onChange={(e) => updateSetting('from_email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="noreply@komuji.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={settings.from_name}
                          onChange={(e) => updateSetting('from_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Settings */}
              {activeTab === 'platform' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Platform</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Platform
                        </label>
                        <input
                          type="text"
                          value={settings.platform_name}
                          onChange={(e) => updateSetting('platform_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deskripsi Platform
                        </label>
                        <textarea
                          rows={3}
                          value={settings.platform_description}
                          onChange={(e) => updateSetting('platform_description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Support Email
                          </label>
                          <input
                            type="email"
                            value={settings.support_email}
                            onChange={(e) => updateSetting('support_email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Support Phone
                          </label>
                          <input
                            type="text"
                            value={settings.support_phone}
                            onChange={(e) => updateSetting('support_phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Keamanan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (menit)
                        </label>
                        <input
                          type="number"
                          min="5"
                          value={settings.session_timeout}
                          onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={settings.max_login_attempts}
                          onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          min="6"
                          value={settings.password_min_length}
                          onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require_email_verification"
                          checked={settings.require_email_verification}
                          onChange={(e) => updateSetting('require_email_verification', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="require_email_verification" className="ml-2 block text-sm text-gray-900">
                          Require Email Verification untuk User Baru
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

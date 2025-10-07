import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  last_education: string;
  role: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    last_education: ''
  });

  // Fetch user profile
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        setProfile(user);
        setEditForm({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          last_education: user.last_education || ''
        });
      } else {
        // API endpoint belum tersedia, gunakan data dari localStorage atau kosong
        console.log('API endpoint /profile belum tersedia');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.id) {
          setProfile({
            id: userData.id,
            name: userData.name || '',
            email: userData.email || '',
            phone: '',
            address: '',
            last_education: '',
            role: userData.role || 'peserta',
            created_at: new Date().toISOString()
          });
          setEditForm({
            name: userData.name || '',
            phone: '',
            address: '',
            last_education: ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback ke data user dari localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.id) {
        setProfile({
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          phone: '',
          address: '',
          last_education: '',
          role: userData.role || 'peserta',
          created_at: new Date().toISOString()
        });
        setEditForm({
          name: userData.name || '',
          phone: '',
          address: '',
          last_education: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values
      setEditForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        last_education: profile?.last_education || ''
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setIsEditing(false);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Terjadi kesalahan saat menyimpan profil' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk mengakses profil Anda.</p>
            <a
              href="/signin"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Sekarang
            </a>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profil...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
                <p className="text-blue-100">Kelola informasi profil Anda</p>
              </div>
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                {isEditing ? (
                  <>
                    <FiX className="w-4 h-4" />
                    Batal
                  </>
                ) : (
                  <>
                    <FiEdit3 className="w-4 h-4" />
                    Edit Profil
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4" />
                  Nama Lengkap
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {profile?.name || '-'}
                  </p>
                )}
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {profile?.email || '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="w-4 h-4" />
                  Nomor Telepon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nomor telepon"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {profile?.phone || '-'}
                  </p>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Education */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiBook className="w-4 h-4" />
                  Pendidikan Terakhir
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_education"
                    value={editForm.last_education}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_education ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan pendidikan terakhir"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {profile?.last_education || '-'}
                  </p>
                )}
                {errors.last_education && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_education}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="w-4 h-4" />
                  Alamat
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan alamat lengkap"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                    {profile?.address || '-'}
                  </p>
                )}
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {/* API Note */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> API endpoint untuk profil (/api/profile) {profile?.phone || profile?.address || profile?.last_education ? 'sudah tersedia' : 'belum tersedia'}. 
                  {!profile?.phone && !profile?.address && !profile?.last_education && 
                    ' Data profil saat ini menggunakan informasi dasar dari akun login. Fitur edit akan aktif setelah API diimplementasikan.'
                  }
                </p>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Account Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Role:</span>
                  <span className="ml-2 font-medium capitalize">{profile?.role || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bergabung sejak:</span>
                  <span className="ml-2 font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Profile;

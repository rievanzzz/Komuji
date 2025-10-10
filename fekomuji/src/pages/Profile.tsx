import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiX } from 'react-icons/fi';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  last_education: string;
  role: string;
  created_at: string;
  updated_at?: string;
  email_verified_at?: string;
}

interface Certificate {
  id: string;
  event_title: string;
  nomor_sertifikat: string;
  file_path: string;
  generated_at: string;
}

const Profile: React.FC = () => {
  const { isAuthenticated, user } = useAuth(); // Get user from AuthContext
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
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

  // Fetch user profile and certificates
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchCertificates();
    }
  }, [isAuthenticated, user]); // Also depend on user changes

  const fetchProfile = async () => {
    try {
      console.log('=== PROFILE DEBUG START ===');
      console.log('AuthContext user:', user);
      console.log('isAuthenticated:', isAuthenticated);
      
      // Priority 1: Use data from AuthContext if available
      if (user && user.id) {
        console.log('Using AuthContext user data:', user);
        const userData = user as any;
        const phoneNumber = userData.phone || userData.no_telepon || userData.phoneNumber || '';
        const userAddress = userData.address || userData.alamat || '';
        const userEducation = userData.last_education || userData.pendidikan_terakhir || userData.education || '';
        
        console.log('Extracted phone number:', phoneNumber);
        console.log('Raw user data for phone:', {
          phone: userData.phone,
          no_telepon: userData.no_telepon,
          phoneNumber: userData.phoneNumber
        });
        console.log('Extracted address:', userAddress);
        console.log('Extracted education:', userEducation);
        
        setProfile({
          id: user.id.toString(),
          name: user.name || '',
          email: user.email || '',
          phone: phoneNumber,
          address: userAddress,
          last_education: userEducation,
          role: user.role || 'peserta',
          created_at: userData.created_at || new Date().toISOString()
        });
        
        setEditForm({
          name: user.name || '',
          phone: phoneNumber,
          address: userAddress,
          last_education: userEducation
        });
        return; // Exit early if we have user data from AuthContext
      }

      // Priority 2: Try API endpoints
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      const endpoints = [
        'http://localhost:8000/api/profile',
        'http://localhost:8000/api/user/profile',
        'http://localhost:8000/api/me'
      ];

      let profileData = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            profileData = data.user || data.data || data;
            success = true;
            console.log(`Profile loaded from: ${endpoint}`, profileData);
            break;
          } else {
            console.log(`${endpoint} returned status:`, response.status);
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err);
          continue;
        }
      }

      if (success && profileData) {
        console.log('Profile data received from API:', profileData);
        setProfile({
          id: profileData.id || '',
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || profileData.no_telepon || '',
          address: profileData.address || profileData.alamat || '',
          last_education: profileData.last_education || profileData.pendidikan_terakhir || '',
          role: profileData.role || 'peserta',
          created_at: profileData.created_at || new Date().toISOString()
        });
        
        setEditForm({
          name: profileData.name || '',
          phone: profileData.phone || profileData.no_telepon || '',
          address: profileData.address || profileData.alamat || '',
          last_education: profileData.last_education || profileData.pendidikan_terakhir || ''
        });
      } else {
        // Priority 3: Fallback to localStorage
        console.log('All API endpoints failed, using localStorage data');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('LocalStorage user data:', userData);
        
        if (userData.id) {
          setProfile({
            id: userData.id.toString(),
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || userData.no_telepon || '',
            address: userData.address || userData.alamat || '',
            last_education: userData.last_education || userData.pendidikan_terakhir || '',
            role: userData.role || 'peserta',
            created_at: userData.created_at || new Date().toISOString()
          });
          setEditForm({
            name: userData.name || '',
            phone: userData.phone || userData.no_telepon || '',
            address: userData.address || userData.alamat || '',
            last_education: userData.last_education || userData.pendidikan_terakhir || ''
          });
        } else {
          console.error('No user data found anywhere!');
          // Set minimal profile to prevent crashes
          setProfile({
            id: '',
            name: 'User',
            email: 'user@example.com',
            phone: '',
            address: '',
            last_education: '',
            role: 'peserta',
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback ke data user dari localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Fallback to localStorage user data:', userData);
      
      if (userData.id) {
        setProfile({
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || userData.no_telepon || '',
          address: userData.address || userData.alamat || '',
          last_education: userData.last_education || userData.pendidikan_terakhir || '',
          role: userData.role || 'peserta',
          created_at: userData.created_at || new Date().toISOString()
        });
        setEditForm({
          name: userData.name || '',
          phone: userData.phone || userData.no_telepon || '',
          address: userData.address || userData.alamat || '',
          last_education: userData.last_education || userData.pendidikan_terakhir || ''
        });
      } else {
        console.error('No user data found in localStorage during error fallback');
        // Set minimal profile data to prevent crashes
        setProfile({
          id: '',
          name: 'User',
          email: '',
          phone: '',
          address: '',
          last_education: '',
          role: 'peserta',
          created_at: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
      console.log('=== PROFILE DEBUG END ===');
      console.log('Final profile state:', profile);
    }
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try multiple possible API endpoints for certificates
      const endpoints = [
        'http://localhost:8000/api/my-certificates',
        'http://localhost:8000/api/user/certificates',
        'http://localhost:8000/api/certificates',
        'http://localhost:8000/api/certificates/user'
      ];

      let certificatesData = [];
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            certificatesData = data.certificates || data.data || data || [];
            success = true;
            console.log(`Certificates loaded from: ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch certificates from ${endpoint}:`, err);
          continue;
        }
      }

      if (success) {
        // Transform certificate data to match our interface
        const transformedCertificates = certificatesData.map((cert: any) => ({
          id: cert.id || cert.certificate_id || '',
          event_title: cert.event_title || cert.event?.judul || cert.event?.title || 'Event Tidak Diketahui',
          nomor_sertifikat: cert.nomor_sertifikat || cert.certificate_number || cert.number || '',
          file_path: cert.file_path || cert.path || cert.certificate_path || '',
          generated_at: cert.generated_at || cert.created_at || new Date().toISOString()
        }));
        
        setCertificates(transformedCertificates);
      } else {
        console.log('All certificate API endpoints failed, showing empty state');
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      
      // Try multiple possible API endpoints for updating profile
      const endpoints = [
        { url: 'http://localhost:8000/api/profile', method: 'PUT' },
        { url: 'http://localhost:8000/api/user/profile', method: 'PUT' },
        { url: 'http://localhost:8000/api/user/profile', method: 'POST' },
        { url: 'http://localhost:8000/api/me', method: 'PUT' }
      ];

      let success = false;
      let responseData = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: editForm.name,
              phone: editForm.phone,
              no_telepon: editForm.phone, // Alternative field name
              address: editForm.address,
              alamat: editForm.address, // Alternative field name
              last_education: editForm.last_education,
              pendidikan_terakhir: editForm.last_education // Alternative field name
            })
          });

          responseData = await response.json();

          if (response.ok) {
            success = true;
            console.log(`Profile updated via: ${endpoint.method} ${endpoint.url}`);
            break;
          } else if (response.status === 422 && responseData.errors) {
            // Validation errors
            setErrors(responseData.errors);
            setSaving(false);
            return;
          }
        } catch (err) {
          console.log(`Failed to update via ${endpoint.method} ${endpoint.url}:`, err);
          continue;
        }
      }

      if (success && responseData) {
        // Update profile state with new data
        const updatedProfile = responseData.user || responseData.data || responseData;
        setProfile({
          ...profile!,
          name: updatedProfile.name || editForm.name,
          phone: updatedProfile.phone || updatedProfile.no_telepon || editForm.phone,
          address: updatedProfile.address || updatedProfile.alamat || editForm.address,
          last_education: updatedProfile.last_education || updatedProfile.pendidikan_terakhir || editForm.last_education
        });
        
        // Update localStorage user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...userData,
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
          last_education: editForm.last_education
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        setIsEditing(false);
        setErrors({ success: 'Profil berhasil diperbarui!' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrors({});
        }, 3000);
      } else {
        setErrors({ general: responseData?.message || 'Gagal memperbarui profil. API endpoint mungkin belum tersedia.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PublicHeader />
      
      {/* Professional Layout */}
      <div className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6"
        >
          {/* Hero Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black px-12 py-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {/* Professional Avatar */}
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                      <span className="text-4xl font-bold text-gray-900">
                        {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                  <div className="text-white">
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">
                      {profile?.name || 'Nama Pengguna'}
                    </h1>
                    <p className="text-gray-300 text-xl mb-2 font-medium">
                      {profile?.email || 'email@example.com'}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        {profile?.role === 'peserta' ? 'Peserta' : profile?.role || 'Anggota'}
                      </span>
                      <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                        Aktif
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isEditing ? (
                    <>
                      <FiX className="w-5 h-5 inline mr-3" />
                      Batal
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="w-5 h-5 inline mr-3" />
                      Edit Profil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Professional Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-xl shadow-sm">
                  <div className="font-semibold">Error</div>
                  <div>{errors.general}</div>
                </div>
              )}
              
              {errors.success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-r-xl shadow-sm">
                  <div className="font-semibold">Berhasil</div>
                  <div>{errors.success}</div>
                </div>
              )}

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pengaturan Cepat</h3>
                <div className="space-y-4">
                  <button className="w-full bg-gradient-to-r from-gray-900 to-black text-white p-5 rounded-xl text-left hover:from-gray-800 hover:to-gray-900 transition-all duration-300 group shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold mb-1">Ganti Password</div>
                        <div className="text-gray-300 text-sm">Perbarui keamanan akun</div>
                      </div>
                      <FiEdit3 className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  
                  <button className="w-full bg-white border-2 border-gray-200 p-5 rounded-xl text-left hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 group shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 mb-1">Bahasa</div>
                        <div className="text-gray-600 text-sm">Bahasa Indonesia</div>
                      </div>
                      <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Statistik</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
                      <div className="text-blue-700 text-sm font-medium">Event Diikuti</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{certificates.length}</div>
                      <div className="text-green-700 text-sm font-medium">Sertifikat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Professional Profile Information */}
              {!isEditing && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Informasi Personal</h3>
                    <p className="text-gray-600 mt-1">Data pribadi dan informasi akun Anda</p>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                        <div className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border">
                          {profile?.name || 'Belum diisi'}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Alamat Email</label>
                        <div className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border">
                          {profile?.email || 'Belum diisi'}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nomor Telepon</label>
                        <div className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border">
                          {profile?.phone || 'Belum diisi'}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pendidikan</label>
                        <div className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border">
                          {profile?.last_education || 'Belum diisi'}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Alamat</label>
                        <div className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border min-h-[80px] flex items-start">
                          {profile?.address || 'Belum diisi'}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bergabung Sejak</label>
                        <div className="text-lg text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Tidak tersedia'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Edit Form */}
              {isEditing && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Edit Informasi Personal</h3>
                    <p className="text-gray-600 mt-1">Perbarui data pribadi Anda</p>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                          placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <span className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Nomor Telepon
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                          placeholder="08123456789"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <span className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Education */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Pendidikan Terakhir
                        </label>
                        <select
                          name="last_education"
                          value={editForm.last_education}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg bg-white"
                        >
                          <option value="">Pilih pendidikan terakhir</option>
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA/SMK">SMA/SMK</option>
                          <option value="D3">D3</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                        </select>
                        {errors.last_education && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <span className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                            {errors.last_education}
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Alamat
                        </label>
                        <textarea
                          name="address"
                          value={editForm.address}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-lg"
                          placeholder="Masukkan alamat lengkap"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <span className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                            {errors.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {saving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan Perubahan'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Certificates Section */}
              {certificates.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-8 py-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Sertifikat Terbaru</h3>
                    <p className="text-gray-600 mt-1">Pencapaian dan sertifikat yang telah Anda peroleh</p>
                  </div>
                  <div className="p-8">
                    <div className="space-y-6">
                      {certificates.slice(0, 3).map((cert) => (
                        <div key={cert.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                                <FiEdit3 className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{cert.event_title}</h4>
                                <p className="text-sm text-gray-600">
                                  Diterbitkan: {new Date(cert.generated_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">No: {cert.nomor_sertifikat}</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => window.open(`http://localhost:8000${cert.file_path}`, '_blank')}
                                className="bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                              >
                                Lihat
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `http://localhost:8000${cert.file_path}`;
                                  link.download = `sertifikat-${cert.nomor_sertifikat}.pdf`;
                                  link.click();
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {certificates.length > 3 && (
                      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                          Lihat semua {certificates.length} sertifikat →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiX, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Professional Layout */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Professional Header */}
          <div className="bg-white rounded-lg border border-gray-200 mb-8">
            <div className="px-8 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Clean Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-semibold text-gray-700">
                        {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                      {profile?.name || 'Nama Pengguna'}
                    </h1>
                    <p className="text-gray-600 mb-2">
                      {profile?.email || 'email@example.com'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {profile?.role === 'peserta' ? 'Peserta' : profile?.role || 'Anggota'}
                      </span>
                      {profile?.role === 'peserta' && (
                        <Link
                          to="/upgrade-to-panitia"
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                        >
                          <FiStar className="w-3 h-3 mr-1" />
                          Upgrade ke Panitia
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditing ? (
                    <>
                      <FiX className="w-4 h-4 mr-2" />
                      Batal
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="w-4 h-4 mr-2" />
                      Edit Profil
                    </>
                  )}
                </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{errors.general}</div>
                </div>
              </div>
            </div>
          )}

          {errors.success && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Berhasil</h3>
                  <div className="mt-2 text-sm text-green-700">{errors.success}</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-8">

            {/* Professional Profile Information */}
            {!isEditing && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Informasi Personal</h3>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nama Lengkap</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.name || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.email || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nomor Telepon</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.phone || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pendidikan</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.last_education || '-'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Alamat</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.address || '-'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Bergabung Sejak</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Professional Edit Form */}
            {isEditing && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Edit Informasi Personal</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="08123456789"
                      />
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* Education */}
                    <div>
                      <label htmlFor="last_education" className="block text-sm font-medium text-gray-700">
                        Pendidikan Terakhir
                      </label>
                      <select
                        name="last_education"
                        id="last_education"
                        value={editForm.last_education}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                        <p className="mt-2 text-sm text-red-600">{errors.last_education}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Alamat
                      </label>
                      <textarea
                        name="address"
                        id="address"
                        value={editForm.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Masukkan alamat lengkap"
                      />
                      {errors.address && (
                        <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
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
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Sertifikat</h3>
                  <p className="mt-1 text-sm text-gray-600">{certificates.length} sertifikat tersedia</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {certificates.slice(0, 3).map((cert) => (
                      <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{cert.event_title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(cert.generated_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">No: {cert.nomor_sertifikat}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(`http://localhost:8000${cert.file_path}`, '_blank')}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {certificates.length > 3 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        Lihat semua {certificates.length} sertifikat →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Profile;

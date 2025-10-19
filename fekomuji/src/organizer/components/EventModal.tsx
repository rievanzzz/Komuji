import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCalendar, FiMapPin, FiUsers, FiClock, FiImage, FiUpload, FiFile, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

interface TicketCategory {
  id?: number;
  nama_kategori: string;
  deskripsi: string;
  harga: number;
  kuota: number;
  is_active: boolean;
}

interface Event {
  id?: number;
  kategori_id?: number;
  harga_tiket?: number;
  created_by?: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path?: string;
  sertifikat_template_path?: string;
  is_published?: boolean;
  approval_type?: 'auto' | 'manual';
  kuota: number;
  terdaftar?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  ticket_categories?: TicketCategory[];
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  editingEvent?: Event | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, editingEvent }) => {
  const [formData, setFormData] = useState<Event>({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi: '',
    kuota: 0,
    harga_tiket: 0,
    is_published: false,
    approval_type: 'auto',
    flyer_path: '',
    sertifikat_template_path: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string>('');
  const [certificatePreview, setCertificatePreview] = useState<string>('');
  const flyerInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  
  // Ticket categories state
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([
    {
      nama_kategori: 'Regular',
      deskripsi: 'Tiket reguler dengan akses penuh ke event',
      harga: 0,
      kuota: 100,
      is_active: true
    }
  ]);
  
  // Check if certain fields should be read-only
  const hasRegistrations = editingEvent && (editingEvent.terdaftar || 0) > 0;
  const isPublished = editingEvent && editingEvent.is_published;
  
  // Ticket category management functions
  const addTicketCategory = () => {
    setTicketCategories([...ticketCategories, {
      nama_kategori: '',
      deskripsi: '',
      harga: 0,
      kuota: 0,
      is_active: true
    }]);
  };

  const removeTicketCategory = (index: number) => {
    if (ticketCategories.length > 1) {
      setTicketCategories(ticketCategories.filter((_, i) => i !== index));
    }
  };

  const updateTicketCategory = (index: number, field: keyof TicketCategory, value: any) => {
    const updated = [...ticketCategories];
    updated[index] = { ...updated[index], [field]: value };
    setTicketCategories(updated);
  };

  // Helper function to check if a field should be disabled
  const isFieldDisabled = (fieldName: string) => {
    if (!editingEvent) return false;
    
    // Fields that cannot be changed if there are registrations
    const restrictedWithRegistrations = ['tanggal_mulai', 'tanggal_selesai', 'waktu_mulai', 'waktu_selesai'];
    
    // Fields that cannot be changed if event is published
    const restrictedWhenPublished = ['approval_type'];
    
    if (hasRegistrations && restrictedWithRegistrations.includes(fieldName)) {
      return true;
    }
    
    if (isPublished && restrictedWhenPublished.includes(fieldName)) {
      return true;
    }
    
    return false;
  };
  
  // Helper function to get disabled field message
  const getDisabledMessage = (fieldName: string) => {
    if (hasRegistrations && ['tanggal_mulai', 'tanggal_selesai', 'waktu_mulai', 'waktu_selesai'].includes(fieldName)) {
      return 'Tidak dapat diubah karena sudah ada peserta terdaftar';
    }
    if (isPublished && fieldName === 'approval_type') {
      return 'Tidak dapat diubah karena event sudah dipublikasi';
    }
    return '';
  };

  useEffect(() => {
    if (editingEvent) {
      // Handle date formatting safely
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // If it's already in YYYY-MM-DD format, return as is
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
        // If it contains 'T', split it
        if (dateStr.includes('T')) return dateStr.split('T')[0];
        // Try to parse and format
        try {
          return new Date(dateStr).toISOString().split('T')[0];
        } catch {
          return dateStr;
        }
      };

      setFormData({
        judul: editingEvent.judul || '',
        deskripsi: editingEvent.deskripsi || '',
        tanggal_mulai: formatDate(editingEvent.tanggal_mulai),
        tanggal_selesai: editingEvent.tanggal_selesai ? formatDate(editingEvent.tanggal_selesai) : '',
        waktu_mulai: editingEvent.waktu_mulai ? editingEvent.waktu_mulai.substring(0, 5) : '',
        waktu_selesai: editingEvent.waktu_selesai ? editingEvent.waktu_selesai.substring(0, 5) : '',
        lokasi: editingEvent.lokasi || '',
        kuota: editingEvent.kuota || 0,
        harga_tiket: editingEvent.harga_tiket || 0,
        is_published: editingEvent.is_published || false,
        approval_type: editingEvent.approval_type || 'auto',
        flyer_path: editingEvent.flyer_path || '',
        sertifikat_template_path: editingEvent.sertifikat_template_path || '',
        kategori_id: editingEvent.kategori_id || 1
      });
    } else {
      setFormData({
        judul: '',
        deskripsi: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        waktu_mulai: '',
        waktu_selesai: '',
        lokasi: '',
        kuota: 0,
        harga_tiket: 0,
        is_published: false,
        approval_type: 'auto',
        flyer_path: '',
        sertifikat_template_path: ''
      });
      setFlyerFile(null);
      setCertificateFile(null);
      setFlyerPreview('');
      setCertificatePreview('');
    }
    setErrors({});
  }, [editingEvent, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kuota' || name === 'harga_tiket' ? parseInt(value) || 0 : 
              name === 'is_published' ? value === 'true' : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'flyer' | 'certificate') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = type === 'flyer' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [type]: `Format file tidak didukung. ${type === 'flyer' ? 'Gunakan JPG, PNG, atau WebP' : 'Gunakan JPG, PNG, WebP, atau PDF'}`
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [type]: 'Ukuran file maksimal 5MB'
      }));
      return;
    }

    if (type === 'flyer') {
      setFlyerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFlyerPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setCertificateFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setCertificatePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setCertificatePreview('');
      }
    }

    // Clear any existing errors
    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: ''
      }));
    }
  };

  const removeFile = (type: 'flyer' | 'certificate') => {
    if (type === 'flyer') {
      setFlyerFile(null);
      setFlyerPreview('');
      if (flyerInputRef.current) flyerInputRef.current.value = '';
    } else {
      setCertificateFile(null);
      setCertificatePreview('');
      if (certificateInputRef.current) certificateInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.judul.trim()) {
      newErrors.judul = 'Judul acara wajib diisi';
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi acara wajib diisi';
    }

    if (!formData.tanggal_mulai) {
      newErrors.tanggal_mulai = 'Tanggal mulai wajib diisi';
    }

    if (!formData.tanggal_selesai) {
      newErrors.tanggal_selesai = 'Tanggal selesai wajib diisi';
    }

    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      if (new Date(formData.tanggal_mulai) > new Date(formData.tanggal_selesai)) {
        newErrors.tanggal_selesai = 'Tanggal selesai harus setelah tanggal mulai';
      }
    }

    if (!formData.waktu_mulai) {
      newErrors.waktu_mulai = 'Waktu mulai wajib diisi';
    }

    if (!formData.waktu_selesai) {
      newErrors.waktu_selesai = 'Waktu selesai wajib diisi';
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Lokasi acara wajib diisi';
    }

    if (formData.kuota <= 0) {
      newErrors.kuota = 'Kuota harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingEvent 
        ? `http://localhost:8000/api/events/${editingEvent.id}`
        : 'http://localhost:8000/api/events';
      
      let method = editingEvent ? 'PUT' : 'POST';

      // Create FormData for file uploads
      const eventFormData = new FormData();
      
      // For edit, add _method: PUT for Laravel
      if (editingEvent) {
        eventFormData.append('_method', 'PUT');
        method = 'POST'; // Laravel expects POST with _method: PUT
      }
      
      // Add basic event data
      eventFormData.append('judul', formData.judul);
      eventFormData.append('deskripsi', formData.deskripsi);
      eventFormData.append('tanggal_mulai', formData.tanggal_mulai);
      if (formData.tanggal_selesai) {
        eventFormData.append('tanggal_selesai', formData.tanggal_selesai);
      }
      // Ensure time format is HH:MM (not HH:MM:SS)
      const formatTime = (time: string) => {
        if (!time) return '';
        return time.length > 5 ? time.substring(0, 5) : time;
      };
      
      eventFormData.append('waktu_mulai', formatTime(formData.waktu_mulai));
      eventFormData.append('waktu_selesai', formatTime(formData.waktu_selesai));
      eventFormData.append('lokasi', formData.lokasi);
      eventFormData.append('kuota', formData.kuota.toString());
      eventFormData.append('harga_tiket', (formData.harga_tiket || 0).toString());
      eventFormData.append('is_published', formData.is_published ? '1' : '0');
      eventFormData.append('approval_type', formData.approval_type || 'auto');
      
      // Add kategori_id
      eventFormData.append('kategori_id', (formData.kategori_id || editingEvent?.kategori_id || 1).toString());
      
      // Add files if selected
      if (flyerFile) {
        eventFormData.append('flyer', flyerFile);
      }
      if (certificateFile) {
        eventFormData.append('sertifikat_template', certificateFile);
      }

      console.log('Sending request to:', url);
      console.log('Method:', method);
      console.log('Is editing?', !!editingEvent);
      console.log('FormData contents:');
      for (let [key, value] of eventFormData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: eventFormData
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const savedEvent = await response.json();
        console.log('Event saved successfully:', savedEvent);
        console.log('Saved event data:', savedEvent.data);
        
        // Show success message
        alert(editingEvent ? 'Acara berhasil diperbarui!' : 'Acara berhasil dibuat!');
        
        // Call onSave callback with the actual event data
        onSave(savedEvent.data || savedEvent);
        
        // Close modal
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Gagal menyimpan acara' }));
        console.error('Save failed:', errorData);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        
        // Show detailed error message
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          setErrors({ general: errorMessages });
          alert('Validation Error: ' + errorMessages);
        } else {
          setErrors({ general: errorData.message || 'Gagal menyimpan acara' });
          alert('Error: ' + (errorData.message || 'Gagal menyimpan acara'));
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan acara' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Edit Acara' : 'Buat Acara Baru'}
              </h2>
              <p className="text-gray-600 mt-1">
                {editingEvent ? 'Perbarui informasi acara Anda' : 'Isi detail acara yang akan diselenggarakan'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Judul Acara *
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                  errors.judul ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Contoh: Workshop React Advanced untuk Developer"
              />
              {errors.judul && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.judul}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Deskripsi Acara *
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none ${
                  errors.deskripsi ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Jelaskan detail acara, materi yang akan dibahas, target peserta, dan informasi penting lainnya..."
              />
              {errors.deskripsi && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.deskripsi}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-blue-600" />
                Tanggal Mulai *
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleInputChange}
                disabled={isFieldDisabled('tanggal_mulai')}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  errors.tanggal_mulai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                } ${isFieldDisabled('tanggal_mulai') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              />
              {errors.tanggal_mulai && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.tanggal_mulai}</p>}
              {isFieldDisabled('tanggal_mulai') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('tanggal_mulai')}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-blue-600" />
                Tanggal Selesai *
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleInputChange}
                disabled={isFieldDisabled('tanggal_selesai')}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  errors.tanggal_selesai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                } ${isFieldDisabled('tanggal_selesai') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              />
              {errors.tanggal_selesai && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.tanggal_selesai}</p>}
              {isFieldDisabled('tanggal_selesai') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('tanggal_selesai')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-blue-600" />
                Waktu Mulai *
              </label>
              <input
                type="time"
                name="waktu_mulai"
                value={formData.waktu_mulai}
                onChange={handleInputChange}
                disabled={isFieldDisabled('waktu_mulai')}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  errors.waktu_mulai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                } ${isFieldDisabled('waktu_mulai') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              />
              {errors.waktu_mulai && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.waktu_mulai}</p>}
              {isFieldDisabled('waktu_mulai') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('waktu_mulai')}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-blue-600" />
                Waktu Selesai *
              </label>
              <input
                type="time"
                name="waktu_selesai"
                value={formData.waktu_selesai}
                onChange={handleInputChange}
                disabled={isFieldDisabled('waktu_selesai')}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  errors.waktu_selesai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                } ${isFieldDisabled('waktu_selesai') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              />
              {errors.waktu_selesai && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.waktu_selesai}</p>}
              {isFieldDisabled('waktu_selesai') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('waktu_selesai')}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-blue-600" />
              Lokasi Acara *
            </label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleInputChange}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                errors.lokasi ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Contoh: Auditorium Utama, Gedung A Lantai 3, atau Online via Zoom"
            />
            {errors.lokasi && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.lokasi}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-blue-600" />
                Kuota Peserta *
              </label>
              <input
                type="number"
                name="kuota"
                value={formData.kuota}
                onChange={handleInputChange}
                min={editingEvent ? (editingEvent.terdaftar || 1) : 1}
                disabled={isFieldDisabled('kuota')}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                  errors.kuota ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                } ${isFieldDisabled('kuota') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                placeholder="Contoh: 50"
              />
              {errors.kuota && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.kuota}</p>}
              {isFieldDisabled('kuota') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('kuota')}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Status Publikasi
              </label>
              <select
                name="is_published"
                value={formData.is_published ? 'true' : 'false'}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 hover:border-gray-300 appearance-none bg-white"
              >
                <option value="false">📝 Draft - Belum dipublikasi</option>
                <option value="true">🚀 Publikasi - Dapat dilihat peserta</option>
              </select>
            </div>
          </div>

          {/* Ticket Categories Section - Full Width */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-800">
                Kategori Tiket *
              </label>
              <button
                type="button"
                onClick={addTicketCategory}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus size={16} />
                Tambah Kategori
              </button>
            </div>
            
            <div className="space-y-4">
              {ticketCategories.map((category, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Kategori {index + 1}</h4>
                    {ticketCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketCategory(index)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <FiMinus size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Kategori *
                      </label>
                      <input
                        type="text"
                        value={category.nama_kategori}
                        onChange={(e) => updateTicketCategory(index, 'nama_kategori', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900"
                        placeholder="Contoh: Regular, VIP, Early Bird"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga (Rp) *
                      </label>
                      <input
                        type="number"
                        value={category.harga}
                        onChange={(e) => updateTicketCategory(index, 'harga', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900"
                        placeholder="0 untuk gratis"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kuota *
                      </label>
                      <input
                        type="number"
                        value={category.kuota}
                        onChange={(e) => updateTicketCategory(index, 'kuota', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900"
                        placeholder="Jumlah tiket tersedia"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={category.is_active ? 'true' : 'false'}
                        onChange={(e) => updateTicketCategory(index, 'is_active', e.target.value === 'true')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 appearance-none bg-white"
                      >
                        <option value="true">✅ Aktif</option>
                        <option value="false">❌ Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={category.deskripsi}
                      onChange={(e) => updateTicketCategory(index, 'deskripsi', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none"
                      placeholder="Deskripsi kategori tiket (opsional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Tipe Persetujuan Pendaftaran
            </label>
            <select
              name="approval_type"
              value={formData.approval_type || 'auto'}
              onChange={handleInputChange}
              disabled={isFieldDisabled('approval_type')}
              className={`w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 hover:border-gray-300 appearance-none bg-white ${
                isFieldDisabled('approval_type') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
              }`}
            >
              <option value="auto">⚡ Otomatis - Langsung diterima</option>
              <option value="manual">👤 Manual - Perlu persetujuan panitia</option>
            </select>
            {isFieldDisabled('approval_type') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('approval_type')}</p>}
          </div>

          {/* File Upload Section */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiImage className="w-5 h-5 text-blue-600" />
              Media & Dokumen
            </h3>
            
            {/* Flyer Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Flyer/Poster Acara (Opsional)
              </label>
              <div className="space-y-3">
                {flyerPreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={flyerPreview} 
                      alt="Flyer preview" 
                      className="w-32 h-40 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile('flyer')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => flyerInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium text-blue-600">Klik untuk upload</span>
                      <br />atau drag & drop file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                  </div>
                )}
                <input
                  ref={flyerInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, 'flyer')}
                  className="hidden"
                />
                {errors.flyer && <p className="text-red-500 text-sm">{errors.flyer}</p>}
              </div>
            </div>

            {/* Certificate Template Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Template Sertifikat (Opsional)
              </label>
              <div className="space-y-3">
                {certificateFile ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {certificatePreview ? (
                      <img 
                        src={certificatePreview} 
                        alt="Certificate preview" 
                        className="w-16 h-12 object-cover rounded border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <FiFile className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{certificateFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('certificate')}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => certificateInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <FiFile className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium text-blue-600">Klik untuk upload</span>
                      <br />atau drag & drop file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, PDF (Max 5MB)</p>
                  </div>
                )}
                <input
                  ref={certificateInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={(e) => handleFileChange(e, 'certificate')}
                  className="hidden"
                />
                {errors.certificate && <p className="text-red-500 text-sm">{errors.certificate}</p>}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white flex justify-end gap-4 pt-8 border-t border-gray-200 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  {editingEvent ? 'Update Acara' : 'Buat Acara'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;

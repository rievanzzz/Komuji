import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCalendar, FiMapPin, FiUsers, FiClock, FiImage, FiUpload, FiFile, FiTrash2, FiPlus, FiMinus, FiTag, FiBriefcase, FiCoffee, FiChevronDown } from 'react-icons/fi';
import { MdFamilyRestroom } from 'react-icons/md';

interface TicketCategory {
  id?: number;
  nama_kategori: string;
  deskripsi: string;
  harga: number;
  kuota: number;
  is_active: boolean;
}

interface CertificateTemplateItem {
  id: number;
  name: string;
  theme?: string;
  background_path?: string | null;
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
  certificate_template_id?: number;
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
    kategori_id: 1, // Default to first category
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi: '',
    kuota: 0, // Will be calculated from ticket categories
    harga_tiket: 0,
    is_published: false,
    approval_type: 'auto',
    flyer_path: '',
    sertifikat_template_path: ''
  });
  const [isSingleDay, setIsSingleDay] = useState(false);
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string>('');
  const [certificatePreview, setCertificatePreview] = useState<string>('');
  const flyerInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  // Certificate template selection
  const [certificateMode, setCertificateMode] = useState<'none'|'system'|'custom'>('none');
  const [systemTemplates, setSystemTemplates] = useState<CertificateTemplateItem[]>([]);
  const [selectedSystemTemplateId, setSelectedSystemTemplateId] = useState<number | ''>('');
  const [dbCategories, setDbCategories] = useState<Array<{ id: number; name: string }>>([]);

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

  const fetchTicketCategories = async (eventId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/ticket-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const categories = await response.json();
        if (categories.length > 0) {
          setTicketCategories(categories);
        }
      }
    } catch (error) {
      console.error('Error fetching ticket categories:', error);
    }
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
        kuota: 0, // Will be calculated from ticket categories
        harga_tiket: editingEvent.harga_tiket || 0,
        is_published: editingEvent.is_published || false,
        approval_type: editingEvent.approval_type || 'auto',
        flyer_path: editingEvent.flyer_path || '',
        sertifikat_template_path: editingEvent.sertifikat_template_path || '',
        kategori_id: editingEvent.kategori_id || 1
      });

      // Check if event is single day
      setIsSingleDay(editingEvent.tanggal_mulai === editingEvent.tanggal_selesai);

      // Check if event is open-ended (waktu_selesai is 23:59 or empty)
      setIsOpenEnded(!editingEvent.waktu_selesai || editingEvent.waktu_selesai === '23:59:00' || editingEvent.waktu_selesai === '23:59');

      // Load existing ticket categories if available
      if (editingEvent.ticket_categories && editingEvent.ticket_categories.length > 0) {
        setTicketCategories(editingEvent.ticket_categories);
      } else {
        // Fetch ticket categories from API
        fetchTicketCategories(editingEvent.id!);
      }

      // Prefill certificate mode for editing
      if (editingEvent.certificate_template_id) {
        setCertificateMode('system');
        setSelectedSystemTemplateId(editingEvent.certificate_template_id);
        setCertificateFile(null);
        setCertificatePreview('');
      } else if (editingEvent.sertifikat_template_path) {
        setCertificateMode('custom');
        setSelectedSystemTemplateId('');
      } else {
        setCertificateMode('none');
        setSelectedSystemTemplateId('');
        setCertificateFile(null);
        setCertificatePreview('');
      }
    } else {
      setFormData({
        judul: '',
        deskripsi: '',
        kategori_id: 1, // Default to first category
        tanggal_mulai: '',
        tanggal_selesai: '',
        waktu_mulai: '',
        waktu_selesai: '',
        lokasi: '',
        kuota: 0, // Will be calculated from ticket categories
        harga_tiket: 0,
        is_published: false,
        approval_type: 'auto',
        flyer_path: '',
        sertifikat_template_path: ''
      });

      // Reset ticket categories for new event
      setTicketCategories([
        {
          nama_kategori: 'Regular',
          deskripsi: 'Tiket reguler dengan akses penuh ke event',
          harga: 0,
          kuota: 100,
          is_active: true
        }
      ]);

      setFlyerFile(null);
      setCertificateFile(null);
      setFlyerPreview('');
      setCertificatePreview('');

      // Reset states for new event
      setIsSingleDay(false);
      setIsOpenEnded(false);
      setCertificateMode('none');
      setSelectedSystemTemplateId('');
    }
    setErrors({});
  }, [editingEvent, isOpen]);

  // Clear selections when switching certificate mode
  useEffect(() => {
    if (certificateMode === 'system') {
      // Clear custom file
      setCertificateFile(null);
      setCertificatePreview('');
      if (certificateInputRef.current) certificateInputRef.current.value = '';
    } else if (certificateMode === 'custom') {
      // Clear selected system template
      setSelectedSystemTemplateId('');
    } else if (certificateMode === 'none') {
      setSelectedSystemTemplateId('');
      setCertificateFile(null);
      setCertificatePreview('');
      if (certificateInputRef.current) certificateInputRef.current.value = '';
    }
  }, [certificateMode]);

  // Load system certificate templates when modal opens
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/organizer/certificate-templates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSystemTemplates(data.data || []);
        }
      } catch (e) {
        console.error('Load templates error', e);
      }
    };
    const loadCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categories');
        if (res.ok) {
          const data = await res.json();
          setDbCategories((data.data || []).map((c: any) => ({ id: c.id, name: c.name })));
        }
      } catch (e) {
        console.error('Load categories error', e);
      }
    };
    if (isOpen) {
      loadTemplates();
      loadCategories();
    }
  }, [isOpen]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };

    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-set tanggal_selesai when tanggal_mulai changes and isSingleDay is true
    if (name === 'tanggal_mulai' && isSingleDay) {
      setFormData(prev => ({
        ...prev,
        tanggal_mulai: value,
        tanggal_selesai: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSingleDayChange = (checked: boolean) => {
    setIsSingleDay(checked);
    if (checked && formData.tanggal_mulai) {
      setFormData(prev => ({
        ...prev,
        tanggal_selesai: prev.tanggal_mulai
      }));
    }
  };

  const handleOpenEndedChange = (checked: boolean) => {
    setIsOpenEnded(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        waktu_selesai: '23:59'
      }));
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      kategori_id: categoryId
    }));
    setCategoryDropdownOpen(false);

    // Clear error when category is selected
    if (errors.kategori_id) {
      setErrors(prev => ({
        ...prev,
        kategori_id: ''
      }));
    }
  };

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeString,
          label: displayTime
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Categories now loaded from DB via /api/categories

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

    if (!formData.kategori_id) {
      newErrors.kategori_id = 'Kategori event wajib dipilih';
    }

    if (!formData.tanggal_mulai) {
      newErrors.tanggal_mulai = 'Tanggal mulai wajib diisi';
    }

    if (!isSingleDay && !formData.tanggal_selesai) {
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

    if (!isOpenEnded && !formData.waktu_selesai) {
      newErrors.waktu_selesai = 'Waktu selesai wajib diisi';
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Lokasi acara wajib diisi';
    }

    // Validate ticket categories
    const totalQuota = ticketCategories.reduce((total, category) => total + (category.kuota || 0), 0);
    if (totalQuota <= 0) {
      newErrors.kuota = 'Total kuota dari kategori tiket harus lebih dari 0';
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
      // Calculate total quota from ticket categories
      const totalQuota = ticketCategories.reduce((total, category) => total + (category.kuota || 0), 0);
      eventFormData.append('kuota', totalQuota.toString());
      eventFormData.append('harga_tiket', (formData.harga_tiket || 0).toString());
      eventFormData.append('is_published', formData.is_published ? '1' : '0');
      eventFormData.append('approval_type', formData.approval_type || 'auto');
      // Certificate preference
      if (certificateMode === 'system' && selectedSystemTemplateId) {
        eventFormData.append('certificate_template_id', String(selectedSystemTemplateId));
      }

      // Add kategori_id
      eventFormData.append('kategori_id', (formData.kategori_id || editingEvent?.kategori_id || 1).toString());

      // Add ticket categories as JSON
      eventFormData.append('ticket_categories', JSON.stringify(ticketCategories));

      // Add files if selected
      if (flyerFile) {
        eventFormData.append('flyer', flyerFile);
      }
      if (certificateMode === 'custom' && certificateFile) {
        eventFormData.append('sertifikat_template', certificateFile);
      }
      if (certificateMode === 'none') {
        eventFormData.append('remove_certificate', '1');
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

            {/* Event Category */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiTag className="w-4 h-4 text-blue-600" />
                Kategori Event *
              </label>

              {/* Custom Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-left bg-white flex items-center justify-between ${
                    errors.kategori_id ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {formData.kategori_id && dbCategories.find(c => c.id === formData.kategori_id) ? (
                      <>
                        <FiTag className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900">
                          {dbCategories.find(c => c.id === formData.kategori_id)?.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">Pilih kategori event</span>
                    )}
                  </div>
                  <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    categoryDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Options */}
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                    {dbCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <FiTag className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900">{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {errors.kategori_id && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.kategori_id}</p>}
            </div>
          </div>

          {/* Date Duration Options */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Durasi Event</h3>
                <p className="text-sm text-gray-600">Pilih berapa hari event akan berlangsung</p>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  isSingleDay
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleSingleDayChange(true)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    isSingleDay ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {isSingleDay && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">Satu Hari</div>
                    <div className="text-sm text-gray-600 leading-relaxed">Event dimulai dan selesai di hari yang sama</div>
                  </div>
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  !isSingleDay
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleSingleDayChange(false)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    !isSingleDay ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {!isSingleDay && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">Multi Hari</div>
                    <div className="text-sm text-gray-600 leading-relaxed">Event berlangsung lebih dari satu hari</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
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
              <label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
                <FiCalendar className="w-4 h-4 text-blue-600" />
                Tanggal Selesai {!isSingleDay && '*'}
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleInputChange}
                disabled={isSingleDay || isFieldDisabled('tanggal_selesai')}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  errors.tanggal_selesai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                } ${(isSingleDay || isFieldDisabled('tanggal_selesai')) ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              />
              {errors.tanggal_selesai && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.tanggal_selesai}</p>}
              {isFieldDisabled('tanggal_selesai') && <p className="text-amber-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span>{getDisabledMessage('tanggal_selesai')}</p>}
              {isSingleDay && <p className="text-blue-600 text-sm mt-2 flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span>Tanggal selesai akan sama dengan tanggal mulai</p>}
            </div>
          </div>

          {/* Time Section with Professional Layout */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiClock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Waktu Pelaksanaan</h3>
                <p className="text-sm text-gray-600">Tentukan jadwal waktu event berlangsung</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Waktu Mulai *
                </label>
                <select
                  name="waktu_mulai"
                  value={formData.waktu_mulai}
                  onChange={handleInputChange}
                  disabled={isFieldDisabled('waktu_mulai')}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white ${
                    errors.waktu_mulai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                  } ${isFieldDisabled('waktu_mulai') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                >
                  <option value="">Pilih waktu mulai</option>
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.waktu_mulai && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.waktu_mulai}
                  </p>
                )}
                {isFieldDisabled('waktu_mulai') && (
                  <p className="text-amber-600 text-sm mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    {getDisabledMessage('waktu_mulai')}
                  </p>
                )}
              </div>

              {/* End Time Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Waktu Selesai {!isOpenEnded && '*'}
                </label>

                {/* Time Mode Selection */}
                <div className="space-y-4 mb-5">
                  <div
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      !isOpenEnded
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleOpenEndedChange(false)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        !isOpenEnded ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {!isOpenEnded && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">Waktu Tertentu</div>
                        <div className="text-sm text-gray-600 leading-relaxed">Event berakhir pada jam yang ditentukan</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      isOpenEnded
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleOpenEndedChange(true)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        isOpenEnded ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isOpenEnded && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">Sampai Selesai</div>
                        <div className="text-sm text-gray-600 leading-relaxed">Event berakhir ketika acara selesai</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Selector (only show if not open-ended) */}
                {!isOpenEnded && (
                  <select
                    name="waktu_selesai"
                    value={formData.waktu_selesai}
                    onChange={handleInputChange}
                    disabled={isFieldDisabled('waktu_selesai')}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white ${
                      errors.waktu_selesai ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                    } ${isFieldDisabled('waktu_selesai') ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                  >
                    <option value="">Pilih waktu selesai</option>
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Status Messages */}
                {errors.waktu_selesai && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.waktu_selesai}
                  </p>
                )}
                {isFieldDisabled('waktu_selesai') && (
                  <p className="text-amber-600 text-sm mt-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    {getDisabledMessage('waktu_selesai')}
                  </p>
                )}
                {isOpenEnded && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Event akan berlangsung sampai acara selesai secara alami
                    </p>
                  </div>
                )}
              </div>
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
                Total Kuota Peserta
              </label>
              <div className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-semibold text-lg">
                {ticketCategories.reduce((total, category) => total + (category.kuota || 0), 0)} peserta
              </div>
              <p className="text-xs text-gray-500 mt-2">Kuota otomatis terhitung dari total semua kategori tiket</p>
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

            {/* Certificate Template Choice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sertifikat Event (Opsional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <button type="button" onClick={() => setCertificateMode('none')} className={`rounded-lg border p-3 text-sm ${certificateMode==='none'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 hover:border-gray-300'}`}>Tidak Pakai Sertifikat</button>
                <button type="button" onClick={() => setCertificateMode('system')} className={`rounded-lg border p-3 text-sm ${certificateMode==='system'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 hover:border-gray-300'}`}>Template Sistem</button>
                <button type="button" onClick={() => setCertificateMode('custom')} className={`rounded-lg border p-3 text-sm ${certificateMode==='custom'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 hover:border-gray-300'}`}>Upload Template Sendiri</button>
              </div>

              {/* System template picker */}
              {certificateMode === 'system' && (
                <div className="space-y-3">
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={selectedSystemTemplateId}
                    onChange={(e)=> setSelectedSystemTemplateId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Pilih Template Sistem</option>
                    {systemTemplates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {selectedSystemTemplateId && (
                    <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                      {(() => {
                        const tpl = systemTemplates.find(x=> x.id === selectedSystemTemplateId);
                        const url = tpl?.background_path ? `http://localhost:8000/storage/${tpl.background_path}` : `http://localhost:8000/cert_templates/${tpl?.theme || 'minimal-modern'}.svg`;
                        return <img src={url} alt="preview" className="w-full max-h-64 object-contain rounded"/>;
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Custom template upload */}
              {certificateMode === 'custom' && (
                <div className="space-y-3">
                  {certificateFile ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {certificatePreview ? (
                        <img src={certificatePreview} alt="Certificate preview" className="w-16 h-12 object-cover rounded border border-gray-200" />
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
                        <br/>atau drag & drop file
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (disarankan untuk preview) / PDF (Max 5MB)</p>
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
              )}
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

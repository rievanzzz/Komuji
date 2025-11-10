import React, { useState } from 'react';
import { FiEdit3, FiSave, FiX, FiImage, FiType, FiMapPin } from 'react-icons/fi';

interface CertificateTemplateData {
  id?: number;
  name: string;
  background_color: string;
  background_image?: string;
  title: string;
  subtitle: string;
  content_template: string;
  signature_1_name: string;
  signature_1_title: string;
  signature_1_image?: string;
  signature_2_name?: string;
  signature_2_title?: string;
  signature_2_image?: string;
  logo_image?: string;
  border_style: 'none' | 'simple' | 'decorative';
  font_family: 'serif' | 'sans-serif' | 'script';
  primary_color: string;
  secondary_color: string;
  created_at?: string;
  updated_at?: string;
}

interface CertificateTemplateProps {
  template?: CertificateTemplateData;
  onSave: (template: CertificateTemplateData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  template,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CertificateTemplateData>({
    name: template?.name || '',
    background_color: template?.background_color || '#ffffff',
    background_image: template?.background_image || '',
    title: template?.title || 'SERTIFIKAT KEIKUTSERTAAN',
    subtitle: template?.subtitle || 'Certificate of Participation',
    content_template: template?.content_template || 'Diberikan kepada:\n\n{PARTICIPANT_NAME}\n\nYang telah mengikuti event:\n\n{EVENT_TITLE}\n\nPada tanggal {EVENT_DATE} di {EVENT_LOCATION}',
    signature_1_name: template?.signature_1_name || '',
    signature_1_title: template?.signature_1_title || '',
    signature_1_image: template?.signature_1_image || '',
    signature_2_name: template?.signature_2_name || '',
    signature_2_title: template?.signature_2_title || '',
    signature_2_image: template?.signature_2_image || '',
    logo_image: template?.logo_image || '',
    border_style: template?.border_style || 'simple',
    font_family: template?.font_family || 'serif',
    primary_color: template?.primary_color || '#1f2937',
    secondary_color: template?.secondary_color || '#6b7280',
    ...template
  });

  const [activeTab, setActiveTab] = useState<'design' | 'content' | 'signatures'>('design');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const getFontClass = (family: string) => {
    switch (family) {
      case 'serif': return 'font-serif';
      case 'sans-serif': return 'font-sans';
      case 'script': return 'font-mono'; // Placeholder for script font
      default: return 'font-serif';
    }
  };

  const getBorderClass = (style: string) => {
    switch (style) {
      case 'none': return '';
      case 'simple': return 'border-4 border-gray-800';
      case 'decorative': return 'border-8 border-double border-yellow-600';
      default: return 'border-4 border-gray-800';
    }
  };

  // Sample data for preview
  const sampleData = {
    PARTICIPANT_NAME: 'John Doe',
    EVENT_TITLE: 'Workshop React Development',
    EVENT_DATE: '15 November 2024',
    EVENT_LOCATION: 'Jakarta Convention Center'
  };

  const renderPreviewContent = (content: string) => {
    let rendered = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return rendered.split('\n').map((line, index) => (
      <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
        {line}
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Template Sertifikat' : 'Buat Template Sertifikat'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Simpan
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Batal
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('design')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'design'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'content'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Konten
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'signatures'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tanda Tangan
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'design' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Template
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama template sertifikat"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warna Background
                    </label>
                    <input
                      type="color"
                      name="background_color"
                      value={formData.background_color}
                      onChange={handleInputChange}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warna Utama
                    </label>
                    <input
                      type="color"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleInputChange}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    name="font_family"
                    value={formData.font_family}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="serif">Serif (Formal)</option>
                    <option value="sans-serif">Sans Serif (Modern)</option>
                    <option value="script">Script (Elegant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Style
                  </label>
                  <select
                    name="border_style"
                    value={formData.border_style}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Tanpa Border</option>
                    <option value="simple">Border Sederhana</option>
                    <option value="decorative">Border Dekoratif</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'content' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Sertifikat
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SERTIFIKAT KEIKUTSERTAAN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Certificate of Participation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Konten
                  </label>
                  <textarea
                    name="content_template"
                    value={formData.content_template}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gunakan placeholder: {PARTICIPANT_NAME}, {EVENT_TITLE}, {EVENT_DATE}, {EVENT_LOCATION}"
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">Placeholder yang tersedia:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code>{'{PARTICIPANT_NAME}'}</code> - Nama peserta</li>
                      <li><code>{'{EVENT_TITLE}'}</code> - Judul event</li>
                      <li><code>{'{EVENT_DATE}'}</code> - Tanggal event</li>
                      <li><code>{'{EVENT_LOCATION}'}</code> - Lokasi event</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'signatures' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Signature 1 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Tanda Tangan 1</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama
                      </label>
                      <input
                        type="text"
                        name="signature_1_name"
                        value={formData.signature_1_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama penandatangan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        name="signature_1_title"
                        value={formData.signature_1_title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jabatan penandatangan"
                      />
                    </div>
                  </div>

                  {/* Signature 2 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Tanda Tangan 2 (Opsional)</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama
                      </label>
                      <input
                        type="text"
                        name="signature_2_name"
                        value={formData.signature_2_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama penandatangan kedua"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        name="signature_2_title"
                        value={formData.signature_2_title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jabatan penandatangan kedua"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Sertifikat</h3>
          
          {/* Certificate Preview */}
          <div className="aspect-[4/3] border border-gray-300 rounded-lg overflow-hidden">
            <div
              className={`w-full h-full p-8 ${getFontClass(formData.font_family)} ${getBorderClass(formData.border_style)} flex flex-col justify-between`}
              style={{
                backgroundColor: formData.background_color,
                color: formData.primary_color
              }}
            >
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2" style={{ color: formData.primary_color }}>
                  {formData.title}
                </h1>
                <p className="text-sm" style={{ color: formData.secondary_color }}>
                  {formData.subtitle}
                </p>
              </div>

              {/* Content */}
              <div className="text-center flex-1 flex items-center justify-center">
                <div className="space-y-2 text-sm leading-relaxed">
                  {renderPreviewContent(formData.content_template)}
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end">
                {formData.signature_1_name && (
                  <div className="text-center">
                    <div className="w-24 h-12 border-b border-gray-400 mb-2"></div>
                    <div className="text-xs font-medium">{formData.signature_1_name}</div>
                    <div className="text-xs" style={{ color: formData.secondary_color }}>
                      {formData.signature_1_title}
                    </div>
                  </div>
                )}
                
                {formData.signature_2_name && (
                  <div className="text-center">
                    <div className="w-24 h-12 border-b border-gray-400 mb-2"></div>
                    <div className="text-xs font-medium">{formData.signature_2_name}</div>
                    <div className="text-xs" style={{ color: formData.secondary_color }}>
                      {formData.signature_2_title}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Preview menggunakan data contoh:</p>
            <ul className="space-y-1">
              <li>• Nama: {sampleData.PARTICIPANT_NAME}</li>
              <li>• Event: {sampleData.EVENT_TITLE}</li>
              <li>• Tanggal: {sampleData.EVENT_DATE}</li>
              <li>• Lokasi: {sampleData.EVENT_LOCATION}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;

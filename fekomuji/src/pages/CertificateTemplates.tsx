import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiCopy } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import CertificateTemplate from '../components/CertificateTemplate';

interface CertificateTemplateData {
  id: number;
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
  created_at: string;
  updated_at: string;
}

const CertificateTemplates: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [templates, setTemplates] = useState<CertificateTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplateData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
    }
  }, [isAuthenticated]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/certificate-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      } else {
        console.error('Failed to fetch templates');
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: Omit<CertificateTemplateData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = editingTemplate 
        ? `http://localhost:8000/api/certificate-templates/${editingTemplate.id}`
        : 'http://localhost:8000/api/certificate-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        await fetchTemplates();
        setShowEditor(false);
        setEditingTemplate(null);
      } else {
        console.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/certificate-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchTemplates();
        setDeleteConfirm(null);
      } else {
        console.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: CertificateTemplateData) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };
    
    await handleSaveTemplate(duplicatedTemplate);
  };

  const handleEditTemplate = (template: CertificateTemplateData) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login sebagai panitia untuk mengakses template sertifikat.</p>
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

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="pt-24 pb-16">
          <CertificateTemplate
            template={editingTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={() => {
              setShowEditor(false);
              setEditingTemplate(null);
            }}
            isEditing={!!editingTemplate}
          />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat template sertifikat...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Template Sertifikat</h1>
                <p className="text-gray-600 mt-2">Kelola template sertifikat untuk event Anda</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Buat Template Baru
              </button>
            </div>
          </motion.div>

          {/* Templates Grid */}
          {templates.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Template Preview */}
                  <div className="aspect-[4/3] bg-gray-50 p-4">
                    <div
                      className="w-full h-full rounded border text-xs flex flex-col justify-between p-2"
                      style={{
                        backgroundColor: template.background_color,
                        color: template.primary_color,
                        fontFamily: template.font_family === 'serif' ? 'serif' : 
                                   template.font_family === 'sans-serif' ? 'sans-serif' : 'monospace'
                      }}
                    >
                      <div className="text-center">
                        <div className="font-bold text-[8px] mb-1">{template.title}</div>
                        <div className="text-[6px]" style={{ color: template.secondary_color }}>
                          {template.subtitle}
                        </div>
                      </div>
                      <div className="text-center text-[6px] leading-tight">
                        <div>Diberikan kepada:</div>
                        <div className="font-bold">John Doe</div>
                        <div>Workshop React Development</div>
                      </div>
                      <div className="flex justify-between text-[5px]">
                        {template.signature_1_name && (
                          <div className="text-center">
                            <div className="w-8 h-2 border-b border-gray-400 mb-1"></div>
                            <div>{template.signature_1_name}</div>
                          </div>
                        )}
                        {template.signature_2_name && (
                          <div className="text-center">
                            <div className="w-8 h-2 border-b border-gray-400 mb-1"></div>
                            <div>{template.signature_2_name}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <div>Font: {template.font_family}</div>
                      <div>Border: {template.border_style}</div>
                      <div>Dibuat: {new Date(template.created_at).toLocaleDateString('id-ID')}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEdit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(template.id)}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiEye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Template</h3>
              <p className="text-gray-500 mb-6">Buat template sertifikat pertama Anda untuk event</p>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Buat Template Pertama
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <PublicFooter />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hapus Template</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteTemplate(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplates;

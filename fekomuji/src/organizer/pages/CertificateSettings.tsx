import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerLayout from '../components/OrganizerLayout';
import { FiSave, FiEye, FiArrowLeft } from 'react-icons/fi';

interface TemplateItem {
  id: number;
  name: string;
  theme?: string;
  background_path?: string | null;
  default_config?: any;
}

interface SettingsData {
  id: number;
  judul: string;
  has_certificate?: boolean;
  certificate_template_id?: number | null;
  manual_issue?: boolean;
  allow_certificate_reject?: boolean;
  certificate_signature_name?: string | null;
  certificate_signature_title?: string | null;
  certificate_signature_image_path?: string | null;
  certificate_date?: string | null;
  certificate_layout_config?: any | null;
}

const CertificateSettings: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [layout, setLayout] = useState<any>({});
  const [sigImage, setSigImage] = useState<File | null>(null);
  const [displayNamePreview, setDisplayNamePreview] = useState('John Doe');
  const [backgroundMode, setBackgroundMode] = useState<'system'|'upload'|'none'>('system');
  const [templateName, setTemplateName] = useState('');
  const [bgUpload, setBgUpload] = useState<File | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = useMemo(() => localStorage.getItem('token'), []);

  // Compute selected template early to avoid TDZ in hooks below
  const selectedTemplate = useMemo(() => templates.find(t => t.id === settings?.certificate_template_id), [templates, settings]);

  useEffect(() => {
    const run = async () => {
      try {
        const [tplRes, setRes] = await Promise.all([
          fetch(`http://localhost:8000/api/organizer/certificate-templates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8000/api/organizer/events/${eventId}/certificates/settings`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }),
        ]);
        if (tplRes.ok) {
          const tpl = await tplRes.json();
          setTemplates(tpl.data || []);
        }
        if (setRes.ok) {
          const s = await setRes.json();
          const data = s.data as SettingsData;
          setSettings(data);
          // fallback to template's default_config if layout not set yet
          const tplDefault = (templates.find(t => t.id === data.certificate_template_id)?.default_config) || undefined;
          setLayout(data.certificate_layout_config ?? (tplDefault ?? {}));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (token) run();
  }, [eventId, token]);

  // When template changes, prefill layout with its default_config if layout empty
  useEffect(() => {
    if (!selectedTemplate) return;
    setLayout((prev: any) => (prev && Object.keys(prev).length > 0) ? prev : (selectedTemplate.default_config || {}));
  }, [selectedTemplate?.id]);

  const pageSize = useMemo(() => {
    const cfg = (layout && layout.page) || (selectedTemplate?.default_config as any)?.page || { width: 1123, height: 794 };
    return { width: cfg.width || 1123, height: cfg.height || 794 };
  }, [layout, selectedTemplate]);

  const useBackground = useMemo(() => {
    const v = (layout?.use_background);
    return v === undefined ? true : !!v;
  }, [layout]);

  const bgUrl = useMemo(() => {
    if (!useBackground) return '';
    if (selectedTemplate?.background_path) {
      return `http://localhost:8000/storage/${selectedTemplate.background_path}`;
    }
    const theme = selectedTemplate?.theme || 'minimal-modern';
    return `http://localhost:8000/cert_templates/${theme}.svg`;
  }, [selectedTemplate, useBackground]);

  const field = (key: string) => ({
    ...(selectedTemplate?.default_config?.fields?.[key] || {}),
    ...(layout?.fields?.[key] || {}),
  });

  const fontSize = (group: 'title' | 'name' | 'meta') => {
    const l = (layout?.fonts?.[group]?.size) ?? (selectedTemplate?.default_config?.fonts?.[group]?.size);
    return l ?? (group === 'name' ? 36 : group === 'title' ? 28 : 14);
  };

  const updateFont = (group: 'title'|'name'|'meta', size: number) => {
    setLayout((prev: any) => ({
      ...(prev || {}),
      fonts: {
        ...((prev || {}).fonts || {}),
        [group]: { ...(((prev || {}).fonts || {})[group] || {}), size }
      }
    }));
  };

  const updateField = (group: string, key: string, value: any) => {
    setLayout((prev: any) => ({
      ...(prev || {}),
      fields: {
        ...((prev || {}).fields || {}),
        [group]: { ...(((prev || {}).fields || {})[group] || {}), [key]: value },
      },
    }));
  };

  const nudge = (group: string, axis: 'x'|'y', delta: number) => {
    const current = (layout?.fields?.[group]?.[axis]) ?? 0;
    updateField(group, axis, Number(current) + delta);
  };

  const toggleUseBackground = (checked: boolean) => {
    setLayout((prev: any) => ({ ...(prev || {}), use_background: checked }));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const form = new FormData();
      if (settings.certificate_template_id) form.append('certificate_template_id', String(settings.certificate_template_id));
      form.append('manual_issue', String(settings.manual_issue ? 1 : 0));
      form.append('allow_certificate_reject', String(settings.allow_certificate_reject ? 1 : 0));
      if (settings.certificate_signature_name) form.append('certificate_signature_name', settings.certificate_signature_name);
      if (settings.certificate_signature_title) form.append('certificate_signature_title', settings.certificate_signature_title);
      if (settings.certificate_date) form.append('certificate_date', settings.certificate_date);
      form.append('certificate_layout_config', JSON.stringify(layout || {}));
      if (sigImage) form.append('certificate_signature_image', sigImage);

      const res = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/certificates/settings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Pengaturan sertifikat disimpan');
        setSettings(data.data);
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/certificates/preview`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayNamePreview }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        alert(e.message || 'Gagal membuat pratinjau');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetLayout = () => {
    if (!selectedTemplate) return;
    setLayout(selectedTemplate.default_config || {});
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert('Nama template wajib diisi');
      return;
    }
    setSavingTemplate(true);
    try {
      const form = new FormData();
      form.append('name', templateName.trim());
      form.append('default_config', JSON.stringify(layout || {}));
      if (backgroundMode === 'upload' && bgUpload) {
        form.append('background', bgUpload);
      } else if (backgroundMode === 'system' && selectedTemplate?.theme) {
        form.append('theme', selectedTemplate.theme);
      }

      const res = await fetch(`http://localhost:8000/api/organizer/certificate-templates`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Gagal menyimpan template');
        return;
      }
      setTemplates(prev => [...prev, data.data]);
      setSettings(prev => prev ? { ...prev, certificate_template_id: data.data.id, has_certificate: true } : prev);
      alert('Template berhasil disimpan');
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan template');
    } finally {
      setSavingTemplate(false);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Pengaturan Sertifikat">
        <div className="min-h-[60vh] flex items-center justify-center">Memuat...</div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Pengaturan Sertifikat">
      <div className="max-w-5xl mx-auto p-6">
        <button onClick={() => navigate(`/organizer/events/${eventId}`)} className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"><FiArrowLeft />Kembali</button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold mb-4">Template</h2>
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={settings?.certificate_template_id ?? ''}
            onChange={(e) => setSettings(prev => prev ? { ...prev, certificate_template_id: e.target.value ? Number(e.target.value) : undefined, has_certificate: !!e.target.value } : prev)}
          >
            <option value="">Pilih Template</option>
            {templates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>

          {/* Live preview canvas */}
          {selectedTemplate && (
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">Pratinjau Template</div>
              <div className="border rounded-xl overflow-hidden bg-gray-100 w-full">
                <div
                  className="relative mx-auto"
                  style={{
                    width: Math.round(pageSize.width * 0.6),
                    height: Math.round(pageSize.height * 0.6),
                    backgroundImage: useBackground && bgUrl ? `url(${bgUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {/* overlays */}
                  <div
                    style={{ position: 'absolute', left: (field('event_title').x || 80) * 0.6, top: (field('event_title').y || 90) * 0.6, fontSize: fontSize('title') * 0.6, fontWeight: 700, color: '#111827' }}
                  >{settings?.judul || 'Judul Event'}</div>
                  <div
                    style={{ position: 'absolute', left: (field('certificate_number').x || 80) * 0.6, top: (field('certificate_number').y || 140) * 0.6, fontSize: fontSize('meta') * 0.6, fontWeight: 500, color: '#374151' }}
                  >No: PREVIEW-XXXX</div>
                  <div
                    style={{ position: 'absolute', left: (field('participant_name').x || 80) * 0.6, top: (field('participant_name').y || 250) * 0.6, fontSize: fontSize('name') * 0.6, fontWeight: 800, color: '#111827' }}
                  >{displayNamePreview}</div>
                  <div
                    style={{ position: 'absolute', left: (field('date').x || 80) * 0.6, top: (field('date').y || 310) * 0.6, fontSize: fontSize('meta') * 0.6, fontWeight: 500, color: '#374151' }}
                  >{settings?.certificate_date || new Date().toISOString().slice(0,10)}</div>
                  {settings?.certificate_signature_image_path && (
                    <img
                      src={`http://localhost:8000/storage/${settings.certificate_signature_image_path}`}
                      alt="signature"
                      style={{ position: 'absolute', left: (field('signature_image').x || 800) * 0.6, top: (field('signature_image').y || 520) * 0.6, width: (field('signature_image').width || 200) * 0.6, height: (field('signature_image').height || 80) * 0.6, objectFit: 'contain' }}
                    />
                  )}
                  <div
                    style={{ position: 'absolute', left: (field('signature_name').x || 800) * 0.6, top: (field('signature_name').y || 610) * 0.6, fontSize: fontSize('meta') * 0.6, fontWeight: 500, color: '#374151', textAlign: 'center', transform: 'translateX(-50%)' }}
                  >{settings?.certificate_signature_name || 'Nama Penandatangan'}</div>
                  <div
                    style={{ position: 'absolute', left: (field('signature_title').x || 800) * 0.6, top: (field('signature_title').y || 640) * 0.6, fontSize: fontSize('meta') * 0.6, fontWeight: 500, color: '#6b7280', textAlign: 'center', transform: 'translateX(-50%)' }}
                  >{settings?.certificate_signature_title || 'Jabatan'}</div>
                </div>
              </div>
            </div>
          )}
          {/* Use background toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input id="usebg" type="checkbox" checked={useBackground} onChange={(e)=> toggleUseBackground(e.target.checked)} />
            <label htmlFor="usebg">Gunakan gambar background piagam</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Informasi Penandatangan</h2>
            <div className="space-y-3">
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="Nama Penandatangan" value={settings?.certificate_signature_name || ''} onChange={(e)=> setSettings(prev=> prev? {...prev, certificate_signature_name: e.target.value }: prev)} />
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="Jabatan Penandatangan" value={settings?.certificate_signature_title || ''} onChange={(e)=> setSettings(prev=> prev? {...prev, certificate_signature_title: e.target.value }: prev)} />
              <input className="border rounded-lg px-3 py-2 w-full" type="date" value={settings?.certificate_date || ''} onChange={(e)=> setSettings(prev=> prev? {...prev, certificate_date: e.target.value }: prev)} />
              <input className="border rounded-lg px-3 py-2 w-full" type="file" accept="image/*" onChange={(e)=> setSigImage(e.target.files?.[0] || null)} />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!settings?.manual_issue} onChange={(e)=> setSettings(prev=> prev? {...prev, manual_issue: e.target.checked }: prev)} /> Terbitkan manual satu-per-satu</label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!settings?.allow_certificate_reject} onChange={(e)=> setSettings(prev=> prev? {...prev, allow_certificate_reject: e.target.checked }: prev)} /> Izinkan penolakan sertifikat</label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="flex items-center gap-3 mb-3">
              <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Nama peserta untuk preview" value={displayNamePreview} onChange={(e)=> setDisplayNamePreview(e.target.value)} />
              <button onClick={handlePreview} className="px-4 py-2 bg-gray-800 text-white rounded-lg inline-flex items-center gap-2"><FiEye /> Preview</button>
            </div>
            <p className="text-sm text-gray-500">Preview menggunakan konfigurasi saat ini.</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={handleResetLayout} className="px-3 py-2 border rounded">Reset ke Default</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <h2 className="text-lg font-semibold mb-4">Pengaturan Posisi (mudah)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['event_title','participant_name','certificate_number','date'].map((key)=> (
              <div key={key} className="space-y-2">
                <div className="font-medium capitalize">{key.replace('_',' ')}</div>
                <div className="grid grid-cols-3 gap-3">
                  <input className="border rounded-lg px-3 py-2" placeholder="X" type="number" value={layout?.fields?.[key]?.x ?? ''} onChange={(e)=> updateField(key,'x', Number(e.target.value))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Y" type="number" value={layout?.fields?.[key]?.y ?? ''} onChange={(e)=> updateField(key,'y', Number(e.target.value))} />
                  <select className="border rounded-lg px-3 py-2" value={layout?.fields?.[key]?.align ?? 'left'} onChange={(e)=> updateField(key,'align', e.target.value)}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'x',-5);}}>◀︎</button>
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'y',-5);}}>▲</button>
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'y',5);}}>▼</button>
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'x',5);}}>▶︎</button>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <div className="font-medium">signature_image</div>
              <div className="grid grid-cols-4 gap-3">
                <input className="border rounded-lg px-3 py-2" placeholder="X" type="number" value={layout?.fields?.signature_image?.x ?? ''} onChange={(e)=> updateField('signature_image','x', Number(e.target.value))} />
                <input className="border rounded-lg px-3 py-2" placeholder="Y" type="number" value={layout?.fields?.signature_image?.y ?? ''} onChange={(e)=> updateField('signature_image','y', Number(e.target.value))} />
                <input className="border rounded-lg px-3 py-2" placeholder="W" type="number" value={layout?.fields?.signature_image?.width ?? ''} onChange={(e)=> updateField('signature_image','width', Number(e.target.value))} />
                <input className="border rounded-lg px-3 py-2" placeholder="H" type="number" value={layout?.fields?.signature_image?.height ?? ''} onChange={(e)=> updateField('signature_image','height', Number(e.target.value))} />
              </div>
              <div className="flex gap-2 text-sm">
                <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge('signature_image','x',-5);}}>◀︎</button>
                <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge('signature_image','y',-5);}}>▲</button>
                <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge('signature_image','y',5);}}>▼</button>
                <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge('signature_image','x',5);}}>▶︎</button>
              </div>
            </div>
            {['signature_name','signature_title'].map((key)=> (
              <div key={key} className="space-y-2">
                <div className="font-medium">{key}</div>
                <div className="grid grid-cols-3 gap-3">
                  <input className="border rounded-lg px-3 py-2" placeholder="X" type="number" value={layout?.fields?.[key]?.x ?? ''} onChange={(e)=> updateField(key,'x', Number(e.target.value))} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Y" type="number" value={layout?.fields?.[key]?.y ?? ''} onChange={(e)=> updateField(key,'y', Number(e.target.value))} />
                  <select className="border rounded-lg px-3 py-2" value={layout?.fields?.[key]?.align ?? 'center'} onChange={(e)=> updateField(key,'align', e.target.value)}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'x',-5);}}>◀︎</button>
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'y',-5);}}>▲</button>
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'y',5);}}>▼</button>
                  <button className="px-2 py-1 border rounded" onClick={(e)=> {e.preventDefault(); nudge(key,'x',5);}}>▶︎</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Ukuran Font</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-700 mb-1">Title</div>
                <input className="border rounded-lg px-3 py-2 w-full" type="number" value={fontSize('title')} onChange={(e)=> updateFont('title', Number(e.target.value))} />
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">Nama</div>
                <input className="border rounded-lg px-3 py-2 w-full" type="number" value={fontSize('name')} onChange={(e)=> updateFont('name', Number(e.target.value))} />
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">Meta</div>
                <input className="border rounded-lg px-3 py-2 w-full" type="number" value={fontSize('meta')} onChange={(e)=> updateFont('meta', Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        {/* Save current settings */}
        <div className="mt-6 flex justify-end">
          <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2"><FiSave /> Simpan</button>
        </div>

        {/* Save as template */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <h2 className="text-lg font-semibold mb-4">Simpan sebagai Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <div className="text-sm text-gray-700 mb-1">Nama Template</div>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="Contoh: Navy Gold" value={templateName} onChange={(e)=> setTemplateName(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-gray-700 mb-1">Opsi Background</div>
              <select className="border rounded-lg px-3 py-2 w-full" value={backgroundMode} onChange={(e)=> setBackgroundMode(e.target.value as any)}>
                <option value="system">Gunakan tema sistem saat ini</option>
                <option value="upload">Upload background baru</option>
                <option value="none">Tanpa background</option>
              </select>
            </div>
            {backgroundMode === 'upload' && (
              <div>
                <div className="text-sm text-gray-700 mb-1">File Background</div>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e)=> setBgUpload(e.target.files?.[0] || null)} />
              </div>
            )}
          </div>
          <div className="mt-4">
            <button disabled={savingTemplate} onClick={handleSaveAsTemplate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Simpan Template</button>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default CertificateSettings;

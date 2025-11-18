import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerLayout from '../components/OrganizerLayout';
import { FiArrowLeft, FiCheck, FiEye, FiXCircle, FiSearch } from 'react-icons/fi';

interface IssuanceEventMeta {
  id: number;
  judul: string;
  certificate_template_id?: number | null;
  manual_issue?: boolean;
  allow_certificate_reject?: boolean;
}

interface IssuanceRow {
  registration_id: number;
  name: string | null;
  email: string | null;
  eligible: boolean;
  attendance_status?: 'pending' | 'checked_in' | 'checked_out' | null;
  certificate_status: 'pending' | 'generated' | 'rejected';
  certificate_file_url?: string | null;
  display_name?: string | null;
}

const CertificateIssuance: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [meta, setMeta] = useState<IssuanceEventMeta | null>(null);
  const [rows, setRows] = useState<IssuanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nameOverrides, setNameOverrides] = useState<Record<number, string>>({});

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchData = async () => {
    if (!token || !eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/certificates/issuance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ev = data.data.event as IssuanceEventMeta;
        const regs = data.data.registrations as IssuanceRow[];
        setMeta(ev);
        setRows(regs);
        const preset: Record<number, string> = {};
        regs.forEach(r => { if (r.display_name) preset[r.registration_id] = r.display_name; });
        setNameOverrides(preset);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [eventId]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q)
    );
  });

  const handlePreview = async (row: IssuanceRow) => {
    if (!token || !meta) return;
    try {
      const display_name = nameOverrides[row.registration_id] || row.name || 'Peserta';
      const res = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/certificates/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ display_name }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        alert(e.message || 'Gagal membuat pratinjau');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssue = async (row: IssuanceRow) => {
    if (!token || !meta) return;
    try {
      const display_name = nameOverrides[row.registration_id] || row.name || 'Peserta';
      const res = await fetch(`http://localhost:8000/api/organizer/registrations/${row.registration_id}/certificate/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ display_name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 409) {
        await fetchData();
      } else {
        alert(data.message || 'Gagal menerbitkan sertifikat');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (row: IssuanceRow) => {
    if (!token || !meta) return;
    const reason = prompt('Alasan penolakan sertifikat (opsional)') || '';
    try {
      const res = await fetch(`http://localhost:8000/api/organizer/registrations/${row.registration_id}/certificate/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchData();
      } else {
        alert(data.message || 'Gagal menolak sertifikat');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Terbitkan Sertifikat">
        <div className="min-h-[60vh] flex items-center justify-center">Memuat...</div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Terbitkan Sertifikat">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(`/organizer/events/${eventId}`)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"><FiArrowLeft />Kembali</button>
          <div className="text-sm text-gray-500">Template: {meta?.certificate_template_id ? 'Dipilih' : 'Belum dipilih'} • Manual issue: {meta?.manual_issue ? 'Ya' : 'Tidak'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border mb-4 flex items-center gap-3">
          <FiSearch className="text-gray-400" />
          <input className="flex-1 outline-none" placeholder="Cari peserta..." value={search} onChange={(e)=> setSearch(e.target.value)} />
          <button onClick={() => navigate(`/organizer/events/${eventId}/certificates/settings`)} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Pengaturan Sertifikat</button>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Peserta</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Kehadiran</th>
                <th className="text-left p-3">Status Sertifikat</th>
                <th className="text-left p-3">Nama di Sertifikat</th>
                <th className="text-left p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.registration_id} className="border-t">
                  <td className="p-3">{row.name || '-'}</td>
                  <td className="p-3 text-gray-600">{row.email || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${row.eligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {row.attendance_status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3">
                    {row.certificate_status === 'generated' && row.certificate_file_url ? (
                      <a className="text-blue-600 hover:underline" href={row.certificate_file_url} target="_blank" rel="noreferrer">Unduh</a>
                    ) : (
                      <span className="text-gray-600">{row.certificate_status}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <input
                      className="border rounded-lg px-2 py-1 w-full"
                      placeholder="Nama untuk dicetak"
                      value={nameOverrides[row.registration_id] ?? row.display_name ?? row.name ?? ''}
                      onChange={(e)=> setNameOverrides(prev => ({ ...prev, [row.registration_id]: e.target.value }))}
                      disabled={row.certificate_status !== 'pending'}
                    />
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {row.certificate_status === 'generated' ? (
                      <span className="inline-flex items-center gap-2 text-green-600"><FiCheck /> Selesai</span>
                    ) : row.certificate_status === 'rejected' ? (
                      <span className="inline-flex items-center gap-2 text-red-600"><FiXCircle /> Ditolak</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePreview(row)}
                          disabled={!meta?.certificate_template_id}
                          className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <FiEye /> Preview
                        </button>
                        <button
                          onClick={() => handleIssue(row)}
                          disabled={!row.eligible || !meta?.certificate_template_id || meta?.manual_issue === false}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <FiCheck /> Terbitkan
                        </button>
                        {meta?.allow_certificate_reject && (
                          <button
                            onClick={() => handleReject(row)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg inline-flex items-center gap-2"
                          >
                            <FiXCircle /> Tolak
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default CertificateIssuance;

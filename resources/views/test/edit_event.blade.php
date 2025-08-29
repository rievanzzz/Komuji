<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Event</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h2>Edit Event</h2>
        
        @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif
        
        @if($errors->any())
            <div class="alert alert-danger">
                <ul>
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('test.events.update', $event->id) }}" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            
            <div class="mb-3">
                <label for="judul" class="form-label">Judul Event</label>
                <input type="text" class="form-control" id="judul" name="judul" value="{{ old('judul', $event->judul) }}" required>
            </div>
            
            <div class="mb-3">
                <label for="deskripsi" class="form-label">Deskripsi</label>
                <textarea class="form-control" id="deskripsi" name="deskripsi" rows="3" required>{{ old('deskripsi', $event->deskripsi) }}</textarea>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="kategori_id" class="form-label">Kategori</label>
                    <select class="form-select" id="kategori_id" name="kategori_id" required>
                        <option value="">Pilih Kategori</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ $event->kategori_id == $category->id ? 'selected' : '' }}>
                                {{ $category->nama_kategori }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="harga_tiket" class="form-label">Harga Tiket (Rp)</label>
                    <input type="number" class="form-control" id="harga_tiket" name="harga_tiket" 
                           value="{{ old('harga_tiket', $event->harga_tiket) }}" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="tanggal_mulai" class="form-label">Tanggal Mulai</label>
                    <input type="date" class="form-control" id="tanggal_mulai" name="tanggal_mulai" 
                           value="{{ old('tanggal_mulai', $event->tanggal_mulai->format('Y-m-d')) }}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="tanggal_selesai" class="form-label">Tanggal Selesai</label>
                    <input type="date" class="form-control" id="tanggal_selesai" name="tanggal_selesai"
                           value="{{ old('tanggal_selesai', $event->tanggal_selesai ? $event->tanggal_selesai->format('Y-m-d') : '') }}" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="waktu_mulai" class="form-label">Waktu Mulai</label>
                    <input type="time" class="form-control" id="waktu_mulai" name="waktu_mulai" 
                           value="{{ old('waktu_mulai', $event->waktu_mulai) }}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="waktu_selesai" class="form-label">Waktu Selesai</label>
                    <input type="time" class="form-control" id="waktu_selesai" name="waktu_selesai"
                           value="{{ old('waktu_selesai', $event->waktu_selesai) }}" required>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="lokasi" class="form-label">Lokasi</label>
                <input type="text" class="form-control" id="lokasi" name="lokasi" 
                       value="{{ old('lokasi', $event->lokasi) }}" required>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="kuota" class="form-label">Kuota Peserta</label>
                    <input type="number" class="form-control" id="kuota" name="kuota" 
                           value="{{ old('kuota', $event->kuota) }}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="approval_type" class="form-label">Tipe Persetujuan</label>
                    <select class="form-select" id="approval_type" name="approval_type" required>
                        <option value="auto" {{ $event->approval_type == 'auto' ? 'selected' : '' }}>Otomatis Disetujui</option>
                        <option value="manual" {{ $event->approval_type == 'manual' ? 'selected' : '' }}>Manual (Perlu Persetujuan Panitia)</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="flyer" class="form-label">Poster Event (JPG/PNG, max 2MB)</label>
                <input type="file" class="form-control" id="flyer" name="flyer" accept="image/jpeg,image/png,image/jpg">
                <div class="form-text">Biarkan kosong jika tidak ingin mengubah poster. Format: JPG/PNG, Maksimal 2MB</div>
                @if($event->flyer_path)
                    <div class="mt-2">
                        <img src="{{ asset('storage/' . $event->flyer_path) }}" alt="Current Flyer" style="max-width: 200px;">
                    </div>
                @endif
            </div>
            
            <div class="mb-3">
                <label for="sertifikat_template" class="form-label">Template Sertifikat (PDF/DOC/DOCX, opsional)</label>
                <input type="file" class="form-control" id="sertifikat_template" name="sertifikat_template" 
                       accept=".pdf,.doc,.docx">
                <div class="form-text">Biarkan kosong jika tidak ingin mengubah template. Format: PDF/DOC/DOCX, Maksimal 5MB</div>
                @if($event->sertifikat_template_path)
                    <div class="mt-2">
                        <a href="{{ asset('storage/' . $event->sertifikat_template_path) }}" target="_blank" class="btn btn-sm btn-info">
                            Lihat Template Saat Ini
                        </a>
                    </div>
                @endif
            </div>
            
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="is_published" name="is_published" value="1" 
                       {{ $event->is_published ? 'checked' : '' }}>
                <label class="form-check-label" for="is_published">
                    Publikasikan Event
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary">Update Event</button>
            <a href="{{ route('test.events.create') }}" class="btn btn-secondary">Kembali</a>
        </form>
    </div>

    <script>
        // Set minimum date for tanggal_selesai to be same as tanggal_mulai
        document.getElementById('tanggal_mulai').addEventListener('change', function() {
            document.getElementById('tanggal_selesai').min = this.value;
            if (document.getElementById('tanggal_selesai').value < this.value) {
                document.getElementById('tanggal_selesai').value = this.value;
            }
        });
    </script>
</body>
</html>

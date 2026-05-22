<?php

namespace App\Http\Controllers;

use App\Enums\StatusNaskahEnum;
use App\Models\Arsip;
use App\Models\Naskah;
use App\Services\ActivityLogService;
use App\Services\NomorSuratService;
use App\Services\NotifikasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NaskahController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Naskah::with(['pembuat:id,nama_lengkap,peran', 'penyetuju:id,nama_lengkap']);

        // Filter berdasarkan jenis
        if ($request->filled('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Pencarian
        if ($request->filled('cari')) {
            $cari = $request->cari;
            $query->where(function ($q) use ($cari) {
                $q->where('perihal', 'like', "%{$cari}%")
                    ->orWhere('nomor_naskah', 'like', "%{$cari}%")
                    ->orWhere('pengirim', 'like', "%{$cari}%");
            });
        }

        // Sekretaris hanya lihat milik sendiri (untuk draft)
        $user = $request->user();
        if ($user->isSekretaris() && $request->jenis === 'draft') {
            $query->where('dibuat_oleh', $user->id);
        }

        $naskahs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_halaman', 15));

        return response()->json($naskahs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'perihal' => 'required|string|max:255',
            'jenis' => 'required|in:draft,masuk,keluar',
            'isi_naskah' => 'nullable|string',
            'tanggal_naskah' => 'nullable|date',
            'template_id' => 'nullable|uuid|exists:template_naskahs,id',
            'lampiran' => 'nullable|file|max:20480',
            // Khusus naskah masuk
            'nomor_surat_asal' => 'nullable|string|max:100',
            'tanggal_surat_asal' => 'nullable|date',
            'tanggal_terima' => 'nullable|date',
            'pengirim' => 'nullable|string|max:255',
        ]);

        $validated['dibuat_oleh'] = $request->user()->id;
        $validated['status'] = 'draft';

        // Handle file upload
        if ($request->hasFile('lampiran')) {
            $validated['file_path'] = $request->file('lampiran')->store('lampiran', 'local');
        }

        $naskah = Naskah::create($validated);

        ActivityLogService::log('BUAT_NASKAH', 'NASKAH', $naskah->id, [
            'jenis' => $naskah->jenis->value,
            'perihal' => $naskah->perihal,
        ]);

        // Notifikasi jika naskah masuk
        if ($naskah->jenis->value === 'masuk') {
            NotifikasiService::kirimKePimpinan(
                'Naskah Masuk Baru',
                "Naskah masuk baru: {$naskah->perihal}",
                'NASKAH_MASUK_BARU',
                $naskah->id
            );
        }

        return response()->json([
            'message' => 'Naskah berhasil dibuat',
            'naskah' => $naskah->load(['pembuat:id,nama_lengkap']),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $naskah = Naskah::with([
            'pembuat:id,nama_lengkap,peran',
            'penyetuju:id,nama_lengkap',
            'template:id,nama_template',
            'arsip',
            'disposisis.pengirim:id,nama_lengkap',
            'disposisis.penerima:id,nama_lengkap',
        ])->findOrFail($id);

        return response()->json($naskah);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $naskah = Naskah::findOrFail($id);
        $user = $request->user();

        // Hanya bisa edit jika masih draft atau ditolak
        if (!in_array($naskah->status, [StatusNaskahEnum::DRAFT, StatusNaskahEnum::DITOLAK])) {
            return response()->json(['message' => 'Naskah tidak dapat diedit pada status ini'], 403);
        }

        // Sekretaris hanya bisa edit miliknya
        if ($user->isSekretaris() && $naskah->dibuat_oleh !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk mengedit naskah ini'], 403);
        }

        $validated = $request->validate([
            'perihal' => 'sometimes|string|max:255',
            'isi_naskah' => 'nullable|string',
            'tanggal_naskah' => 'nullable|date',
            'lampiran' => 'nullable|file|max:20480',
            'nomor_surat_asal' => 'nullable|string|max:100',
            'tanggal_surat_asal' => 'nullable|date',
            'tanggal_terima' => 'nullable|date',
            'pengirim' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('lampiran')) {
            // Hapus file lama
            if ($naskah->file_path) {
                Storage::disk('local')->delete($naskah->file_path);
            }
            $validated['file_path'] = $request->file('lampiran')->store('lampiran', 'local');
        }

        // Reset status jika sebelumnya ditolak
        if ($naskah->status === StatusNaskahEnum::DITOLAK) {
            $validated['status'] = 'draft';
            $validated['catatan_penolakan'] = null;
        }

        $naskah->update($validated);

        ActivityLogService::log('EDIT_NASKAH', 'NASKAH', $naskah->id);

        return response()->json([
            'message' => 'Naskah berhasil diperbarui',
            'naskah' => $naskah->fresh(['pembuat:id,nama_lengkap']),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $naskah = Naskah::findOrFail($id);
        $user = $request->user();

        if ($naskah->status !== StatusNaskahEnum::DRAFT) {
            return response()->json(['message' => 'Hanya naskah draft yang dapat dihapus'], 403);
        }

        if ($user->isSekretaris() && $naskah->dibuat_oleh !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses'], 403);
        }

        if ($naskah->file_path) {
            Storage::disk('local')->delete($naskah->file_path);
        }

        ActivityLogService::log('HAPUS_NASKAH', 'NASKAH', $naskah->id, [
            'perihal' => $naskah->perihal,
        ]);

        $naskah->delete();

        return response()->json(['message' => 'Naskah berhasil dihapus']);
    }

    // --- Workflow Actions ---

    public function ajukan(Request $request, string $id): JsonResponse
    {
        $naskah = Naskah::findOrFail($id);

        if ($naskah->status !== StatusNaskahEnum::DRAFT) {
            return response()->json(['message' => 'Hanya naskah draft yang dapat diajukan'], 403);
        }

        $naskah->update(['status' => 'menunggu_verifikasi']);

        ActivityLogService::log('AJUKAN_NASKAH', 'NASKAH', $naskah->id);

        NotifikasiService::kirimKePimpinan(
            'Naskah Perlu Verifikasi',
            "Naskah \"{$naskah->perihal}\" menunggu verifikasi Anda",
            'NASKAH_PERLU_VERIFIKASI',
            $naskah->id
        );

        return response()->json(['message' => 'Naskah berhasil diajukan untuk verifikasi']);
    }

    public function setujui(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Ketufor/Waketufor yang dapat menyetujui'], 403);
        }

        $naskah = Naskah::findOrFail($id);

        if ($naskah->status !== StatusNaskahEnum::MENUNGGU_VERIFIKASI) {
            return response()->json(['message' => 'Naskah tidak dalam status menunggu verifikasi'], 403);
        }

        $naskah->update([
            'status' => 'disetujui',
            'disetujui_oleh' => $user->id,
        ]);

        ActivityLogService::log('SETUJUI_NASKAH', 'NASKAH', $naskah->id);

        NotifikasiService::kirim(
            $naskah->dibuat_oleh,
            'Naskah Disetujui',
            "Naskah \"{$naskah->perihal}\" telah disetujui oleh {$user->nama_lengkap}",
            'NASKAH_DISETUJUI',
            $naskah->id
        );

        return response()->json(['message' => 'Naskah berhasil disetujui']);
    }

    public function tolak(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Ketufor/Waketufor yang dapat menolak'], 403);
        }

        $request->validate(['catatan' => 'required|string']);

        $naskah = Naskah::findOrFail($id);

        if ($naskah->status !== StatusNaskahEnum::MENUNGGU_VERIFIKASI) {
            return response()->json(['message' => 'Naskah tidak dalam status menunggu verifikasi'], 403);
        }

        $naskah->update([
            'status' => 'ditolak',
            'catatan_penolakan' => $request->catatan,
        ]);

        ActivityLogService::log('TOLAK_NASKAH', 'NASKAH', $naskah->id, [
            'catatan' => $request->catatan,
        ]);

        NotifikasiService::kirim(
            $naskah->dibuat_oleh,
            'Naskah Ditolak',
            "Naskah \"{$naskah->perihal}\" ditolak. Catatan: {$request->catatan}",
            'NASKAH_DITOLAK',
            $naskah->id
        );

        return response()->json(['message' => 'Naskah berhasil ditolak']);
    }

    public function tandatangan(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Ketufor/Waketufor yang dapat menandatangani'], 403);
        }

        if (!$user->tanda_tangan_path) {
            return response()->json(['message' => 'Anda belum mengatur gambar tanda tangan. Silakan atur di menu Profil terlebih dahulu.'], 400);
        }

        $naskah = Naskah::findOrFail($id);

        if ($naskah->status !== \App\Enums\StatusNaskahEnum::DISETUJUI) {
            return response()->json(['message' => 'Naskah harus disetujui terlebih dahulu'], 403);
        }

        // Inject Signature
        $ttdUrl = asset('storage/' . $user->tanda_tangan_path);
        $ttdHtml = '<div style="margin-top: 15px;"><img src="' . $ttdUrl . '" alt="TTE" style="max-height: 100px; width: auto;" /><br/><span style="font-size: 11px; color: #64748b; font-family: sans-serif;">Ditandatangani secara elektronik oleh:<br/><strong>' . $user->nama_lengkap . '</strong></span></div>';
        
        $isiNaskah = $naskah->isi_naskah;
        if (str_contains($isiNaskah, '[TANDA_TANGAN]')) {
            $isiNaskah = str_replace('[TANDA_TANGAN]', $ttdHtml, $isiNaskah);
        } else {
            $isiNaskah .= $ttdHtml;
        }

        $naskah->update([
            'status' => 'ditandatangani',
            'isi_naskah' => $isiNaskah,
        ]);

        ActivityLogService::log('TANDATANGAN_NASKAH', 'NASKAH', $naskah->id);

        return response()->json(['message' => 'Naskah berhasil ditandatangani']);
    }

    public function kirim(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Ketufor/Waketufor yang dapat mengirim'], 403);
        }

        $naskah = Naskah::findOrFail($id);

        if ($naskah->status !== StatusNaskahEnum::DITANDATANGANI) {
            return response()->json(['message' => 'Naskah harus ditandatangani terlebih dahulu'], 403);
        }

        // Generate nomor surat otomatis
        $nomorSurat = NomorSuratService::generate();

        $naskah->update([
            'status' => 'terkirim',
            'jenis' => 'keluar',
            'nomor_naskah' => $nomorSurat,
        ]);

        // Auto arsipkan
        Arsip::create([
            'naskah_id' => $naskah->id,
            'kode_klasifikasi' => 'UMUM',
            'nama_berkas' => $naskah->perihal,
            'status_retensi' => 'aktif',
            'tanggal_aktif' => now()->toDateString(),
            'diberkaskan_oleh' => $user->id,
        ]);

        $naskah->update(['status' => 'diarsipkan']);

        ActivityLogService::log('KIRIM_NASKAH', 'NASKAH', $naskah->id, [
            'nomor_surat' => $nomorSurat,
        ]);

        return response()->json([
            'message' => 'Naskah berhasil dikirim dan diarsipkan',
            'nomor_surat' => $nomorSurat,
        ]);
    }

    public function arsipkan(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Ketufor/Waketufor yang dapat mengarsipkan langsung'], 403);
        }

        $naskah = Naskah::findOrFail($id);

        Arsip::create([
            'naskah_id' => $naskah->id,
            'kode_klasifikasi' => $request->input('kode_klasifikasi', 'UMUM'),
            'nama_berkas' => $request->input('nama_berkas', $naskah->perihal),
            'status_retensi' => 'aktif',
            'tanggal_aktif' => now()->toDateString(),
            'lokasi_fisik' => $request->input('lokasi_fisik'),
            'diberkaskan_oleh' => $user->id,
        ]);

        $naskah->update(['status' => 'diarsipkan']);

        ActivityLogService::log('ARSIPKAN_NASKAH', 'NASKAH', $naskah->id);

        return response()->json(['message' => 'Naskah berhasil diarsipkan']);
    }
}

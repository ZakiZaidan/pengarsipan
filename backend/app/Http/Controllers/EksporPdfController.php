<?php

namespace App\Http\Controllers;

use App\Models\EksporPdf;
use App\Models\Naskah;
use App\Models\Pengaturan;
use App\Services\ActivityLogService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EksporPdfController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EksporPdf::with([
            'naskah:id,perihal,nomor_naskah',
            'pengekspor:id,nama_lengkap',
        ]);

        $user = $request->user();
        if ($user->isSekretaris()) {
            $query->whereHas('naskah', function ($q) use ($user) {
                $q->where('dibuat_oleh', $user->id);
            });
        }

        $ekspors = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_halaman', 15));

        return response()->json($ekspors);
    }

    public function ekspor(Request $request, string $naskahId): JsonResponse
    {
        $naskah = Naskah::with('pembuat:id,nama_lengkap')->findOrFail($naskahId);
        $user = $request->user();

        // Sekretaris hanya bisa ekspor draft miliknya
        if ($user->isSekretaris() && $naskah->dibuat_oleh !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk mengekspor naskah ini'], 403);
        }

        $request->validate([
            'dengan_watermark' => 'boolean',
            'dengan_kop' => 'boolean',
            'teks_watermark' => 'nullable|string|max:100',
            'ukuran_kertas' => 'in:A4,F4',
        ]);

        $denganWatermark = $request->boolean('dengan_watermark', false);
        $denganKop = $request->boolean('dengan_kop', true);
        $teksWatermark = $request->input('teks_watermark', Pengaturan::getValue('teks_watermark', 'RAHASIA'));
        $ukuranKertas = $request->input('ukuran_kertas', 'A4');

        $namaOrganisasi = Pengaturan::getValue('nama_organisasi', 'Organisasi');
        $alamat = Pengaturan::getValue('alamat_organisasi', '');
        $kopPath = Pengaturan::getValue('kop_path');

        $kopDataUrl = null;
        if ($kopPath && Storage::disk('public')->exists($kopPath)) {
            $path = Storage::disk('public')->path($kopPath);
            $type = pathinfo($path, PATHINFO_EXTENSION);
            $imgData = file_get_contents($path);
            $kopDataUrl = 'data:image/' . $type . ';base64,' . base64_encode($imgData);
        }

        // Konversi semua src gambar dalam isi_naskah ke base64
        // agar DomPDF bisa render gambar (TTD, stempel) tanpa HTTP request
        $isiNaskah = $this->convertImagesToBase64($naskah->isi_naskah);

        // Generate PDF
        $data = [
            'naskah'           => $naskah,
            'isi_naskah'       => $isiNaskah,
            'dengan_kop'       => $denganKop,
            'dengan_watermark' => $denganWatermark,
            'teks_watermark'   => $teksWatermark,
            'nama_organisasi'  => $namaOrganisasi,
            'alamat'           => $alamat,
            'kop_data_url'     => $kopDataUrl,
        ];

        $paperSize = $ukuranKertas === 'F4' ? [0, 0, 612, 936] : 'A4';

        $pdf = Pdf::loadView('pdf.naskah', $data);

        if ($ukuranKertas === 'F4') {
            $pdf->setPaper([0, 0, 612, 936]);
        } else {
            $pdf->setPaper('A4');
        }

        $fileName = 'ekspor_' . ($naskah->nomor_naskah ?? $naskah->id) . '_' . time() . '.pdf';
        $filePath = 'ekspor-pdf/' . $fileName;

        Storage::disk('local')->put($filePath, $pdf->output());

        $eksporPdf = EksporPdf::create([
            'naskah_id' => $naskah->id,
            'diekspor_oleh' => $user->id,
            'file_path' => $filePath,
            'dengan_watermark' => $denganWatermark,
            'dengan_kop' => $denganKop,
            'teks_watermark' => $teksWatermark,
            'ukuran_kertas' => $ukuranKertas,
        ]);

        ActivityLogService::log('EKSPOR_PDF', 'NASKAH', $naskah->id, [
            'file' => $fileName,
            'opsi' => [
                'watermark' => $denganWatermark,
                'kop' => $denganKop,
                'kertas' => $ukuranKertas,
            ],
        ]);

        return response()->json([
            'message' => 'PDF berhasil diekspor',
            'ekspor' => $eksporPdf,
            'download_url' => "/api/ekspor-pdf/{$eksporPdf->id}/download",
        ]);
    }

    public function download(string $id): BinaryFileResponse|JsonResponse
    {
        $eksporPdf = EksporPdf::findOrFail($id);

        $fullPath = Storage::disk('local')->path($eksporPdf->file_path);

        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        return response()->download($fullPath);
    }

    /**
     * Konversi semua src URL gambar di HTML menjadi base64 data URL
     * agar DomPDF bisa render gambar tanpa HTTP request.
     */
    private function convertImagesToBase64(?string $html): string
    {
        if (!$html) return '';

        // Temukan semua tag <img src="...">
        return preg_replace_callback(
            '/<img([^>]*?)src=["\']([^"\']+)["\']([^>]*?)>/i',
            function ($matches) {
                $before = $matches[1];
                $src    = $matches[2];
                $after  = $matches[3];

                // Jika sudah base64, biarkan
                if (str_starts_with($src, 'data:')) {
                    return $matches[0];
                }

                // Ekstrak path relatif dari URL /storage/xxx
                $storagePath = null;
                if (preg_match('#/storage/(.+)$#', $src, $m)) {
                    $storagePath = $m[1];
                }

                if ($storagePath && Storage::disk('public')->exists($storagePath)) {
                    $filePath = Storage::disk('public')->path($storagePath);
                    $ext      = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                    $mimeMap  = [
                        'jpg'  => 'image/jpeg',
                        'jpeg' => 'image/jpeg',
                        'png'  => 'image/png',
                        'gif'  => 'image/gif',
                        'webp' => 'image/webp',
                    ];
                    $mime    = $mimeMap[$ext] ?? 'image/png';
                    $b64     = base64_encode(file_get_contents($filePath));
                    $dataUrl = "data:{$mime};base64,{$b64}";

                    return "<img{$before}src=\"{$dataUrl}\"{$after}>";
                }

                // Tidak bisa dikonversi, kembalikan asli
                return $matches[0];
            },
            $html
        );
    }
}

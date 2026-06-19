<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            margin: 0;
            padding: 2px 7px 25px 7px;
            position: relative;
        }
        .kop {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .kop h2 {
            margin: 0;
            font-size: 16pt;
            text-transform: uppercase;
        }
        .kop p {
            margin: 2px 0;
            font-size: 10pt;
        }
        .watermark {
            position: fixed;
            top: 40%;
            left: 20%;
            font-size: 80pt;
            color: rgba(200, 200, 200, 0.3);
            transform: rotate(-45deg);
            z-index: -1;
            white-space: nowrap;
        }
        .content {
            line-height: 1.6;
        }
    </style>
</head>
<body>
    @if($dengan_watermark)
        <div class="watermark">{{ $teks_watermark }}</div>
    @endif

    @if($dengan_kop)
        @if(isset($kop_data_url) && $kop_data_url)
            <div style="text-align: center; margin-bottom: 10px;">
                <img src="{{ $kop_data_url }}" alt="Kop Surat" style="max-width: 100%; max-height: 160px;">
            </div>
        @else
            <div class="kop">
                <h2>{{ $nama_organisasi }}</h2>
                <p>{{ $alamat }}</p>
            </div>
        @endif
    @endif

    <div class="content">
        {!! $isi_naskah !!}
    </div>
</body>
</html>

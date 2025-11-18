<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Certificate</title>
    <style>
        @page { margin: 0; }
        body { margin: 0; font-family: 'Inter', Arial, sans-serif; }
        .page {
            position: relative;
            width: {{ data_get($snapshot, 'config.page.width', 1123) }}px;
            height: {{ data_get($snapshot, 'config.page.height', 794) }}px;
        }
        .bg {
            position: absolute; inset: 0; z-index: 0;
        }
        .content { position: absolute; inset: 0; z-index: 1; }
        .text { position: absolute; color: #111827; }
        .title { font-weight: 700; }
        .name { font-weight: 800; }
        .meta { font-weight: 500; }
        .center { text-align: center; transform: translateX(-50%); }
        .left { text-align: left; }
    </style>
</head>
<body>
    <div class="page">
        @php
            $useBg = data_get($snapshot, 'config.use_background', true);
            $theme = data_get($snapshot, 'theme');
            $bgPath = $useBg ? data_get($snapshot, 'background_path') : null;
            $bgUrl = null;
            if ($useBg) {
                $resolveRaster = function($path) {
                    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                    if ($ext === 'svg') return null; // DomPDF has limited SVG support
                    return file_exists($path) ? ('file://' . str_replace('\\', '/', $path)) : null;
                };

                if ($bgPath) {
                    $candidate = public_path('storage/' . $bgPath);
                    $bgUrl = $resolveRaster($candidate);
                }

                if (!$bgUrl && $theme) {
                    // Try PNG then JPG fallback for system themes
                    $png = public_path('cert_templates/' . $theme . '.png');
                    $jpg = public_path('cert_templates/' . $theme . '.jpg');
                    $jpeg = public_path('cert_templates/' . $theme . '.jpeg');
                    $svg = public_path('cert_templates/' . $theme . '.svg');
                    $bgUrl = $resolveRaster($png) ?: $resolveRaster($jpg) ?: $resolveRaster($jpeg);
                    // Skip SVG as background to avoid PDF crash
                    if (!$bgUrl && file_exists($svg)) {
                        $bgUrl = null;
                    }
                }
            }
            $cfg = data_get($snapshot, 'config.fields', []);
            $fonts = data_get($snapshot, 'config.fonts', []);
            $titleFont = data_get($fonts, 'title.size', 28);
            $nameFont = data_get($fonts, 'name.size', 36);
            $metaFont = data_get($fonts, 'meta.size', 14);
        @endphp

        @if($bgUrl)
            <img class="bg" src="{{ $bgUrl }}" alt="bg" />
        @endif

        <div class="content">
            {{-- Event title --}}
            @php $pos = data_get($cfg, 'event_title', ['x'=>80,'y'=>90,'align'=>'left']); @endphp
            <div class="text title {{ $pos['align'] === 'center' ? 'center' : 'left' }}" style="left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; font-size: {{ $titleFont }}px; @if($pos['align']==='center') left: {{ $pos['x'] }}px; @endif">
                {{ data_get($snapshot, 'event.title') }}
            </div>

            {{-- Certificate number --}}
            @php $pos = data_get($cfg, 'certificate_number', ['x'=>80,'y'=>140,'align'=>'left']); @endphp
            <div class="text meta {{ $pos['align'] === 'center' ? 'center' : 'left' }}" style="left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; font-size: {{ $metaFont }}px;">
                No: {{ $certificate_number }}
            </div>

            {{-- Participant name --}}
            @php $pos = data_get($cfg, 'participant_name', ['x'=>80,'y'=>250,'align'=>'left']); @endphp
            <div class="text name {{ $pos['align'] === 'center' ? 'center' : 'left' }}" style="left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; font-size: {{ $nameFont }}px;">
                {{ $display_name }}
            </div>

            {{-- Date --}}
            @php $pos = data_get($cfg, 'date', ['x'=>80,'y'=>310,'align'=>'left']); @endphp
            <div class="text meta {{ $pos['align'] === 'center' ? 'center' : 'left' }}" style="left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; font-size: {{ $metaFont }}px;">
                {{ data_get($snapshot, 'event.date') }}
            </div>

            {{-- Signature image --}}
            @php $pos = data_get($cfg, 'signature_image', ['x'=>800,'y'=>520,'width'=>200,'height'=>80]); @endphp
            @if(data_get($snapshot, 'signature.image'))
                @php $sigPath = public_path('storage/' . data_get($snapshot, 'signature.image')); @endphp
                @if(file_exists($sigPath))
                    <img src="{{ 'file://' . str_replace('\\', '/', $sigPath) }}" style="position:absolute; left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; width: {{ $pos['width'] }}px; height: {{ $pos['height'] }}px; object-fit: contain;" />
                @endif
            @endif

            {{-- Signature name --}}
            @php $pos = data_get($cfg, 'signature_name', ['x'=>800,'y'=>610,'align'=>'center']); @endphp
            <div class="text meta {{ $pos['align'] === 'center' ? 'center' : 'left' }}" style="left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; font-size: {{ $metaFont }}px;">
                {{ data_get($snapshot, 'signature.name') }}
            </div>

            {{-- Signature title --}}
            @php $pos = data_get($cfg, 'signature_title', ['x'=>800,'y'=>640,'align'=>'center']); @endphp
            <div class="text meta {{ $pos['align'] === 'center' ? 'center' : 'left' }}" style="left: {{ $pos['x'] }}px; top: {{ $pos['y'] }}px; font-size: {{ $metaFont }}px;">
                {{ data_get($snapshot, 'signature.title') }}
            </div>
        </div>
    </div>
</body>
</html>

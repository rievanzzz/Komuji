<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CertificateTemplate;

class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        // Minimal Modern
        CertificateTemplate::updateOrCreate(
            ['name' => 'Minimal Modern'],
            [
                'type' => 'system',
                'theme' => 'minimal-modern',
                'background_path' => null, // use CSS background or default asset
                'default_config' => [
                    'page' => ['width' => 1123, 'height' => 794], // A4 landscape px at 96dpi approx
                    'fonts' => [
                        'title' => ['family' => 'Inter', 'size' => 28, 'weight' => '700'],
                        'name' => ['family' => 'Inter', 'size' => 36, 'weight' => '800'],
                        'meta' => ['family' => 'Inter', 'size' => 14, 'weight' => '500'],
                    ],
                    'fields' => [
                        'event_title' => ['x' => 80, 'y' => 90, 'align' => 'left'],
                        'participant_name' => ['x' => 80, 'y' => 250, 'align' => 'left'],
                        'certificate_number' => ['x' => 80, 'y' => 140, 'align' => 'left'],
                        'date' => ['x' => 80, 'y' => 310, 'align' => 'left'],
                        'signature_image' => ['x' => 800, 'y' => 520, 'width' => 200, 'height' => 80],
                        'signature_name' => ['x' => 800, 'y' => 610, 'align' => 'center'],
                        'signature_title' => ['x' => 800, 'y' => 640, 'align' => 'center'],
                    ],
                    'colors' => [
                        'primary' => '#111827',
                        'accent' => '#2563eb',
                    ],
                ],
                'is_active' => true,
            ]
        );

        // Classic Ribbon
        CertificateTemplate::updateOrCreate(
            ['name' => 'Classic Ribbon'],
            [
                'type' => 'system',
                'theme' => 'classic-ribbon',
                'background_path' => null,
                'default_config' => [
                    'page' => ['width' => 1123, 'height' => 794],
                    'fonts' => [
                        'title' => ['family' => 'Georgia, serif', 'size' => 30, 'weight' => '700'],
                        'name' => ['family' => 'Georgia, serif', 'size' => 40, 'weight' => '700'],
                        'meta' => ['family' => 'Georgia, serif', 'size' => 14, 'weight' => '500'],
                    ],
                    'fields' => [
                        'event_title' => ['x' => 562, 'y' => 120, 'align' => 'center'],
                        'participant_name' => ['x' => 562, 'y' => 300, 'align' => 'center'],
                        'certificate_number' => ['x' => 562, 'y' => 170, 'align' => 'center'],
                        'date' => ['x' => 562, 'y' => 360, 'align' => 'center'],
                        'signature_image' => ['x' => 820, 'y' => 520, 'width' => 180, 'height' => 70],
                        'signature_name' => ['x' => 910, 'y' => 610, 'align' => 'center'],
                        'signature_title' => ['x' => 910, 'y' => 640, 'align' => 'center'],
                    ],
                    'colors' => [
                        'primary' => '#1f2937',
                        'accent' => '#b91c1c',
                    ],
                ],
                'is_active' => true,
            ]
        );
    }
}

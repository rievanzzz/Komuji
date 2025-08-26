<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            ['nama_kategori' => 'Seminar', 'deskripsi' => 'Acara presentasi dan diskusi tentang topik tertentu'],
            ['nama_kategori' => 'Workshop', 'deskripsi' => 'Pelatihan praktis dengan fokus pada keterampilan tertentu'],
            ['nama_kategori' => 'Pelatihan', 'deskripsi' => 'Program pelatihan untuk pengembangan kompetensi'],
            ['nama_kategori' => 'Konferensi', 'deskripsi' => 'Pertemuan formal untuk membahas topik tertentu'],
            ['nama_kategori' => 'Webinar', 'deskripsi' => 'Seminar yang diselenggarakan secara daring'],
            ['nama_kategori' => 'Lomba', 'deskripsi' => 'Kompetisi dengan aturan dan hadiah tertentu'],
            ['nama_kategori' => 'Kompetisi', 'deskripsi' => 'Ajang perlombaan dengan penilaian tertentu'],
            ['nama_kategori' => 'Bootcamp', 'deskripsi' => 'Program pelatihan intensif dalam waktu singkat'],
            ['nama_kategori' => 'Hackathon', 'deskripsi' => 'Kompetisi pemrograman dalam waktu terbatas'],
            ['nama_kategori' => 'Expo', 'deskripsi' => 'Pameran produk atau jasa dari berbagai perusahaan'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['nama_kategori' => $category['nama_kategori']],
                $category
            );
        }
    }
}

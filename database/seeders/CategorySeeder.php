<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Truncate the table
        Category::truncate();
        
        // Enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            [
                'nama_kategori' => 'Seminar', 
                'deskripsi' => 'Acara presentasi dan diskusi tentang topik tertentu',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Workshop', 
                'deskripsi' => 'Pelatihan praktis dengan fokus pada keterampilan tertentu',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Pelatihan', 
                'deskripsi' => 'Program pelatihan untuk pengembangan kompetensi',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Konferensi', 
                'deskripsi' => 'Pertemuan besar untuk berdiskusi tentang topik tertentu',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Webinar', 
                'deskripsi' => 'Seminar yang diselenggarakan secara online',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Lomba', 
                'deskripsi' => 'Kompetisi dengan aturan dan hadiah tertentu',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Bootcamp', 
                'deskripsi' => 'Program pelatihan intensif dalam waktu singkat',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Hackathon', 
                'deskripsi' => 'Kompetisi pemrograman dalam waktu terbatas',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_kategori' => 'Expo', 
                'deskripsi' => 'Pameran produk atau jasa dari berbagai perusahaan',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['nama_kategori' => $category['nama_kategori']],
                $category
            );
        }
    }
}

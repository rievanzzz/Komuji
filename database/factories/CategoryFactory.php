<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $name = $this->faker->unique()->randomElement([
            'Seminar', 'Workshop', 'Pelatihan', 'Konferensi', 'Webinar',
            'Lomba', 'Kompetisi', 'Bootcamp', 'Hackathon', 'Expo'
        ]);
        
        return [
            'nama_kategori' => $name,
            'deskripsi' => $this->faker->sentence(10),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+3 months');
        $endDate = (clone $startDate)->modify('+1 day');
        
        return [
            'judul' => $this->faker->sentence(4),
            'deskripsi' => $this->faker->paragraphs(3, true),
            'tanggal_mulai' => $startDate,
            'tanggal_selesai' => $endDate,
            'waktu_mulai' => '09:00:00',
            'waktu_selesai' => '17:00:00',
            'lokasi' => $this->faker->address(),
            'flyer_path' => null, // Bisa diisi path ke gambar default jika ada
            'sertifikat_template_path' => null, // Bisa diisi path ke template sertifikat default
            'is_published' => $this->faker->boolean(80), // 80% chance of being published
            'kuota' => $this->faker->numberBetween(20, 200),
            'terdaftar' => 0, // Awalnya 0, akan diupdate saat ada pendaftaran
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the event is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    /**
     * Indicate that the event is not published.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Indicate that the event has a certificate template.
     */
    public function withCertificate(): static
    {
        return $this->state(fn (array $attributes) => [
            'sertifikat_template_path' => 'templates/certificate/default.pdf',
        ]);
    }

    /**
     * Indicate that the event has a flyer.
     */
    public function withFlyer(): static
    {
        return $this->state(fn (array $attributes) => [
            'flyer_path' => 'flyers/event-' . $this->faker->uuid() . '.jpg',
        ]);
    }

    /**
     * Indicate that the event is in the past.
     */
    public function past(): static
    {
        $startDate = $this->faker->dateTimeBetween('-6 months', '-1 day');
        $endDate = (clone $startDate)->modify('+1 day');
        
        return $this->state(fn (array $attributes) => [
            'tanggal_mulai' => $startDate,
            'tanggal_selesai' => $endDate,
            'is_published' => true, // Past event should be published
        ]);
    }

    /**
     * Indicate that the event is upcoming.
     */
    public function upcoming(): static
    {
        $startDate = $this->faker->dateTimeBetween('+1 day', '+3 months');
        $endDate = (clone $startDate)->modify('+1 day');
        
        return $this->state(fn (array $attributes) => [
            'tanggal_mulai' => $startDate,
            'tanggal_selesai' => $endDate,
        ]);
    }
}

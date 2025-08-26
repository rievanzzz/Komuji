<?php

namespace Database\Factories;

use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CertificateFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = \App\Models\Certificate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $registration = Registration::factory()
            ->has(\App\Models\User::factory())
            ->has(\App\Models\Event::factory())
            ->create();
            
        return [
            'registration_id' => $registration->id,
            'nomor_sertifikat' => 'CERT-' . strtoupper(Str::random(8)),
            'file_path' => 'certificates/' . Str::uuid() . '.pdf',
            'generated_at' => now(),
        ];
    }

    /**
     * Indicate that the certificate was generated at a specific time.
     */
    public function generatedAt($dateTime): static
    {
        return $this->state(fn (array $attributes) => [
            'generated_at' => $dateTime,
        ]);
    }

    /**
     * Indicate that the certificate is for a specific registration.
     */
    public function forRegistration(Registration $registration): static
    {
        return $this->state(fn (array $attributes) => [
            'registration_id' => $registration->id,
        ]);
    }
}

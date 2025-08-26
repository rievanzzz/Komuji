<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RegistrationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = \App\Models\Registration::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_id' => Event::factory(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'kode_pendaftaran' => 'REG-' . strtoupper(Str::random(8)),
            'alasan_ditolak' => $this->faker->boolean(20) ? $this->faker->sentence() : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the registration is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'alasan_ditolak' => null,
        ]);
    }

    /**
     * Indicate that the registration is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'alasan_ditolak' => null,
        ]);
    }

    /**
     * Indicate that the registration is rejected.
     */
    public function rejected(string $reason = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'alasan_ditolak' => $reason ?? $this->faker->sentence(),
        ]);
    }
}

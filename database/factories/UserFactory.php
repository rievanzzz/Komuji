<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'peserta',
            'no_handphone' => fake()->phoneNumber(),
            'alamat' => fake()->address(),
            'pendidikan_terakhir' => fake()->randomElement(['SMA', 'D3', 'S1', 'S2', 'S3']),
            'otp' => null,
            'otp_expires_at' => null,
            'status_akun' => 'aktif',
            'verification_token' => null,
            'verification_token_expires_at' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin_aplikasi',
            'email' => 'admin@example.com',
            'password' => static::$password ??= Hash::make('admin123'),
        ]);
    }
}

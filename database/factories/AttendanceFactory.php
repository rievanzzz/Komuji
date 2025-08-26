<?php

namespace Database\Factories;

use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AttendanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = \App\Models\Attendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $registration = Registration::factory()
            ->has(\App\Models\User::factory())
            ->create();
            
        return [
            'registration_id' => $registration->id,
            'token' => strtoupper(Str::random(10)),
            'waktu_hadir' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'is_verified' => $this->faker->boolean(80), // 80% chance of being verified
        ];
    }

    /**
     * Indicate that the attendance is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
            'waktu_hadir' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the attendance is not verified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => false,
            'waktu_hadir' => null,
        ]);
    }

    /**
     * Indicate the attendance time.
     */
    public function attendedAt($dateTime): static
    {
        return $this->state(fn (array $attributes) => [
            'waktu_hadir' => $dateTime,
            'is_verified' => true,
        ]);
    }
}

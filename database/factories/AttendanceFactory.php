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
            'status' => $this->faker->randomElement(['pending','checked_in','checked_out']),
            'check_in_time' => $this->faker->optional(0.8)->dateTimeBetween('-1 month', 'now'),
            'check_out_time' => $this->faker->optional(0.5)->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the attendance is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'checked_in',
            'check_in_time' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the attendance is not verified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'check_in_time' => null,
            'check_out_time' => null,
        ]);
    }

    /**
     * Indicate the attendance time.
     */
    public function attendedAt($dateTime): static
    {
        return $this->state(fn (array $attributes) => [
            'check_in_time' => $dateTime,
            'status' => 'checked_in',
        ]);
    }
}

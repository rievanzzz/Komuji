<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,  // Categories must come first due to foreign key constraints
            UserSeeder::class,
            PanitiaKeduaSeeder::class,  // Add second organizer
            EventSeeder::class,
            RegistrationSeeder::class,
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\TicketCategory;

class TicketCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all events
        $events = Event::all();

        foreach ($events as $event) {
            // Create default ticket categories for each event
            TicketCategory::create([
                'event_id' => $event->id,
                'nama_kategori' => 'Regular',
                'deskripsi' => 'Tiket reguler dengan akses penuh ke event',
                'harga' => $event->harga_tiket ?? 0,
                'kuota' => $event->kuota ?? 100,
                'terjual' => $event->terdaftar ?? 0,
                'is_active' => true
            ]);

            // If event has a price, also create a VIP category
            if ($event->harga_tiket > 0) {
                TicketCategory::create([
                    'event_id' => $event->id,
                    'nama_kategori' => 'VIP',
                    'deskripsi' => 'Tiket VIP dengan benefit tambahan dan tempat duduk premium',
                    'harga' => $event->harga_tiket * 2,
                    'kuota' => intval(($event->kuota ?? 100) * 0.3), // 30% of total quota
                    'terjual' => 0,
                    'is_active' => true
                ]);
            }
        }
    }
}

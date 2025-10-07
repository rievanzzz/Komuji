<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class EventCrudTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $panitia;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a panitia user
        $this->panitia = User::factory()->create([
            'role' => 'panitia',
            'email_verified_at' => now(),
        ]);
        
        // Create a category
        $this->category = Category::factory()->create();
        
        Storage::fake('public');
    }

    /** @test */
    public function panitia_can_create_event()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        $eventData = [
            'judul' => 'Test Event',
            'deskripsi' => 'This is a test event description',
            'tanggal_mulai' => now()->addDays(5)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(6)->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '17:00',
            'lokasi' => 'Test Location',
            'kuota' => 100,
            'kategori_id' => $this->category->id,
            'harga_tiket' => 50000,
            'is_published' => true,
            'approval_type' => 'auto',
        ];
        
        $response = $this->postJson('/api/events', $eventData);
        
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'judul',
                        'deskripsi',
                        'created_by'
                    ]
                ]);
        
        $this->assertDatabaseHas('events', [
            'judul' => 'Test Event',
            'created_by' => $this->panitia->id,
        ]);
    }

    /** @test */
    public function panitia_can_view_their_own_events()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        // Create an event for this panitia
        $event = Event::factory()->create([
            'created_by' => $this->panitia->id,
            'kategori_id' => $this->category->id,
        ]);
        
        // Test organizer view (should see all events they created)
        $response = $this->getJson('/api/events?organizer=true');
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'judul',
                            'created_by'
                        ]
                    ]
                ]);
        
        $responseData = $response->json();
        $this->assertCount(1, $responseData['data']);
        $this->assertEquals($event->id, $responseData['data'][0]['id']);
    }

    /** @test */
    public function panitia_can_view_event_details()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        $event = Event::factory()->create([
            'created_by' => $this->panitia->id,
            'kategori_id' => $this->category->id,
            'is_published' => false, // Test that organizer can see unpublished events
        ]);
        
        $response = $this->getJson("/api/events/{$event->id}");
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'judul',
                        'deskripsi',
                        'is_published',
                        'created_by',
                        'registrations_count'
                    ]
                ]);
        
        $responseData = $response->json();
        $this->assertEquals($event->id, $responseData['data']['id']);
        $this->assertEquals($this->panitia->id, $responseData['data']['created_by']);
    }

    /** @test */
    public function panitia_can_update_their_own_event()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        $event = Event::factory()->create([
            'created_by' => $this->panitia->id,
            'kategori_id' => $this->category->id,
            'judul' => 'Original Title',
        ]);
        
        $updateData = [
            'judul' => 'Updated Title',
            'deskripsi' => 'Updated description',
        ];
        
        $response = $this->putJson("/api/events/{$event->id}", $updateData);
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'judul'
                    ]
                ]);
        
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'judul' => 'Updated Title',
        ]);
    }

    /** @test */
    public function panitia_can_delete_their_own_event_without_registrations()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        $event = Event::factory()->create([
            'created_by' => $this->panitia->id,
            'kategori_id' => $this->category->id,
        ]);
        
        $response = $this->deleteJson("/api/events/{$event->id}");
        
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ]);
        
        $this->assertSoftDeleted('events', [
            'id' => $event->id,
        ]);
    }

    /** @test */
    public function panitia_cannot_access_other_panitia_events()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        // Create another panitia
        $otherPanitia = User::factory()->create(['role' => 'panitia']);
        
        // Create an event for the other panitia
        $event = Event::factory()->create([
            'created_by' => $otherPanitia->id,
            'kategori_id' => $this->category->id,
        ]);
        
        // Try to view the event details
        $response = $this->getJson("/api/events/{$event->id}");
        $response->assertStatus(404); // Should not be able to see unpublished events of others
        
        // Try to update
        $response = $this->putJson("/api/events/{$event->id}", ['judul' => 'Hacked']);
        $response->assertStatus(403);
        
        // Try to delete
        $response = $this->deleteJson("/api/events/{$event->id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function panitia_cannot_update_restricted_fields_when_event_has_registrations()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        $event = Event::factory()->create([
            'created_by' => $this->panitia->id,
            'kategori_id' => $this->category->id,
            'terdaftar' => 5, // Event has registrations
            'kuota' => 100,
        ]);
        
        // Try to update restricted fields
        $updateData = [
            'kuota' => 50, // Should fail because it's less than registered count
            'tanggal_mulai' => now()->addDays(10)->format('Y-m-d'),
        ];
        
        $response = $this->putJson("/api/events/{$event->id}", $updateData);
        
        // The update should fail due to validation rules
        $response->assertStatus(422);
    }

    /** @test */
    public function event_list_filters_by_organizer_correctly()
    {
        $this->actingAs($this->panitia, 'sanctum');
        
        // Create events for this panitia
        $myEvents = Event::factory()->count(3)->create([
            'created_by' => $this->panitia->id,
            'kategori_id' => $this->category->id,
        ]);
        
        // Create events for another panitia
        $otherPanitia = User::factory()->create(['role' => 'panitia']);
        Event::factory()->count(2)->create([
            'created_by' => $otherPanitia->id,
            'kategori_id' => $this->category->id,
        ]);
        
        // Request organizer events
        $response = $this->getJson('/api/events?organizer=true');
        
        $response->assertStatus(200);
        $responseData = $response->json();
        
        // Should only see own events
        $this->assertCount(3, $responseData['data']);
        
        foreach ($responseData['data'] as $eventData) {
            $this->assertEquals($this->panitia->id, $eventData['created_by']);
        }
    }
}

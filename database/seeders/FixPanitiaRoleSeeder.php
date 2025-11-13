<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PanitiaProfile;
use Illuminate\Support\Facades\DB;

class FixPanitiaRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🔧 Memperbaiki data panitia yang corrupt...\n";

        // Fix users yang memiliki panitia profile approved tapi role masih peserta
        $corruptUsers = User::whereHas('panitiaProfile', function($query) {
            $query->where('status', 'approved');
        })->where('role', '!=', 'panitia')->get();

        foreach ($corruptUsers as $user) {
            $user->update(['role' => 'panitia']);
            echo "✅ Fixed user {$user->name} ({$user->email}) - role updated to panitia\n";
        }

        // Fix panitia profiles yang tidak memiliki max_active_events
        $profilesWithoutLimits = PanitiaProfile::where('status', 'approved')
            ->whereNull('max_active_events')
            ->get();

        foreach ($profilesWithoutLimits as $profile) {
            $maxEvents = $profile->plan_type === 'premium' ? 999 : 5;
            $profile->update(['max_active_events' => $maxEvents]);
            echo "✅ Fixed profile for {$profile->user->name} - max_active_events set to {$maxEvents}\n";
        }

        // Fix trial profiles yang tidak memiliki trial dates
        $trialsWithoutDates = PanitiaProfile::where('status', 'approved')
            ->where('plan_type', 'trial')
            ->whereNull('trial_start')
            ->get();

        foreach ($trialsWithoutDates as $profile) {
            $profile->update([
                'trial_start' => now(),
                'trial_end' => now()->addDays(60)
            ]);
            echo "✅ Fixed trial dates for {$profile->user->name}\n";
        }

        echo "\n🎉 Selesai! Data panitia telah diperbaiki.\n";
        echo "📊 Summary:\n";
        echo "- {$corruptUsers->count()} users role diperbaiki\n";
        echo "- {$profilesWithoutLimits->count()} profiles limits diperbaiki\n";
        echo "- {$trialsWithoutDates->count()} trial dates diperbaiki\n";
    }
}

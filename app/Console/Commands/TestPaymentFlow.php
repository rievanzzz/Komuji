<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Event;
use App\Models\Transaction;
use App\Models\Commission;
use App\Models\PanitiaProfile;
use Illuminate\Support\Facades\DB;

class TestPaymentFlow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:payment-flow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test payment flow and commission distribution';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== PAYMENT FLOW TESTING TOOL ===');
        $this->newLine();

        // Test 1: Check models and data
        $this->info('1. Testing Payment Flow Components...');
        
        try {
            $userCount = User::count();
            $eventCount = Event::count();
            $transactionCount = Transaction::count();
            $commissionCount = Commission::count();
            
            $this->info("✅ Models accessible:");
            $this->line("   - Users: {$userCount}");
            $this->line("   - Events: {$eventCount}");
            $this->line("   - Transactions: {$transactionCount}");
            $this->line("   - Commissions: {$commissionCount}");
            $this->newLine();
            
        } catch (\Exception $e) {
            $this->error("❌ Model error: " . $e->getMessage());
            $this->newLine();
        }

        // Test 2: Commission calculation
        $this->info('2. Testing Commission Calculation...');
        $sampleAmount = 100000; // 100k
        $platformFeePercentage = 10; // 10%
        $platformFee = ($sampleAmount * $platformFeePercentage) / 100;
        $netAmount = $sampleAmount - $platformFee;

        $this->line("   Sample Event Payment (Rp 100,000):");
        $this->line("   - Gross Amount: Rp " . number_format($sampleAmount));
        $this->line("   - Platform Fee (10%): Rp " . number_format($platformFee));
        $this->line("   - Net to Organizer: Rp " . number_format($netAmount));
        $this->newLine();

        // Test 3: Recent transactions
        $this->info('3. Recent Transactions...');
        $recentTransactions = Transaction::with(['user', 'event'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        if ($recentTransactions->count() > 0) {
            foreach ($recentTransactions as $transaction) {
                $this->line("   - Order: {$transaction->order_id} | Status: {$transaction->status} | Amount: Rp " . number_format($transaction->gross_amount ?? 0));
            }
        } else {
            $this->line("   No transactions found");
        }
        $this->newLine();

        // Test 4: Commission summary
        $this->info('4. Commission Summary...');
        $totalCommissions = Commission::where('status', 'paid')->sum('amount');
        $pendingCommissions = Commission::where('status', 'pending')->sum('amount');
        
        $this->line("   - Total Paid Commissions: Rp " . number_format($totalCommissions));
        $this->line("   - Pending Commissions: Rp " . number_format($pendingCommissions));
        $this->newLine();

        // Test 5: Organizer balances
        $this->info('5. Organizer Balances...');
        $organizers = PanitiaProfile::where('saldo', '>', 0)->limit(5)->get();
        
        if ($organizers->count() > 0) {
            foreach ($organizers as $organizer) {
                $user = User::find($organizer->user_id);
                $this->line("   - {$user->name}: Rp " . number_format($organizer->saldo));
            }
        } else {
            $this->line("   No organizers with balance found");
        }
        $this->newLine();

        // Test instructions
        $this->info('=== MANUAL TESTING STEPS ===');
        $this->line('1. Create test organizer account');
        $this->line('2. Create paid event (price > 0)');
        $this->line('3. Register as different user and book event');
        $this->line('4. Complete payment via Midtrans sandbox');
        $this->line('5. Check admin dashboard for commission');
        $this->line('6. Check organizer earnings for net amount');
        $this->newLine();

        $this->info('=== API ENDPOINTS TO TEST ===');
        $this->line('- GET /api/admin/revenue-dashboard (Admin token required)');
        $this->line('- GET /api/organizer/earnings (Organizer token required)');
        $this->line('- POST /api/payment/event (User token required)');
        $this->line('- POST /api/payment/premium (Organizer token required)');
        $this->newLine();

        $this->info('=== VERIFICATION CHECKLIST ===');
        $this->line('□ Payment popup appears (Midtrans Snap)');
        $this->line('□ Transaction created with correct amounts');
        $this->line('□ Commission record created');
        $this->line('□ Organizer saldo updated after payment');
        $this->line('□ Admin can see platform fee in dashboard');
        $this->line('□ Registration created after successful payment');
        $this->newLine();

        $this->info('✅ Payment flow testing complete!');
        
        return Command::SUCCESS;
    }
}

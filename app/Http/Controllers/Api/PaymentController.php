<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Commission;
use App\Models\Event;
use App\Models\Registration;
use App\Models\PanitiaProfile;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Midtrans Configuration
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = config('midtrans.is_sanitized', true);
        Config::$is3ds = config('midtrans.is_3ds', true);
    }

    /**
     * Create payment for event registration
     */
    public function createEventPayment(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'ticket_quantity' => 'required|integer|min:1'
        ]);

        $event = Event::findOrFail($request->event_id);
        $user = auth()->user();

        // Check if event is paid
        if ($event->harga_tiket <= 0) {
            return response()->json([
                'message' => 'Event ini gratis, tidak perlu pembayaran'
            ], 400);
        }

        // Check quota
        if ($event->terdaftar + $request->ticket_quantity > $event->kuota) {
            return response()->json([
                'message' => 'Kuota event tidak mencukupi'
            ], 400);
        }

        // Calculate amounts
        $grossAmount = $event->harga_tiket * $request->ticket_quantity;
        $platformFeePercentage = Setting::get('platform_fee_percentage', 10);
        $platformFee = ($grossAmount * $platformFeePercentage) / 100;
        $netAmount = $grossAmount - $platformFee;

        // Create transaction
        $orderId = 'EVT-' . date('Ymd') . '-' . strtoupper(Str::random(8));
        
        $transaction = Transaction::create([
            'transaction_id' => $orderId,
            'order_id' => $orderId,
            'user_id' => $user->id,
            'type' => 'event_registration',
            'event_id' => $event->id,
            'gross_amount' => $grossAmount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
            'status' => 'pending'
        ]);

        // Create commission records
        Commission::createPlatformFee($transaction->id, $grossAmount, $platformFeePercentage);
        
        // Midtrans transaction details
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->no_handphone ?? ''
            ],
            'item_details' => [
                [
                    'id' => $event->id,
                    'price' => $event->harga_tiket,
                    'quantity' => $request->ticket_quantity,
                    'name' => $event->judul
                ]
            ],
            'callbacks' => [
                'finish' => config('app.url') . '/payment/finish',
                'unfinish' => config('app.url') . '/payment/unfinish',
                'error' => config('app.url') . '/payment/error'
            ]
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            
            // Update transaction with Midtrans response
            $transaction->update([
                'midtrans_response' => [
                    'snap_token' => $snapToken,
                    'params' => $params
                ]
            ]);

            return response()->json([
                'message' => 'Payment token berhasil dibuat',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'order_id' => $orderId,
                    'snap_token' => $snapToken,
                    'gross_amount' => $grossAmount,
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->judul,
                        'price' => $event->harga_tiket,
                        'quantity' => $request->ticket_quantity
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Midtrans error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Gagal membuat payment token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create payment for premium upgrade
     */
    public function createPremiumPayment(Request $request)
    {
        $request->validate([
            'package' => 'required|in:monthly,yearly',
        ]);

        $user = auth()->user();
        $panitiaProfile = PanitiaProfile::where('user_id', $user->id)->first();

        if (!$panitiaProfile) {
            return response()->json([
                'message' => 'Anda belum terdaftar sebagai panitia'
            ], 400);
        }

        if ($panitiaProfile->isPremium()) {
            return response()->json([
                'message' => 'Anda sudah berlangganan premium'
            ], 400);
        }

        // Get premium pricing from settings
        $monthlyPrice = Setting::get('premium_monthly_price', 50000);
        $yearlyPrice = Setting::get('premium_yearly_price', 500000);
        
        $grossAmount = $request->package === 'yearly' ? $yearlyPrice : $monthlyPrice;
        $duration = $request->package === 'yearly' ? 12 : 1;

        // Create transaction
        $orderId = 'PRM-' . date('Ymd') . '-' . strtoupper(Str::random(8));
        
        $transaction = Transaction::create([
            'transaction_id' => $orderId,
            'order_id' => $orderId,
            'user_id' => $user->id,
            'type' => 'premium_upgrade',
            'gross_amount' => $grossAmount,
            'platform_fee' => 0, // No fee for premium upgrade
            'net_amount' => $grossAmount,
            'status' => 'pending'
        ]);

        // Midtrans transaction details
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->no_handphone ?? ''
            ],
            'item_details' => [
                [
                    'id' => 'premium_' . $request->package,
                    'price' => $grossAmount,
                    'quantity' => 1,
                    'name' => 'Paket Premium ' . ucfirst($request->package) . ' - ' . $duration . ' bulan'
                ]
            ]
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            
            $transaction->update([
                'midtrans_response' => [
                    'snap_token' => $snapToken,
                    'params' => $params,
                    'package' => $request->package,
                    'duration' => $duration
                ]
            ]);

            return response()->json([
                'message' => 'Payment token berhasil dibuat',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'order_id' => $orderId,
                    'snap_token' => $snapToken,
                    'gross_amount' => $grossAmount,
                    'package' => $request->package,
                    'duration' => $duration . ' bulan'
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Midtrans premium payment error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Gagal membuat payment token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Midtrans notification/webhook
     */
    public function handleNotification(Request $request)
    {
        try {
            $notification = new Notification();
            
            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            
            \Log::info('Midtrans notification received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus
            ]);

            // Find transaction
            $transaction = Transaction::where('order_id', $orderId)->first();
            
            if (!$transaction) {
                \Log::error('Transaction not found for order_id: ' . $orderId);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Update transaction based on status
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'challenge') {
                    $transaction->update(['status' => 'pending']);
                } else if ($fraudStatus == 'accept') {
                    $this->handleSuccessfulPayment($transaction, $notification);
                }
            } else if ($transactionStatus == 'settlement') {
                $this->handleSuccessfulPayment($transaction, $notification);
            } else if ($transactionStatus == 'pending') {
                $transaction->update(['status' => 'pending']);
            } else if ($transactionStatus == 'deny') {
                $transaction->update(['status' => 'failed']);
            } else if ($transactionStatus == 'expire') {
                $transaction->update(['status' => 'expired']);
            } else if ($transactionStatus == 'cancel') {
                $transaction->update(['status' => 'cancelled']);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            \Log::error('Midtrans notification error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment($transaction, $notification)
    {
        // Update transaction
        $transaction->update([
            'status' => 'paid',
            'payment_method' => $notification->payment_type ?? null,
            'paid_at' => now(),
            'midtrans_response' => array_merge(
                $transaction->midtrans_response ?? [],
                ['notification' => $notification->getResponse()]
            )
        ]);

        // Handle based on transaction type
        if ($transaction->type === 'event_registration') {
            $this->handleEventPaymentSuccess($transaction);
        } else if ($transaction->type === 'premium_upgrade') {
            $this->handlePremiumPaymentSuccess($transaction);
        }

        // Mark commissions as paid
        Commission::where('transaction_id', $transaction->id)->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);
    }

    /**
     * Handle successful event payment
     */
    private function handleEventPaymentSuccess($transaction)
    {
        $event = Event::find($transaction->event_id);
        if (!$event) return;

        // Create registration
        $registration = Registration::create([
            'event_id' => $transaction->event_id,
            'user_id' => $transaction->user_id,
            'transaction_id' => $transaction->id,
            'status' => 'confirmed',
            'registered_at' => now()
        ]);

        // Update event participant count
        $event->increment('terdaftar');

        // Add earnings to organizer
        if ($event->created_by) {
            $panitiaProfile = PanitiaProfile::where('user_id', $event->created_by)->first();
            if ($panitiaProfile) {
                $panitiaProfile->increment('saldo', $transaction->net_amount);
            }
        }

        \Log::info('Event payment successful', [
            'transaction_id' => $transaction->id,
            'registration_id' => $registration->id,
            'event_id' => $event->id
        ]);
    }

    /**
     * Handle successful premium payment
     */
    private function handlePremiumPaymentSuccess($transaction)
    {
        $panitiaProfile = PanitiaProfile::where('user_id', $transaction->user_id)->first();
        if (!$panitiaProfile) return;

        // Get package duration from transaction data
        $midtransData = $transaction->midtrans_response;
        $duration = $midtransData['duration'] ?? 1;

        // Upgrade to premium
        $panitiaProfile->upgradeToPremium($duration);

        \Log::info('Premium payment successful', [
            'transaction_id' => $transaction->id,
            'user_id' => $transaction->user_id,
            'duration' => $duration
        ]);
    }

    /**
     * Get transaction status
     */
    public function getTransactionStatus($transactionId)
    {
        $transaction = Transaction::with(['event', 'user'])->find($transactionId);
        
        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // Check if user owns this transaction
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'id' => $transaction->id,
                'order_id' => $transaction->order_id,
                'type' => $transaction->type,
                'status' => $transaction->status,
                'gross_amount' => $transaction->gross_amount,
                'payment_method' => $transaction->payment_method,
                'paid_at' => $transaction->paid_at,
                'event' => $transaction->event ? [
                    'id' => $transaction->event->id,
                    'title' => $transaction->event->judul
                ] : null
            ]
        ]);
    }
}

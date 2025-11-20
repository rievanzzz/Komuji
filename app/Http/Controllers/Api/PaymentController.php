<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Commission;
use App\Models\Event;
use App\Models\PanitiaProfile;
use App\Models\Registration;
use App\Models\Setting;
use App\Models\TicketCategory;
use App\Models\Transaction;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    private $xenditSecretKey;
    private $xenditApiUrl;

    public function __construct()
    {
        // Xendit Configuration
        $this->xenditSecretKey = config('xendit.secret_key');
        $this->xenditApiUrl = config('xendit.api_url');
    }

    /**
     * Get Xendit HTTP client with authentication
     */
    private function getXenditClient()
    {
        return Http::withBasicAuth($this->xenditSecretKey, '')
            ->withHeaders([
                'Content-Type' => 'application/json',
            ]);
    }

    /**
     * Expose minimal client config for frontend
     */
    public function clientConfig()
    {
        return response()->json([
            'public_key' => config('xendit.public_key'),
            'api_url' => config('xendit.api_url'),
            'enabled_payments' => config('xendit.enabled_payment_methods'),
            'available_banks' => config('xendit.available_banks'),
            'available_ewallets' => config('xendit.available_ewallets'),
        ]);
    }

    /**
     * Create payment for event registration
     */
    public function createEventPayment(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'ticket_quantity' => 'required|integer|min:1',
            'ticket_category_id' => 'required|exists:ticket_categories,id',
            'method' => 'nullable|string',
            'payer_bank_code' => 'nullable|string',
            'payer_account_number' => 'nullable|string'
        ]);

        $event = Event::findOrFail($request->event_id);
        $user = auth()->user();

        // Do not block by event base price; payment eligibility is determined by selected ticket category price

        // Check quota
        if ($event->terdaftar + $request->ticket_quantity > $event->kuota) {
            return response()->json([
                'message' => 'Kuota event tidak mencukupi'
            ], 400);
        }

        // Resolve ticket category price
        $category = TicketCategory::where('id', $request->ticket_category_id)
            ->where('event_id', $event->id)
            ->firstOrFail();
        if ((float)$category->harga <= 0) {
            return response()->json(['message' => 'Kategori tiket ini gratis'], 400);
        }

        // Calculate amounts from category price
        $grossAmount = (float)$category->harga * (int)$request->ticket_quantity;
        $grossAmountInt = (int) round($grossAmount);
        $platformFeePercentage = Setting::get('platform_fee_percentage', Setting::get('commission_rate', 10));
        $platformFee = ($grossAmount * $platformFeePercentage) / 100;
        $netAmount = $grossAmount - $platformFee;

        // Create transaction aligned with schema
        $orderId = Transaction::generateTransactionCode('EVT');

        $transaction = Transaction::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'panitia_id' => $event->created_by ?? $user->id,
            'transaction_id' => $orderId,
            'order_id' => $orderId,
            'transaction_code' => $orderId,
            'type' => 'event_payment',
            'gross_amount' => $grossAmount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
            'platform_fee_percentage' => $platformFeePercentage,
            'status' => 'pending',
            'payment_gateway' => 'xendit',
            'description' => 'Pembayaran tiket event',
        ]);

        // Create commission records
        Commission::createPlatformFee($transaction->id, $grossAmount, $platformFeePercentage);

        // Xendit payment method (optional - jika tidak ada, Xendit akan tampilkan semua)
        $method = $request->input('method');
        $payerBank = $request->input('payer_bank_code');

        // Normalize phone number (digits only, convert 0xxxxxxxxx -> 62xxxxxxxxx)
        $rawPhone = (string) ($user->no_handphone ?? '');
        $digits = preg_replace('/\D+/', '', $rawPhone);
        if (!$digits) { $digits = '081234567890'; }
        if (substr($digits, 0, 1) === '0') {
            $digits = '62' . substr($digits, 1);
        }
        $phoneNormalized = $digits;

        $firstName = trim(Str::limit((string)($user->name ?? 'User'), 20, '')) ?: 'User';
        $itemName = Str::limit($event->judul . ' - ' . $category->nama_kategori, 50, '');

        // Prepare Xendit Invoice payload
        $invoicePayload = [
            'external_id' => $orderId,
            'amount' => $grossAmountInt,
            'payer_email' => $user->email,
            'description' => 'Pembayaran tiket: ' . $itemName,
            'invoice_duration' => config('xendit.invoice_expiry', 24) * 3600, // in seconds
            'customer' => [
                'given_names' => $firstName,
                'email' => $user->email,
                'mobile_number' => $phoneNormalized,
            ],
            'customer_notification_preference' => [
                'invoice_created' => ['email'],
                'invoice_reminder' => ['email'],
                'invoice_paid' => ['email'],
            ],
            'success_redirect_url' => config('xendit.success_redirect_url'),
            'failure_redirect_url' => config('xendit.failure_redirect_url'),
            'currency' => 'IDR',
            'items' => [
                [
                    'name' => $itemName,
                    'quantity' => (int)$request->ticket_quantity,
                    'price' => (int) round((float)$category->harga),
                    'category' => 'Event Ticket',
                ]
            ],
        ];

        // Add payment method jika dispesifikasi (optional)
        // Jika tidak ada, Xendit akan menampilkan SEMUA payment methods
        if ($method) {
            if ($method === 'bank_transfer' || $method === 'va') {
                $invoicePayload['payment_methods'] = ['BANK_TRANSFER'];
                if ($payerBank) {
                    $invoicePayload['fixed_va'] = true;
                    $invoicePayload['bank_code'] = strtoupper($payerBank);
                }
            } elseif ($method === 'ewallet') {
                $invoicePayload['payment_methods'] = ['EWALLET'];
            } elseif ($method === 'qris') {
                $invoicePayload['payment_methods'] = ['QR_CODE'];
            } elseif ($method === 'credit_card') {
                $invoicePayload['payment_methods'] = ['CREDIT_CARD'];
            }
        }

        try {
            // Create Xendit Invoice
            $response = $this->getXenditClient()
                ->post($this->xenditApiUrl . '/v2/invoices', $invoicePayload);

            if (!$response->successful()) {
                throw new \Exception('Xendit API Error: ' . $response->body());
            }

            $invoiceData = $response->json();

            Log::info('Xendit invoice created', [
                'order_id' => $orderId,
                'invoice_id' => $invoiceData['id'] ?? null,
                'invoice_url' => $invoiceData['invoice_url'] ?? null,
            ]);

            // Update transaction with Xendit response
            $transaction->update([
                'gateway_response' => [
                    'invoice_id' => $invoiceData['id'] ?? null,
                    'invoice_url' => $invoiceData['invoice_url'] ?? null,
                    'expiry_date' => $invoiceData['expiry_date'] ?? null,
                    'params' => $invoicePayload,
                    'registration_payload' => [
                        'ticket_category_id' => (int)$request->ticket_category_id,
                        'nama_peserta' => $request->input('nama_peserta'),
                        'jenis_kelamin' => $request->input('jenis_kelamin'),
                        'tanggal_lahir' => $request->input('tanggal_lahir'),
                        'email_peserta' => $request->input('email_peserta'),
                        'quantity' => (int)$request->ticket_quantity,
                    ],
                    'payer_info' => [
                        'bank_code' => $request->input('payer_bank_code'),
                        'account_number' => $request->input('payer_account_number')
                    ]
                ]
            ]);

            return response()->json([
                'message' => 'Invoice berhasil dibuat',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'order_id' => $orderId,
                    'invoice_id' => $invoiceData['id'] ?? null,
                    'invoice_url' => $invoiceData['invoice_url'] ?? null,
                    'expiry_date' => $invoiceData['expiry_date'] ?? null,
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
            $msg = $e->getMessage();
            Log::error('Xendit Payment Creation Failed', [
                'error_message' => $msg,
                'request_payload' => $request->all(),
                'xendit_payload' => $invoicePayload ?? 'not_set',
                'exception_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Gagal membuat invoice',
                'error' => $msg
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
        $orderId = 'EVT-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(6));

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'panitia_id' => $user->id,
            'transaction_id' => $orderId,
            'order_id' => $orderId,
            'transaction_code' => $orderId,
            'type' => 'premium_subscription',
            'gross_amount' => $grossAmount,
            'platform_fee' => 0, // No fee for premium subscription
            'net_amount' => $grossAmount,
            'platform_fee_percentage' => 0,
            'status' => 'pending',
            'payment_gateway' => 'xendit',
            'description' => 'Langganan premium',
        ]);

        // Prepare Xendit Invoice
        $invoicePayload = [
            'external_id' => $orderId,
            'amount' => $grossAmount,
            'payer_email' => $user->email,
            'description' => 'Paket Premium ' . ucfirst($request->package) . ' - ' . $duration . ' bulan',
            'invoice_duration' => config('xendit.invoice_expiry', 24) * 3600,
            'customer' => [
                'given_names' => $user->name,
                'email' => $user->email,
                'mobile_number' => $user->no_handphone ?? '',
            ],
            'success_redirect_url' => config('xendit.success_redirect_url'),
            'failure_redirect_url' => config('xendit.failure_redirect_url'),
            'currency' => 'IDR',
            'items' => [
                [
                    'name' => 'Paket Premium ' . ucfirst($request->package),
                    'quantity' => 1,
                    'price' => $grossAmount,
                    'category' => 'Premium Subscription',
                ]
            ],
        ];

        try {
            $response = $this->getXenditClient()
                ->post($this->xenditApiUrl . '/v2/invoices', $invoicePayload);

            if (!$response->successful()) {
                throw new \Exception('Xendit API Error: ' . $response->body());
            }

            $invoiceData = $response->json();

            $transaction->update([
                'gateway_response' => [
                    'invoice_id' => $invoiceData['id'] ?? null,
                    'invoice_url' => $invoiceData['invoice_url'] ?? null,
                    'expiry_date' => $invoiceData['expiry_date'] ?? null,
                    'params' => $invoicePayload,
                    'package' => $request->package,
                    'duration' => $duration
                ]
            ]);

            return response()->json([
                'message' => 'Invoice berhasil dibuat',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'order_id' => $orderId,
                    'invoice_id' => $invoiceData['id'] ?? null,
                    'invoice_url' => $invoiceData['invoice_url'] ?? null,
                    'gross_amount' => $grossAmount,
                    'package' => $request->package,
                    'duration' => $duration . ' bulan'
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Xendit premium payment error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal membuat invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check Xendit payment status (manual polling - no webhook)
     */
    public function checkPaymentStatus($transactionId)
    {
        $transaction = Transaction::find($transactionId);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // Check if user owns this transaction
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoiceId = $transaction->gateway_response['invoice_id'] ?? null;

        if (!$invoiceId) {
            return response()->json(['message' => 'Invoice ID not found'], 400);
        }

        try {
            // Get invoice status from Xendit
            $response = $this->getXenditClient()
                ->get($this->xenditApiUrl . '/v2/invoices/' . $invoiceId);

            if (!$response->successful()) {
                throw new \Exception('Xendit API Error: ' . $response->body());
            }

            $invoiceData = $response->json();
            $status = $invoiceData['status'] ?? 'PENDING';

            \Log::info('Xendit payment status checked', [
                'transaction_id' => $transactionId,
                'invoice_id' => $invoiceId,
                'status' => $status,
            ]);

            // Update transaction based on Xendit status
            if ($status === 'PAID' || $status === 'SETTLED') {
                if ($transaction->status !== 'paid') {
                    $this->handleSuccessfulPayment($transaction, $invoiceData);
                }
            } elseif ($status === 'EXPIRED') {
                $transaction->update(['status' => 'expired']);
            }

            // Get registration for this transaction
            $registration = Registration::where('user_id', $transaction->user_id)
                ->where('event_id', $transaction->event_id)
                ->first();

            return response()->json([
                'data' => [
                    'transaction_id' => $transaction->id,
                    'order_id' => $transaction->transaction_code,
                    'status' => $transaction->status,
                    'payment_status' => $status,
                    'gross_amount' => $transaction->gross_amount,
                    'invoice_url' => $invoiceData['invoice_url'] ?? null,
                    'registration_id' => $registration?->id,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Xendit status check error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId,
            ]);

            return response()->json([
                'message' => 'Gagal mengecek status pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Xendit callback (optional - but good to have as fallback)
     */
    public function handleNotification(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['message' => 'OK'], 200);
        }

        try {
            $payload = $request->all();
            $externalId = $payload['external_id'] ?? null;
            $status = $payload['status'] ?? null;

            \Log::info('Xendit callback received', [
                'external_id' => $externalId,
                'status' => $status,
            ]);

            if (!$externalId) {
                return response()->json(['message' => 'OK'], 200);
            }

            $transaction = Transaction::where('transaction_code', $externalId)->first();

            if (!$transaction) {
                \Log::warning('Xendit callback ignored - transaction not found', [
                    'external_id' => $externalId,
                ]);
                return response()->json(['message' => 'OK'], 200);
            }

            // Update transaction based on status
            if ($status === 'PAID' || $status === 'SETTLED') {
                if ($transaction->status !== 'paid') {
                    $this->handleSuccessfulPayment($transaction, $payload);
                }
            } elseif ($status === 'EXPIRED') {
                $transaction->update(['status' => 'expired']);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            \Log::error('Xendit callback error', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'OK'], 200);
        }
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment($transaction, $xenditData)
    {
        // Extract payment method from Xendit data
        $paymentMethod = null;
        if (is_array($xenditData)) {
            $paymentMethod = $xenditData['payment_channel'] ?? $xenditData['payment_method'] ?? null;
        }

        // Update transaction
        $transaction->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod,
            'paid_at' => now(),
            'gateway_response' => array_merge(
                $transaction->gateway_response ?? [],
                ['payment_data' => $xenditData]
            )
        ]);

        // Handle based on transaction type
        if ($transaction->type === 'event_payment') {
            $this->handleEventPaymentSuccess($transaction);
        } else if ($transaction->type === 'premium_subscription') {
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

        $payload = $transaction->gateway_response['registration_payload'] ?? [];
        $ticketCategoryId = (int)($payload['ticket_category_id'] ?? 0);
        $category = $ticketCategoryId ? TicketCategory::where('id', $ticketCategoryId)->where('event_id', $event->id)->first() : null;

        // Upsert registration for this user+event to avoid duplicates if webhook called multiple times
        $existing = Registration::where('user_id', $transaction->user_id)
            ->where('event_id', $transaction->event_id)
            ->first();

        $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        if ($existing) {
            $existing->update([
                'status' => 'approved',
                'payment_status' => 'paid',
                'payment_method' => $transaction->payment_method,
                'invoice_number' => $existing->invoice_number ?: $invoiceNumber,
                'total_harga' => $category ? $category->harga : $existing->total_harga,
                'ticket_category_id' => $category ? $category->id : $existing->ticket_category_id,
            ]);
            $registration = $existing;
        } else {
            $registration = Registration::create([
                'user_id' => $transaction->user_id,
                'event_id' => $transaction->event_id,
                'ticket_category_id' => $category?->id,
                'status' => 'approved',
                'kode_pendaftaran' => 'REG-' . strtoupper(Str::random(8)),
                'nama_peserta' => $payload['nama_peserta'] ?? null,
                'jenis_kelamin' => $payload['jenis_kelamin'] ?? null,
                'tanggal_lahir' => $payload['tanggal_lahir'] ?? null,
                'email_peserta' => $payload['email_peserta'] ?? null,
                'total_harga' => $category?->harga ?? $transaction->gross_amount,
                'payment_status' => 'paid',
                'payment_method' => $transaction->payment_method,
                'invoice_number' => $invoiceNumber,
            ]);
        }

        // Create or update attendance with check-in token FIRST
        $attendance = Attendance::firstOrNew([
            'registration_id' => $registration->id
        ]);

        if (!$attendance->token) {
            $token = '';
            for ($i = 0; $i < 10; $i++) { $token .= random_int(0, 9); }
            $attendance->token = $token;
        }

        $attendance->status = 'pending';
        $attendance->save();

        // Generate QR Code AFTER attendance token is created
        // QR code will contain the attendance token
        $this->generateAndSaveQRCode($registration->fresh());

        // Update event participant count
        $event->increment('terdaftar');
        if ($category) {
            $category->increment('terjual');
        }

        // Add earnings to organizer
        $creditUserId = $event->created_by ?: ($transaction->panitia_id ?? null);
        if ($creditUserId) {
            $panitiaProfile = PanitiaProfile::where('user_id', $creditUserId)->first();
            if ($panitiaProfile) {
                $panitiaProfile->increment('saldo', $transaction->net_amount);
            }
        }

        // Send email with ticket and QR code
        $this->sendTicketEmail($registration, $event);

        \Log::info('Event payment successful', [
            'transaction_id' => $transaction->id,
            'registration_id' => $registration->id,
            'event_id' => $event->id,
            'email_sent' => true
        ]);
    }

    /**
     * Generate and save QR Code for registration
     * QR Code contains the check-in token for scanning
     */
    private function generateAndSaveQRCode($registration)
    {
        try {
            // Get attendance token
            $attendance = $registration->attendance()->first();

            if (!$attendance || !$attendance->token) {
                \Log::warning('No attendance token found for QR generation', ['registration_id' => $registration->id]);
                return;
            }

            // QR code contains ONLY the token for simple check-in scanning
            $qrData = $attendance->token;

            $qrCode = new QrCode($qrData);
            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            // Save as base64 for easy embedding
            $qrCodeBase64 = 'data:image/png;base64,' . base64_encode($result->getString());

            $registration->update([
                'qr_code' => $qrCodeBase64
            ]);

            \Log::info('QR Code generated with token', [
                'registration_id' => $registration->id,
                'token' => $attendance->token
            ]);
        } catch (\Exception $e) {
            \Log::error('QR Code generation failed', [
                'registration_id' => $registration->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send ticket email with QR code
     */
    private function sendTicketEmail($registration, $event)
    {
        try {
            $emailData = [
                'registration' => $registration,
                'event' => $event,
                'attendanceToken' => $registration->attendance?->token,
            ];

            Mail::send('emails.ticket', $emailData, function($message) use ($registration, $event) {
                $message->to($registration->email_peserta, $registration->nama_peserta)
                    ->subject('E-Ticket: ' . $event->judul);
            });

            \Log::info('Ticket email sent', [
                'registration_id' => $registration->id,
                'email' => $registration->email_peserta
            ]);
        } catch (\Exception $e) {
            \Log::error('Email sending failed', [
                'registration_id' => $registration->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle successful premium payment
     */
    private function handlePremiumPaymentSuccess($transaction)
    {
        $panitiaProfile = PanitiaProfile::where('user_id', $transaction->user_id)->first();
        if (!$panitiaProfile) return;

        // Get package duration from transaction data
        $midtransData = $transaction->gateway_response;
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
                'order_id' => $transaction->transaction_code,
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

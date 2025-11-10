<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * Get all transactions with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Transaction::with(['event', 'user', 'panitia', 'registration']);

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            // Filter by panitia
            if ($request->has('panitia_id')) {
                $query->where('panitia_id', $request->panitia_id);
            }

            // Search by transaction code
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_code', 'like', "%{$search}%")
                      ->orWhereHas('event', function ($eq) use ($search) {
                          $eq->where('judul', 'like', "%{$search}%");
                      })
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $transactions = $query->orderBy('created_at', 'desc')->paginate(20);

            // Transform data
            $transactions->getCollection()->transform(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_code' => $transaction->transaction_code,
                    'type' => $transaction->type,
                    'type_badge' => $transaction->type_badge,
                    'status' => $transaction->status,
                    'status_badge' => $transaction->status_badge,
                    'gross_amount' => $transaction->gross_amount,
                    'platform_fee' => $transaction->platform_fee,
                    'net_amount' => $transaction->net_amount,
                    'platform_fee_percentage' => $transaction->platform_fee_percentage,
                    'payment_method' => $transaction->payment_method,
                    'payment_gateway' => $transaction->payment_gateway,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at,
                    'paid_at' => $transaction->paid_at,
                    'event' => $transaction->event ? [
                        'id' => $transaction->event->id,
                        'judul' => $transaction->event->judul,
                        'tanggal_mulai' => $transaction->event->tanggal_mulai
                    ] : null,
                    'user' => [
                        'id' => $transaction->user->id,
                        'name' => $transaction->user->name,
                        'email' => $transaction->user->email
                    ],
                    'panitia' => $transaction->panitia ? [
                        'id' => $transaction->panitia->id,
                        'name' => $transaction->panitia->name,
                        'email' => $transaction->panitia->email
                    ] : null
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get transactions error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data transaksi'
            ], 500);
        }
    }

    /**
     * Get transaction statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                // Overall stats
                'total_transactions' => Transaction::count(),
                'total_revenue' => Transaction::where('status', 'paid')->sum('gross_amount'),
                'total_fees_collected' => Transaction::where('status', 'paid')->sum('platform_fee'),
                'total_net_amount' => Transaction::where('status', 'paid')->sum('net_amount'),
                
                // By status
                'pending_transactions' => Transaction::where('status', 'pending')->count(),
                'paid_transactions' => Transaction::where('status', 'paid')->count(),
                'failed_transactions' => Transaction::where('status', 'failed')->count(),
                'cancelled_transactions' => Transaction::where('status', 'cancelled')->count(),
                'refunded_transactions' => Transaction::where('status', 'refunded')->count(),
                
                // By type
                'event_payments' => Transaction::where('type', 'event_payment')->count(),
                'premium_subscriptions' => Transaction::where('type', 'premium_subscription')->count(),
                'payouts' => Transaction::where('type', 'payout')->count(),
                'refunds' => Transaction::where('type', 'refund')->count(),
                
                // This month
                'this_month_revenue' => Transaction::where('status', 'paid')
                    ->whereMonth('paid_at', date('m'))
                    ->whereYear('paid_at', date('Y'))
                    ->sum('gross_amount'),
                'this_month_fees' => Transaction::where('status', 'paid')
                    ->whereMonth('paid_at', date('m'))
                    ->whereYear('paid_at', date('Y'))
                    ->sum('platform_fee'),
                'this_month_transactions' => Transaction::where('status', 'paid')
                    ->whereMonth('paid_at', date('m'))
                    ->whereYear('paid_at', date('Y'))
                    ->count()
            ];

            // Monthly revenue stats
            $monthlyRevenue = Transaction::where('status', 'paid')
                ->selectRaw('MONTH(paid_at) as month, SUM(gross_amount) as revenue, SUM(platform_fee) as fees, COUNT(*) as count')
                ->whereYear('paid_at', date('Y'))
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->mapWithKeys(function ($item) {
                    $monthNames = [
                        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                        5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                        9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
                    ];
                    return [$monthNames[$item->month] => [
                        'revenue' => $item->revenue,
                        'fees' => $item->fees,
                        'count' => $item->count
                    ]];
                });

            $stats['monthly_revenue'] = $monthlyRevenue;

            // Top panitias by revenue
            $topPanitias = Transaction::where('status', 'paid')
                ->where('type', 'event_payment')
                ->with('panitia')
                ->selectRaw('panitia_id, SUM(gross_amount) as total_revenue, SUM(platform_fee) as total_fees, COUNT(*) as transaction_count')
                ->groupBy('panitia_id')
                ->orderBy('total_revenue', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'panitia' => [
                            'id' => $item->panitia->id,
                            'name' => $item->panitia->name,
                            'email' => $item->panitia->email
                        ],
                        'total_revenue' => $item->total_revenue,
                        'total_fees' => $item->total_fees,
                        'transaction_count' => $item->transaction_count
                    ];
                });

            $stats['top_panitias'] = $topPanitias;

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Admin transaction stats error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil statistik transaksi'
            ], 500);
        }
    }

    /**
     * Get transaction details
     */
    public function show($id): JsonResponse
    {
        try {
            $transaction = Transaction::with([
                'event', 
                'user', 
                'panitia', 
                'registration'
            ])->findOrFail($id);

            $data = [
                'id' => $transaction->id,
                'transaction_code' => $transaction->transaction_code,
                'type' => $transaction->type,
                'type_badge' => $transaction->type_badge,
                'status' => $transaction->status,
                'status_badge' => $transaction->status_badge,
                'gross_amount' => $transaction->gross_amount,
                'platform_fee' => $transaction->platform_fee,
                'net_amount' => $transaction->net_amount,
                'platform_fee_percentage' => $transaction->platform_fee_percentage,
                'payment_method' => $transaction->payment_method,
                'payment_gateway' => $transaction->payment_gateway,
                'gateway_transaction_id' => $transaction->gateway_transaction_id,
                'gateway_response' => $transaction->gateway_response,
                'description' => $transaction->description,
                'notes' => $transaction->notes,
                'created_at' => $transaction->created_at,
                'paid_at' => $transaction->paid_at,
                'failed_at' => $transaction->failed_at,
                'cancelled_at' => $transaction->cancelled_at,
                'refunded_at' => $transaction->refunded_at,
                'event' => $transaction->event ? [
                    'id' => $transaction->event->id,
                    'judul' => $transaction->event->judul,
                    'tanggal_mulai' => $transaction->event->tanggal_mulai,
                    'tanggal_selesai' => $transaction->event->tanggal_selesai,
                    'lokasi' => $transaction->event->lokasi
                ] : null,
                'user' => [
                    'id' => $transaction->user->id,
                    'name' => $transaction->user->name,
                    'email' => $transaction->user->email,
                    'no_handphone' => $transaction->user->no_handphone
                ],
                'panitia' => $transaction->panitia ? [
                    'id' => $transaction->panitia->id,
                    'name' => $transaction->panitia->name,
                    'email' => $transaction->panitia->email
                ] : null,
                'registration' => $transaction->registration ? [
                    'id' => $transaction->registration->id,
                    'kode_pendaftaran' => $transaction->registration->kode_pendaftaran,
                    'status' => $transaction->registration->status
                ] : null
            ];

            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get transaction detail error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail transaksi'
            ], 500);
        }
    }

    /**
     * Export transactions to CSV
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $query = Transaction::with(['event', 'user', 'panitia']);

            // Apply same filters as index
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            $transactions = $query->orderBy('created_at', 'desc')->get();

            $csvData = [];
            $csvData[] = [
                'Kode Transaksi',
                'Tipe',
                'Status',
                'Event',
                'User',
                'Panitia',
                'Jumlah Kotor',
                'Fee Platform',
                'Jumlah Bersih',
                'Metode Pembayaran',
                'Tanggal Dibuat',
                'Tanggal Dibayar'
            ];

            foreach ($transactions as $transaction) {
                $csvData[] = [
                    $transaction->transaction_code,
                    $transaction->type,
                    $transaction->status,
                    $transaction->event ? $transaction->event->judul : '-',
                    $transaction->user->name,
                    $transaction->panitia ? $transaction->panitia->name : '-',
                    $transaction->gross_amount,
                    $transaction->platform_fee,
                    $transaction->net_amount,
                    $transaction->payment_method ?: '-',
                    $transaction->created_at->format('Y-m-d H:i:s'),
                    $transaction->paid_at ? $transaction->paid_at->format('Y-m-d H:i:s') : '-'
                ];
            }

            return response()->json([
                'status' => 'success',
                'filename' => 'transactions_' . date('Y-m-d') . '.csv',
                'data' => $csvData
            ]);
        } catch (\Exception $e) {
            Log::error('Admin export transactions error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data transaksi'
            ], 500);
        }
    }
}

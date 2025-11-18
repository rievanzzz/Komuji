<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Withdrawal;
use App\Models\PanitiaProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    /**
     * Get user's bank accounts
     */
    public function getBankAccounts()
    {
        $user = auth()->user();
        
        $bankAccounts = BankAccount::where('user_id', $user->id)
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'bank_name' => $account->bank_name,
                    'account_number' => $account->formatted_account_number,
                    'masked_account_number' => $account->masked_account_number,
                    'account_holder_name' => $account->account_holder_name,
                    'is_verified' => $account->is_verified,
                    'is_primary' => $account->is_primary
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'bank_accounts' => $bankAccounts,
                'bank_list' => BankAccount::getBankList()
            ]
        ]);
    }

    /**
     * Add new bank account
     */
    public function addBankAccount(Request $request)
    {
        $request->validate([
            'bank_code' => 'required|string',
            'account_number' => 'required|string|min:8|max:20',
            'account_holder_name' => 'required|string|max:255',
            'is_primary' => 'boolean'
        ]);

        $user = auth()->user();

        try {
            DB::beginTransaction();

            // Check if account already exists
            $existingAccount = BankAccount::where('user_id', $user->id)
                ->where('account_number', $request->account_number)
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nomor rekening sudah terdaftar'
                ], 400);
            }

            $bankAccount = BankAccount::create([
                'user_id' => $user->id,
                'bank_name' => BankAccount::getBankList()[$request->bank_code] ?? $request->bank_code,
                'account_number' => $request->account_number,
                'account_holder_name' => $request->account_holder_name,
                'is_verified' => false, // Admin will verify later
                'is_primary' => $request->is_primary ?? false
            ]);

            // Set as primary if requested or if it's the first account
            if ($request->is_primary || BankAccount::where('user_id', $user->id)->count() == 1) {
                $bankAccount->setAsPrimary();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Rekening bank berhasil ditambahkan',
                'data' => $bankAccount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan rekening bank',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create withdrawal request
     */
    public function createWithdrawal(Request $request)
    {
        $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'required|numeric|min:50000', // Minimum 50k
            'notes' => 'nullable|string|max:500'
        ]);

        $user = auth()->user();

        // Check if user is panitia
        if (!$user->isPanitia()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya panitia yang dapat melakukan withdrawal'
            ], 403);
        }

        // Check if bank account belongs to user
        $bankAccount = BankAccount::where('id', $request->bank_account_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$bankAccount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekening bank tidak ditemukan'
            ], 404);
        }

        // Check if bank account is verified
        if (!$bankAccount->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekening bank belum diverifikasi oleh admin'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $withdrawal = Withdrawal::createWithdrawal(
                $user->id,
                $request->bank_account_id,
                $request->amount,
                $request->notes
            );

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Permintaan withdrawal berhasil dibuat',
                'data' => [
                    'withdrawal_code' => $withdrawal->withdrawal_code,
                    'amount' => $withdrawal->formatted_amount,
                    'admin_fee' => 'Rp ' . number_format($withdrawal->admin_fee),
                    'net_amount' => $withdrawal->formatted_net_amount,
                    'status' => $withdrawal->status,
                    'bank_account' => [
                        'bank_name' => $bankAccount->bank_name,
                        'account_number' => $bankAccount->masked_account_number,
                        'account_holder_name' => $bankAccount->account_holder_name
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get withdrawal history
     */
    public function getWithdrawalHistory(Request $request)
    {
        $user = auth()->user();
        
        $withdrawals = Withdrawal::with(['bankAccount'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        $withdrawals->getCollection()->transform(function ($withdrawal) {
            return [
                'id' => $withdrawal->id,
                'withdrawal_code' => $withdrawal->withdrawal_code,
                'amount' => $withdrawal->formatted_amount,
                'admin_fee' => 'Rp ' . number_format($withdrawal->admin_fee),
                'net_amount' => $withdrawal->formatted_net_amount,
                'status' => $withdrawal->status,
                'status_badge' => $withdrawal->status_badge,
                'bank_account' => [
                    'bank_name' => $withdrawal->bankAccount->bank_name,
                    'account_number' => $withdrawal->bankAccount->masked_account_number,
                    'account_holder_name' => $withdrawal->bankAccount->account_holder_name
                ],
                'notes' => $withdrawal->notes,
                'admin_notes' => $withdrawal->admin_notes,
                'requested_at' => $withdrawal->requested_at?->format('d M Y H:i'),
                'approved_at' => $withdrawal->approved_at?->format('d M Y H:i'),
                'completed_at' => $withdrawal->completed_at?->format('d M Y H:i')
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $withdrawals
        ]);
    }

    /**
     * Get withdrawal summary for organizer
     */
    public function getWithdrawalSummary()
    {
        $user = auth()->user();
        
        $panitiaProfile = PanitiaProfile::where('user_id', $user->id)->first();
        
        if (!$panitiaProfile) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profile panitia tidak ditemukan'
            ], 404);
        }

        // Get withdrawal statistics
        $totalWithdrawn = Withdrawal::where('user_id', $user->id)
            ->where('status', 'completed')
            ->sum('net_amount');

        $pendingWithdrawals = Withdrawal::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved', 'processed'])
            ->sum('amount');

        $totalRequests = Withdrawal::where('user_id', $user->id)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'current_balance' => $panitiaProfile->saldo,
                'available_balance' => $panitiaProfile->saldo, // After pending withdrawals
                'total_withdrawn' => $totalWithdrawn,
                'pending_withdrawals' => $pendingWithdrawals,
                'total_requests' => $totalRequests,
                'withdrawal_settings' => [
                    'minimum_amount' => 50000,
                    'admin_fee' => 2500,
                    'processing_time' => '1-3 hari kerja'
                ]
            ]
        ]);
    }
}

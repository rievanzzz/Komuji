<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PanitiaProfile;
use App\Models\Setting;
use App\Models\Notification;
use App\Notifications\SendOtpNotification;
use App\Notifications\VerifyEmailNotification;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // ========================
    // Register (Peserta default)
    // ========================
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'no_handphone' => 'required|string|max:20',
            'alamat' => 'required|string',
            'pendidikan_terakhir' => 'required|in:SD/MI,SMP/MTS,SMA/SMK,Diploma,Sarjana,Lainnya',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',      // huruf besar
                'regex:/[a-z]/',      // huruf kecil
                'regex:/[0-9]/',      // angka
                'regex:/[\W_]/'       // karakter spesial
            ],
        ]);

        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT); // OTP 6 digit dengan leading zero
        $otpExpiresAt = Carbon::now()->addMinutes(5);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'no_handphone' => $request->no_handphone,
            'alamat' => $request->alamat,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'password' => Hash::make($request->password),
            'otp' => $otp,
            'otp_expires_at' => $otpExpiresAt,
            'status_akun' => 'belum_verifikasi',
            'role' => 'peserta',
        ]);

        // Kirim OTP via email secara langsung (synchronous)
        try {
            Mail::send('emails.otp', ['otp' => $otp, 'user' => $user], function($message) use ($user) {
                $message->to($user->email)
                        ->subject('Kode Verifikasi OTP - ' . config('app.name'));
            });
            \Log::info('OTP email sent to: ' . $user->email);
        } catch (\Exception $e) {
            \Log::error('Gagal mengirim email OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Berhasil mendaftar, tetapi gagal mengirim email OTP. Silakan coba login untuk mengirim ulang OTP.'
            ], 201);
        }

        return response()->json([
            'message' => 'Registrasi berhasil, silakan cek email untuk kode OTP'
        ], 201);
    }

    // ========================
    // Verifikasi OTP
    // ========================
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek apakah OTP cocok
        if ($user->otp !== $request->otp) {
            return response()->json([
                'message' => 'Kode OTP tidak valid.'
            ], 400);
        }

        // Cek apakah OTP sudah kadaluarsa
        if (now()->gt($user->otp_expires_at)) {
            return response()->json([
                'message' => 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
            ], 400);
        }

        // Verifikasi berhasil
        $user->email_verified_at = now();
        $user->status_akun = 'aktif';
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        // Generate token untuk login otomatis
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Verifikasi berhasil. Akun Anda sudah aktif.',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->status_akun === 'aktif') {
            return response()->json(['message' => 'Akun sudah terverifikasi'], 400);
        }

        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = now()->addMinutes(5);

        $user->update([
            'otp' => $otp,
            'otp_expires_at' => $otpExpiresAt,
        ]);

        // Kirim OTP via email secara langsung (synchronous)
        try {
            Mail::send('emails.otp', ['otp' => $otp, 'user' => $user], function($message) use ($user) {
                $message->to($user->email)
                        ->subject('Kode Verifikasi OTP Baru - ' . config('app.name'));
            });
            Log::info('OTP resend email sent to: ' . $user->email);
            
            return response()->json([
                'message' => 'Kode OTP baru telah dikirim ke email Anda'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Gagal mengirim ulang email OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengirim email OTP. Silakan coba beberapa saat lagi.'
            ], 500);
        }
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Link verifikasi tidak valid.'
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi sebelumnya.'
            ], 400);
        }

        $user->markEmailAsVerified();
        $user->status_akun = 'aktif';
        $user->save();

        return response()->json([
            'message' => 'Email berhasil diverifikasi. Silakan login.'
        ], 200);
    }


    // ========================
    // Login
    // ========================
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        if ($user->status_akun !== 'aktif') {
            return response()->json([
                'message' => 'Akun belum diverifikasi. Silakan verifikasi email dan OTP terlebih dahulu.'
            ], 403);
        }

        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email belum diverifikasi. Silakan cek email Anda untuk verifikasi.'
            ], 403);
        }

        // Hapus token lama jika ada
        $user->tokens()->delete();
        
        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    // ========================
    // Logout
    // ========================
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ], 200);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        // Generate OTP untuk reset password
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = Carbon::now()->addMinutes(5);

        // Update user dengan OTP reset password
        $user->update([
            'reset_otp' => $otp,
            'reset_otp_expires_at' => $otpExpiresAt,
        ]);

        // Kirim OTP via email
        try {
            Mail::send('emails.reset-password-otp', ['otp' => $otp, 'user' => $user], function($message) use ($user) {
                $message->to($user->email)
                        ->subject('Kode Reset Password - ' . config('app.name'));
            });
            
            return response()->json([
                'message' => 'Kode OTP untuk reset password telah dikirim ke email Anda'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Gagal mengirim email reset password OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengirim email OTP. Silakan coba beberapa saat lagi.'
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[\W_]/'
            ],
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek apakah OTP cocok
        if ($user->reset_otp !== $request->otp) {
            return response()->json([
                'message' => 'Kode OTP tidak valid.'
            ], 400);
        }

        // Cek apakah OTP sudah kadaluarsa
        if (now()->gt($user->reset_otp_expires_at)) {
            return response()->json([
                'message' => 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
            ], 400);
        }

        // Reset password berhasil
        $user->update([
            'password' => Hash::make($request->password),
            'reset_otp' => null,
            'reset_otp_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru.'
        ], 200);
    }

    // ========================
    // Register Panitia (Event Organizer)
    // ========================
    public function registerPanitia(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'no_handphone' => 'required|string|max:20',
            'alamat' => 'required|string',
            'pendidikan_terakhir' => 'required|in:SD/MI,SMP/MTS,SMA/SMK,Diploma,Sarjana,Lainnya',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',      // huruf besar
                'regex:/[a-z]/',      // huruf kecil
                'regex:/[0-9]/',      // angka
                'regex:/[\W_]/'       // karakter spesial
            ],
            // Additional panitia fields
            'organization_name' => 'required|string|max:255',
            'organization_description' => 'required|string|max:1000',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255'
        ]);

        try {
            DB::beginTransaction();

            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $otpExpiresAt = Carbon::now()->addMinutes(5);

            // Create user with panitia role
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'no_handphone' => $request->no_handphone,
                'alamat' => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'password' => Hash::make($request->password),
                'otp' => $otp,
                'otp_expires_at' => $otpExpiresAt,
                'status_akun' => 'belum_verifikasi',
                'role' => 'panitia',
            ]);

            // Create panitia profile
            $autoApprove = Setting::get('auto_approve_panitia', false);
            $trialDays = Setting::get('trial_duration_days', 60);
            $maxEvents = Setting::get('premium_max_active_events', 999);

            $panitiaProfile = PanitiaProfile::create([
                'user_id' => $user->id,
                'status' => $autoApprove ? 'approved' : 'pending',
                'plan_type' => 'trial',
                'trial_start' => $autoApprove ? now() : null,
                'trial_end' => $autoApprove ? now()->addDays($trialDays) : null,
                'max_active_events' => $autoApprove ? $maxEvents : 1,
                'organization_name' => $request->organization_name,
                'organization_description' => $request->organization_description,
                'phone' => $request->phone,
                'address' => $request->address,
                'website' => $request->website
            ]);

            // If auto approved, start trial immediately
            if ($autoApprove) {
                $panitiaProfile->update([
                    'approved_at' => now(),
                    'approved_by' => null // System approved
                ]);
                
                // Send approval notification
                Notification::notifyPanitiaApproved($user->id);
            }

            DB::commit();

            // Send OTP email
            try {
                Mail::send('emails.otp', ['otp' => $otp, 'user' => $user], function($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Kode Verifikasi OTP - Pendaftaran Panitia');
                });
                Log::info('Panitia OTP email sent to: ' . $user->email);
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email OTP panitia: ' . $e->getMessage());
            }

            $message = $autoApprove 
                ? 'Registrasi panitia berhasil dan langsung disetujui! Silakan verifikasi email dengan OTP.'
                : 'Registrasi panitia berhasil! Silakan verifikasi email dan tunggu persetujuan admin.';

            return response()->json([
                'message' => $message,
                'status' => $autoApprove ? 'approved' : 'pending',
                'otp' => config('app.debug') ? $otp : null // Only in debug mode
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Panitia registration error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Gagal mendaftar sebagai panitia. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // ========================
    // Get Registration Options
    // ========================
    public function getRegistrationOptions()
    {
        try {
            $options = [
                'roles' => [
                    [
                        'value' => 'peserta',
                        'label' => 'Peserta Event',
                        'description' => 'Daftar dan ikuti berbagai event menarik'
                    ],
                    [
                        'value' => 'panitia',
                        'label' => 'Panitia Event',
                        'description' => 'Buat dan kelola event Anda sendiri'
                    ]
                ],
                'panitia_info' => [
                    'auto_approve' => Setting::get('auto_approve_panitia', false),
                    'trial_duration' => Setting::get('trial_duration_days', 60),
                    'premium_price' => Setting::get('premium_monthly_price', 100000),
                    'features' => [
                        'trial' => [
                            'duration' => Setting::get('trial_duration_days', 60) . ' hari',
                            'max_events' => 'Unlimited',
                            'analytics' => 'Lengkap',
                            'support' => 'Priority'
                        ],
                        'free' => [
                            'max_events' => Setting::get('free_max_active_events', 1),
                            'analytics' => 'Basic',
                            'support' => 'Standard'
                        ],
                        'premium' => [
                            'max_events' => 'Unlimited',
                            'analytics' => 'Advanced',
                            'support' => 'Priority',
                            'promotion' => 'Homepage featured'
                        ]
                    ]
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $options
            ]);
        } catch (\Exception $e) {
            Log::error('Get registration options error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil opsi registrasi'
            ], 500);
        }
    }
}

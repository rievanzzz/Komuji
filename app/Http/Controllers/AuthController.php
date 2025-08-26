<?php

namespace App\Http\Controllers;

use App\Models\User;
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
                'message' => 'Berhasil mendaftar, tetapi gagal mengirim email OTP. Silakan coba login untuk mengirim ulang OTP.',
                'otp' => $otp // Hanya untuk development
            ], 201);
        }

        return response()->json([
            'message' => 'Registrasi berhasil, silakan cek email untuk kode OTP',
            'otp' => $otp // Hanya untuk development, hapus di production
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
                'message' => 'Kode OTP baru telah dikirim ke email Anda',
                'otp' => $otp // Hanya untuk development, hapus di production
            ]);
            
        } catch (\Exception $e) {
            Log::error('Gagal mengirim ulang email OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengirim email OTP. Silakan coba beberapa saat lagi.',
                'otp' => $otp // Hanya untuk development
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
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Link reset password telah dikirim ke email Anda.'], 200)
            : response()->json(['message' => 'Gagal mengirim link reset password.'], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
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

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status == Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password berhasil direset. Silakan login dengan password baru.'], 200)
            : response()->json(['message' => 'Gagal mereset password. Token tidak valid atau sudah kadaluwarsa.'], 400);
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtp;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OtpController extends Controller
{
    /**
     * Verifikasi OTP
     */
    public function verify(Request $request): JsonResponse
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

        return response()->json([
            'message' => 'Verifikasi berhasil. Akun Anda sudah aktif.'
        ]);
    }

    /**
     * Kirim ulang OTP
     */
    public function resend(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();
        
        // Generate OTP baru
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();

        // Kirim email OTP
        try {
            Mail::to($user->email)->send(new SendOtp($otp));
        } catch (\Exception $e) {
            // Log error tapi tetap lanjutkan
            \Log::error('Gagal mengirim email OTP: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Kode OTP baru telah dikirim ke email Anda.',
            'otp' => $otp // Hanya untuk development, hapus di production
        ]);
    }
}

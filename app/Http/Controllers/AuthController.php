<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

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
                'regex:/[\W_]/'       // karakter spesial (lebih fleksibel)
            ],
        ]);

        $otp = rand(100000, 999999); // OTP 6 digit
        $otp_expired = Carbon::now()->addMinutes(5); // expired 5 menit (bisa disimpan ke tabel kalau perlu)

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'no_handphone' => $request->no_handphone,
            'alamat' => $request->alamat,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'password' => Hash::make($request->password),
            'role' => 'peserta',
            'status_akun' => 'belum_aktif',
            'otp' => $otp,
        ]);

        // TODO: kirim OTP ke email user
        // Mail::to($user->email)->send(new OtpMail($otp));

        return response()->json([
            'message' => 'Registrasi berhasil, silakan verifikasi OTP yang dikirim ke email.',
            'otp' => $otp, // sementara ditampilkan untuk testing Postman
            'user' => $user
        ], 201); // pakai 201 Created
    }

    // ========================
    // Verifikasi OTP
    // ========================
    public function verifyOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp'   => 'required' // jangan pakai numeric supaya bisa string/angka
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'message' => 'User tidak ditemukan'
        ], 404);
    }

    if ((string)$user->otp !== (string)$request->otp) {
        return response()->json([
            'message' => 'OTP salah'
        ], 400);
    }

    $user->status_akun = 'aktif';
    $user->otp = null;
    $user->save();

    return response()->json([
        'message' => 'Akun berhasil diverifikasi, silakan login.'
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
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah'],
            ]);
        }

        if ($user->status_akun !== 'aktif') {
            return response()->json([
                'message' => 'Akun belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.'
            ], 403);
        }

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
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ], 200);
    }
}

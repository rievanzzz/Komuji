<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get authenticated user data
     */
    public function profile(): JsonResponse
    {
        $user = auth()->user();
        
        // Map database field names to frontend expected field names
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->no_handphone, // Map no_handphone to phone
            'no_handphone' => $user->no_handphone, // Keep original for compatibility
            'address' => $user->alamat, // Map alamat to address
            'alamat' => $user->alamat, // Keep original for compatibility
            'last_education' => $user->pendidikan_terakhir, // Map pendidikan_terakhir to last_education
            'pendidikan_terakhir' => $user->pendidikan_terakhir, // Keep original for compatibility
            'role' => $user->role,
            'status_akun' => $user->status_akun,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'email_verified_at' => $user->email_verified_at
        ];
        
        return response()->json([
            'status' => 'success',
            'data' => $userData
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $user->update($request->validated());

            // Return updated user data with proper field mapping
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->no_handphone, // Map no_handphone to phone
                'no_handphone' => $user->no_handphone, // Keep original for compatibility
                'address' => $user->alamat, // Map alamat to address
                'alamat' => $user->alamat, // Keep original for compatibility
                'last_education' => $user->pendidikan_terakhir, // Map pendidikan_terakhir to last_education
                'pendidikan_terakhir' => $user->pendidikan_terakhir, // Keep original for compatibility
                'role' => $user->role,
                'status_akun' => $user->status_akun,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'email_verified_at' => $user->email_verified_at
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui',
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // Update password
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            // Revoke all tokens (logout all devices)
            $user->tokens()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Password berhasil diubah. Silakan login kembali.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengubah password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

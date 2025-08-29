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
        return response()->json([
            'status' => 'success',
            'data' => auth()->user()
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

            return response()->json([
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui',
                'data' => $user->fresh()
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

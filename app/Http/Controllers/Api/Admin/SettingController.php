<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Get all settings grouped by category
     */
    public function index(): JsonResponse
    {
        try {
            $settings = Setting::orderBy('group')->orderBy('key')->get();

            $groupedSettings = $settings->groupBy('group')->map(function ($group) {
                return $group->map(function ($setting) {
                    return [
                        'id' => $setting->id,
                        'key' => $setting->key,
                        'value' => $setting->formatted_value,
                        'type' => $setting->type,
                        'description' => $setting->description,
                        'is_public' => $setting->is_public
                    ];
                });
            });

            return response()->json([
                'status' => 'success',
                'data' => $groupedSettings
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get settings error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil pengaturan'
            ], 500);
        }
    }

    /**
     * Get business settings specifically
     */
    public function business(): JsonResponse
    {
        try {
            $businessSettings = Setting::getGroup('business');

            return response()->json([
                'status' => 'success',
                'data' => $businessSettings
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get business settings error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil pengaturan bisnis'
            ], 500);
        }
    }

    /**
     * Update a setting
     */
    public function update(Request $request, $key): JsonResponse
    {
        $request->validate([
            'value' => 'required',
            'type' => 'sometimes|in:string,number,boolean,json'
        ]);

        try {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pengaturan tidak ditemukan'
                ], 404);
            }

            // Validate value based on type
            $value = $request->value;
            $type = $request->type ?? $setting->type;

            if ($type === 'number' && !is_numeric($value)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nilai harus berupa angka'
                ], 422);
            }

            if ($type === 'boolean') {
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($value === null) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Nilai harus berupa boolean (true/false)'
                    ], 422);
                }
                $value = $value ? 'true' : 'false';
            }

            if ($type === 'json') {
                $decoded = json_decode($value, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Format JSON tidak valid'
                    ], 422);
                }
            }

            $setting->update([
                'value' => $value,
                'type' => $type
            ]);

            Log::info('Setting updated', [
                'key' => $key,
                'old_value' => $setting->getOriginal('value'),
                'new_value' => $value,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengaturan berhasil diperbarui',
                'data' => [
                    'key' => $setting->key,
                    'value' => $setting->formatted_value,
                    'type' => $setting->type
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Admin update setting error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui pengaturan'
            ], 500);
        }
    }

    /**
     * Update multiple settings at once
     */
    public function updateBatch(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'sometimes|in:string,number,boolean,json'
        ]);

        try {
            $updatedSettings = [];

            foreach ($request->settings as $settingData) {
                $setting = Setting::where('key', $settingData['key'])->first();

                if (!$setting) {
                    continue;
                }

                $value = $settingData['value'];
                $type = $settingData['type'] ?? $setting->type;

                // Validate and format value
                if ($type === 'number' && !is_numeric($value)) {
                    continue;
                }

                if ($type === 'boolean') {
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                    if ($value === null) continue;
                    $value = $value ? 'true' : 'false';
                }

                if ($type === 'json') {
                    $decoded = json_decode($value, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        continue;
                    }
                }

                $setting->update([
                    'value' => $value,
                    'type' => $type
                ]);

                $updatedSettings[] = [
                    'key' => $setting->key,
                    'value' => $setting->formatted_value,
                    'type' => $setting->type
                ];
            }

            Log::info('Batch settings updated', [
                'count' => count($updatedSettings),
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => count($updatedSettings) . ' pengaturan berhasil diperbarui',
                'data' => $updatedSettings
            ]);
        } catch (\Exception $e) {
            Log::error('Admin batch update settings error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui pengaturan'
            ], 500);
        }
    }

    /**
     * Reset settings to default
     */
    public function reset(): JsonResponse
    {
        try {
            // Reset to default values
            $defaultSettings = [
                'platform_fee_percentage' => '10.00',
                'premium_monthly_price' => '100000',
                'trial_duration_days' => '60',
                'free_max_active_events' => '1',
                'premium_max_active_events' => '999',
                'auto_approve_panitia' => 'false'
            ];

            foreach ($defaultSettings as $key => $value) {
                Setting::where('key', $key)->update(['value' => $value]);
            }

            // Clear cache
            Cache::flush();

            Log::info('Settings reset to default', [
                'reset_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengaturan berhasil direset ke default'
            ]);
        } catch (\Exception $e) {
            Log::error('Admin reset settings error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mereset pengaturan'
            ], 500);
        }
    }

    /**
     * Get public settings (for frontend)
     */
    public function public(): JsonResponse
    {
        try {
            $publicSettings = Setting::getPublic();

            return response()->json([
                'status' => 'success',
                'data' => $publicSettings
            ]);
        } catch (\Exception $e) {
            Log::error('Get public settings error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil pengaturan publik'
            ], 500);
        }
    }
}

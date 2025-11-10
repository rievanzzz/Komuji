<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'group',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean'
    ];

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    // Static methods for easy access
    public static function get($key, $default = null)
    {
        $cacheKey = "setting_{$key}";
        
        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }
            
            return self::castValue($setting->value, $setting->type);
        });
    }

    public static function set($key, $value, $type = 'string')
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type
            ]
        );

        // Clear cache
        Cache::forget("setting_{$key}");
        
        return $setting;
    }

    public static function getGroup($group)
    {
        $cacheKey = "settings_group_{$group}";
        
        return Cache::remember($cacheKey, 3600, function () use ($group) {
            return self::byGroup($group)->get()->mapWithKeys(function ($setting) {
                return [$setting->key => self::castValue($setting->value, $setting->type)];
            });
        });
    }

    public static function getPublic()
    {
        $cacheKey = "settings_public";
        
        return Cache::remember($cacheKey, 3600, function () {
            return self::public()->get()->mapWithKeys(function ($setting) {
                return [$setting->key => self::castValue($setting->value, $setting->type)];
            });
        });
    }

    public static function clearCache($key = null)
    {
        if ($key) {
            Cache::forget("setting_{$key}");
        } else {
            // Clear all settings cache
            Cache::flush();
        }
    }

    private static function castValue($value, $type)
    {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($value) ? (float) $value : $value;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    // Accessor for formatted value
    public function getFormattedValueAttribute()
    {
        return self::castValue($this->value, $this->type);
    }

    // Mutator to clear cache when updated
    protected static function booted()
    {
        static::saved(function ($setting) {
            self::clearCache($setting->key);
        });

        static::deleted(function ($setting) {
            self::clearCache($setting->key);
        });
    }
}

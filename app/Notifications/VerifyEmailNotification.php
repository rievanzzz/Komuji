<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $verificationUrl;

    public function __construct($user)
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(30),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $this->verificationUrl = str_replace(
            url('/api'), 
            config('app.frontend_url'),
            $verificationUrl
        );
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Verifikasi Alamat Email Anda')
            ->line('Silakan klik tombol di bawah untuk memverifikasi alamat email Anda.')
            ->action('Verifikasi Email', $this->verificationUrl)
            ->line('Link verifikasi ini akan kedaluwarsa dalam 30 menit.')
            ->line('Jika Anda tidak membuat permintaan ini, abaikan email ini.');
    }
}

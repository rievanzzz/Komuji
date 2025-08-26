<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPassword extends ResetPasswordNotification implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable)
    {
        $url = url(config('app.frontend_url').'/reset-password?token='.$this->token.'&email='.urlencode($notifiable->email));

        return (new MailMessage)
            ->subject('Reset Kata Sandi')
            ->line('Anda menerima email ini karena kami menerima permintaan reset kata sandi untuk akun Anda.')
            ->action('Reset Kata Sandi', $url)
            ->line('Link reset password ini akan kedaluwarsa dalam 60 menit.')
            ->line('Jika Anda tidak meminta reset kata sandi, tidak ada tindakan lebih lanjut yang diperlukan.');
    }
}

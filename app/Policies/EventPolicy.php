<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Auth\Access\HandlesAuthorization;

class EventPolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability)
    {
        if ($user->role === 'admin') {
            return true;
        }
    }

    public function viewAny(User $user)
    {
        return in_array($user->role, ['admin', 'panitia']);
    }

    public function view(User $user, Event $event)
    {
        return $user->role === 'panitia' && $user->id === $event->created_by;
    }

    public function create(User $user)
    {
        return $user->role === 'panitia';
    }

    public function update(User $user, Event $event)
    {
        return $user->role === 'panitia' && $user->id === $event->created_by;
    }

    public function delete(User $user, Event $event)
    {
        return $user->role === 'panitia' && $user->id === $event->created_by;
    }
}

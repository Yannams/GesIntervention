<?php

namespace App\Events;

use App\Models\Intervention;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InterventionCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

       public $intervention;

    /**
     * Create a new event instance.
     */
    public function __construct(Intervention $intervention)
    {
          $this->intervention = $intervention;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
         return [
            'id' => $this->intervention->id,
            'lat' => $this->intervention->latitude,
            'lng' => $this->intervention->longitude,
            'user' => $this->intervention->user->name ?? '',
            'label' => $this->intervention->site->nom_site ?? 'Intervention',
            'created_at' => $this->intervention->created_at->diffForHumans(),
        ];
    }

     public function broadcastAs()
    {
        return 'InterventionCreated';
    }
}

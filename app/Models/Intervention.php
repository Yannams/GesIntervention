<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Intervention extends Model
{
    /** @use HasFactory<\Database\Factories\InterventionFactory> */
    use HasFactory;

    protected $fillable = ['nature', 'tache_effectuee','observation','personne_rencontree','telephone','date_heure_intervention','latitude','longitude','site_id','user_id'];

    public function site():BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

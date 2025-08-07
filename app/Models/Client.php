<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    /** @use HasFactory<\Database\Factories\ClientFactory> */
    use HasFactory;
     protected $fillable = ['raison_social','tel_structure','user_id'];

    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }

    public function sites(): HasMany{
        return $this->hasMany(Site::class);
    }
}

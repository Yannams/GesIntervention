<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    /** @use HasFactory<\Database\Factories\SiteFactory> */
    use HasFactory;
    
    protected $fillable = [	'id','nom_site','indication','quartier','personne_a_contacter','contact_personne','fonction_personne','latitude','longitude','client_id'];

    public function client(): BelongsTo{
        return $this->belongsTo(Client::class);
    }

    public function interventions():HasMany
    {
        return $this->hasMany(Intervention::class);
    }
}

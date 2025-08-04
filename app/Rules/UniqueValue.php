<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class UniqueValue implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */

    protected string $table;
    protected string $champ;
    protected ?int $ignoreId;
     public function __construct(string $table, string $champ, ?int $ignoreId = null)
    {
        $this->table = $table;
        $this->champ = $champ;
        $this->ignoreId = $ignoreId;
    }
    public function validate(string $attribute, mixed $value, Closure $fail ): void
    {
        $valeurNormalisee = strtolower(str_replace(' ', '', $value));

        $query = DB::table($this->table)
            ->whereRaw("REPLACE(LOWER({$this->champ}), ' ', '') = ?", [$valeurNormalisee]);

        if ($this->ignoreId) {
            $query->where('id', '!=', $this->ignoreId);
        }

        if ($query->exists()) {
            $fail("La valeur du champ est déjà utilisée (en ignorant les espaces et majuscules).");
        }
    
    }
}

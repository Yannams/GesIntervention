<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('interventions', function (Blueprint $table) {
            $table->id();
            $table->string('nature');
            $table->text('tache_effectuee');
            $table->text('observation')->nullable();
            $table->string('personne_rencontree')->nullable();
            $table->string('telephone',20)->nullable();
            $table->dateTime('date_heure_intervention');
            $table->decimal('longitude',10,7);
            $table->decimal('latitude',10,7);
            $table->unsignedBigInteger('site_id');
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interventions');
    }
};

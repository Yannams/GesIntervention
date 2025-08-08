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
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('nom_site')->unique();
            $table->text('indication')->nullable();
            $table->string('quartier')->nullable();
            $table->decimal('longitude',10,7)->nullable();
            $table->decimal('latitude',10,7)->nullable();
            $table->string('personne_a_contacter')->nullable();
            $table->string('contact_personne')->nullable();
            $table->string('fonction_personne')->nullable();
            $table->unsignedBigInteger('client_id');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
             $table->unique(['client_id', 'contact_personne']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};

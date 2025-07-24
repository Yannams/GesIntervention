<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\InterventionController;
use App\Http\Controllers\SiteController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $user=Auth::user();
    if ($user->hasRole('User')) {
        return to_route('intervention.create');
    }elseif($user->hasRole('Admin')) {
        return to_route('dashboard');
    }
})->name('home')->middleware(['auth','verified']);

Route::middleware(['auth', 'verified','role:Admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/users/create',function () {
    return Inertia::render('users/create');
})->name('CreateUser')->middleware(['auth','verified',"role:Admin"]);

Route::get('/users',function () {
    $users=User::role('User')->get(['name', 'email', 'num_user']);
    return Inertia::render('users/index',['users'=>$users]);
})->name('usersList')->middleware(['auth','verified',"role:Admin"]);

Route::post('site/addLocation',[SiteController::class,'addLocation'])->name('addLocation');
Route::get('client/mesClients/{user}',[ClientController::class,'mesClients'])->name('mesClients');
Route::get('intervention/mesIntervention/{user}',[InterventionController::class,'mesInterventions'])->name('mesInterventions');
Route::get('site/FindLocation',[SiteController::class,'findLocation'])->name('findLocation');

Route::resource('intervention',InterventionController::class);
Route::resource('client',ClientController::class);
Route::resource('site',SiteController::class);
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

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
    $users=User::role('User')->get(['id','name', 'email', 'num_user']);
    return Inertia::render('users/index',['users'=>$users]);
})->name('usersList')->middleware(['auth','verified',"role:Admin"]);

Route::post('site/addLocation',[SiteController::class,'addLocation'])->name('addLocation')->middleware('auth');
Route::get('client/mesClients',[ClientController::class,'mesClients'])->name('mesClients')->middleware('auth','role:User');
Route::get('site/FindLocation',[SiteController::class,'findLocation'])->name('findLocation')->middleware('auth');
Route::get('intervention/mesIntervention',[InterventionController::class,'mesInterventions'])->name('mesInterventions')->middleware('auth','role:User');
Route::get('intervention/mesSite',[SiteController::class,'mesSites'])->name('mesSites')->middleware('auth','role:User');
Route::get('/interventions/localisations',[InterventionController::class,'LocateInterventions'])->name('LocateInterventions');
Route::get('/interventions/Total',[InterventionController::class,'TotalInterventions'])->name('TotalInterventions');
Route::get('/interventions/active',[InterventionController::class,'Active'])->name('Active');
Route::get('/interventions/latest',[InterventionController::class,'Latest'])->name('Latest');
Route::get('/user/{user}/interventions',[InterventionController::class,'UsersIntervention'])->name('UsersIntervention')->middleware('auth','role:Admin');

Route::resource('intervention',InterventionController::class)->middleware('auth');
Route::resource('client',ClientController::class)->middleware('auth');
Route::resource('site',SiteController::class)->middleware('auth');
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

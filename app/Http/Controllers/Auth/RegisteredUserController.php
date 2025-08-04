<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validatedData=$request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'num_user'=>'required|unique:users,num_user|regex:/^(?:\+229)?(0[1-9]\d{8})$/',
        ]);

        if (!empty($validatedData['num_user']) && preg_match('/^01\d{8}$/', $validatedData['num_user'])) {
            $validatedData['num_user'] = '+229' . $validatedData['num_user'];
        }
       
        $validatedData['password']=Hash::make('tech@evolutio');
        $user = User::create($validatedData);
        $user->assignRole('User');
        return redirect()->route('usersList');
    }
}

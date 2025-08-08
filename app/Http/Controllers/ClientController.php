<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Site;
use App\Models\User;
use App\Rules\UniqueValue;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients=Client::all();
        return Inertia::render('client/index',[
            'clients'=>$clients
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
       return Inertia::render('client/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
      
       $validatedData=$request->validate([
            'raison_social'=>['required', new UniqueValue('clients', 'raison_social')],
            'tel_structure'=>'nullable|unique:clients,tel_structure|regex:/^\+?\d+$/|max:20'
       ]);
       $client=Client::create([
            'raison_social'=>$validatedData['raison_social'],
            'tel_structure'=>$validatedData['tel_structure'],
            'user_id'=>Auth::id()
       ]);
       return redirect()->back()->with('newClient',$client);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $message=session('message');
        $sites=Site::where('client_id',$client->id)->where('user_id',Auth::id())->get();
        return Inertia::render('client/show',[
            'client'=>$client,
            'sites'=>$sites,
            'message'=>$message
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        return Inertia::render('client/edit',['client'=>$client]);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $validatedData=$request->validate([
            'raison_social'=>['required', new UniqueValue('clients', 'raison_social',$client->id)],
            'tel_structure'=>'nullable|unique:clients,tel_structure,' . $client->id.'|regex:/^\+?\d+$/|max:20'
        ]);

        $client->update([
            'raison_social'=>$validatedData['raison_social'],
            'tel_structure'=>$validatedData['tel_structure'],
        ]);
       return redirect()->route('client.show',$client->id)->with('message',['success'=>'la modification du client a été enregistré']);
    }

    /*
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        //
    }

    public function mesClients(User $user ){
        $clients=Client::with('sites')->where('user_id', Auth::id())->get();
        return Inertia::render('client/mesClients',['clients'=>$clients]);
    }
}

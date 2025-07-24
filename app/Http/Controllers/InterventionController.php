<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use App\Http\Requests\StoreInterventionRequest;
use App\Http\Requests\UpdateInterventionRequest;
use App\Models\Client;
use App\Models\Site;
use App\Models\User;
use Inertia\Inertia;

class InterventionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clients=Client::all();
        $newClient='';
        $newSite='';
        $sites=Site::all();

        if (session('newClient')) {
            $newClient=session('newClient');
        }
         if (session('newSite')) {
            $newSite=session('newSite');
        }

        return Inertia::render('intervention/create',[
            'clients'=>$clients,
            'newClient'=>$newClient,
            'sites'=>$sites,
            'newSite'=>$newSite,

        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInterventionRequest $request)
    {
        $validatedData=$request->validate([
            'nature'=>'required',
            'tache_effectuee'=>'required',
            'observation'=>'required',
            'personne_rencontree'=>'nullable|string',
            'telephone'=>'nullable|regex:/^\+?[0-9]+$/',
            'date_heure_intervention'=>'required',
            'longitude'=>'required|decimal:0,7',
            'latitude'=>'required|decimal:0,7',
            'site_id'=>'exists:sites,id'
        ]);

        $validatedData['user_id']=auth()->id();
        Intervention::create($validatedData);
        return redirect()->route('intervention.create');    
    }

    /**
     * Display the specified resource.
     */
    public function show(Intervention $intervention)
    {
        $intervention=Intervention::find($intervention->id);
        $intervention->nom_site=$intervention->site->nom_site;
        $intervention->nom_client=$intervention->site->client->raison_social;
        $intervention->formatedDate=date('d/m/Y H:m',strtotime($intervention->date_heure_intervention));
        return Inertia::render('intervention/show',['intervention'=>$intervention]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Intervention $intervention)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInterventionRequest $request, Intervention $intervention)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Intervention $intervention)
    {
        //
    }

     public function mesInterventions(User $user ){
        $interventions=Intervention::where('user_id', $user->id)->get()->map(function ($intervention) {
            $intervention->nom_client=$intervention->site->client->raison_social;
            $intervention->nom_site=$intervention->site->nom_site;
            return $intervention;
        });
        return Inertia::render('intervention/mesInterventions',['interventions'=>$interventions]);
    }
}

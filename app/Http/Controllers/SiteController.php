<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Http\Requests\StoreSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use App\Models\Client;
use App\Models\User;
use App\Rules\UniqueValue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $newClient='';
        $newSite='';
        if (session('newClient')) {
            $newClient=session('newClient');

        }
         if (session('newSite')) {
            $newSite=session('newSite');

        }
        if ($request->query('slctdClt')) {
            $newClient=Client::find($request->query('slctdClt'));   
        }
        $clients=Client::all();
        return Inertia::render('site/create',[
            'clients'=>$clients,
            'newClient'=>$newClient,
            'newSite'=>$newSite
        ]);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSiteRequest $request)
    {
        $validatedData=$request->validate([
        	'nom_site'=>['required', new UniqueValue('sites', 'nom_site')],
            'indication'=>'nullable|string',
            'quartier'=>'required|string',
            'personne_a_contacter'=>'nullable|string',
            'contact_personne'=>'nullable|regex:/^(?:\+229)?(0[1-9]\d{8})$/',
            'fonction_personne'=>'nullable|string',
            'client_id'=>'required|exists:clients,id',
        ]);
        if (!empty($validatedData['contact_personne']) && preg_match('/^01\d{8}$/', $validatedData['contact_personne'])) {
            $validatedData['contact_personne'] = '+229' . $validatedData['contact_personne'];
        }
        $validatedData['user_id']=Auth::id();
        $site=Site::create($validatedData);
        return redirect()->back()->with('newSite',$site);

    }

    /**
     * Display the specified resource.
     */
    public function show(Site $site,Request $request)
    {
        $message=session('message');
        $site=Site::find($site->id);
        $site->nom_client= $site->client->raison_social;
        return Inertia::render('site/show',[
            'site'=>$site,
            'message'=>$message
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Site $site)
    {
        $newClient=Client::find($site->client_id);
        $newSite='';
        if (session('newClient')) {
            $newClient=session('newClient');

        }
         if (session('newSite')) {
            $newSite=session('newSite');

        }
      
        $clients=Client::all();
        return Inertia::render('site/edit',[
            'clients'=>$clients,
            'newClient'=>$newClient,
            'newSite'=>$newSite,
            'site'=>$site
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSiteRequest $request, Site $site)
    {

        $validatedData=$request->validate([
        	'nom_site'=>['required', new UniqueValue('sites', 'nom_site',$site->id)],
            'indication'=>'nullable|string',
            'quartier'=>'required|string',
            'personne_a_contacter'=>'nullable|string',
            'contact_personne'=>'nullable|regex:/^(?:\+229)?(0[1-9]\d{8})$/',
            'fonction_personne'=>'nullable|string',
            'client_id'=>'required|exists:clients,id',
        ]);
        
        if (!empty($validatedData['tel_structure']) && preg_match('/^01\d{8}$/', $validatedData['tel_structure'])) {
            $validatedData['tel_structure'] = '+229' . $validatedData['tel_structure'];
        }
        $site->update($validatedData);
        return redirect()->route('site.show',$site->id)->with('message',['success'=>'la modification du site à été enregistré']);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Site $site)
    {
        //
    }

    public function addLocation(Request $request){
        $validatedData=$request->validate([
            'longitude'=>'required|decimal:0,7',
            'latitude'=>'required|decimal:0,7',
            'site_id'=>'required'
        ]);

        $site=Site::find($validatedData['site_id']);
        $site->update($validatedData);
        return redirect()->back()->with('newSite',$site);
    }

    public function FindLocation( Request $request){
        $sites=Site::all();
        $selectedSite='';

        if($request->query('slctdSte')){
            $selectedSite=Site::find($request->query('slctdSte'));
        }

        return Inertia::render('site/FindLocation',[
            'sites'=>$sites,
            'selectedSite'=>$selectedSite

        ]);
    }

    public function mesSites(User $user){
        $sites=site::where('user_id', Auth::id())->get()->map(function ($site) {
            $site->nom_client=$site->client->raison_social;
            return $site;
        });
       
        return Inertia::render('site/mesSites',[
            'sites'=>$sites,
        ]);
    }
}

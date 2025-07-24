<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Http\Requests\StoreSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSiteRequest $request)
    {
        $validatedData=$request->validate([
        	'nom_site'=>'required',
            'description'=>'nullable|string',
            'quartier'=>'required|string',
            'personne_a_contacter'=>'nullable|string',
            'contact_personne'=>'nullable|regex:/^\+?[0-9]+$/',
            'fonction_personne'=>'nullable|string',
            'client_id'=>'required|exists:clients,id'   
        ]);
        $site=Site::create($validatedData);
        return redirect()->back()->with('newSite',$site);

    }

    /**
     * Display the specified resource.
     */
    public function show(Site $site)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Site $site)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSiteRequest $request, Site $site)
    {
        //
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
        return redirect()->back();
    }

    public function FindLocation(){
      
        return Inertia::render('site/FindLocation');
    }
}

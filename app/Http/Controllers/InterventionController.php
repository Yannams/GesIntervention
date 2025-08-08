<?php

namespace App\Http\Controllers;

use App\Events\InterventionCreated;
use App\Models\Intervention;
use App\Http\Requests\StoreInterventionRequest;
use App\Http\Requests\UpdateInterventionRequest;
use App\Models\Client;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
/**
 * @method \Illuminate\Auth\Access\Response authorize(string $ability, mixed $arguments = [])
 */
class InterventionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $interventions=Intervention::all()->map(function ($intervention) {
            $intervention->nom_client=$intervention->site->client->raison_social;
            $intervention->nom_site=$intervention->site->nom_site;
            $intervention->user=$intervention->user->name;
            return $intervention;
        });


        return Inertia::render('intervention/index',[
            'interventions'=>$interventions
        ]);
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
     
        $validatedData = $request->validate([
            'nature' => 'required',
            'tache_effectuee' => 'required',
            'observation' => 'nullable|string',
            'personne_rencontree' => 'nullable|string',
            'telephone' => 'nullable|regex:/^(?:\+229)?(0[1-9]\d{8})$/',
            'date_heure_intervention' => 'required',
            'longitude' => 'required|decimal:0,7',
            'latitude' => 'required|decimal:0,7',
            'site_id' => 'exists:sites,id'
        ]);

        // Normalisation du numéro s'il commence par 01 et a 10 chiffres
        if (!empty($validatedData['telephone']) && preg_match('/^01\d{8}$/', $validatedData['telephone'])) {
            $validatedData['telephone'] = '+229' . $validatedData['telephone'];
        }

        $validatedData['user_id'] = Auth::id();

        $intervention = Intervention::create($validatedData);

        event(new InterventionCreated($intervention));

        return redirect()->route('intervention.create');  
    }

    /**
     * Display the specified resource.
     */
    public function show(Intervention $intervention)
    {
        $message=session('message');
        $intervention=Intervention::find($intervention->id);
        $intervention->nom_site=$intervention->site->nom_site;
        $intervention->nom_client=$intervention->site->client->raison_social;
        $intervention->created_atFormated=date('d/m/Y à H:m',strtotime($intervention->created_at));
        $intervention->formatedDate=date('d/m/Y H:m',strtotime($intervention->date_heure_intervention));
        $intervention->lng_site=$intervention->site->longitude;
        $intervention->lat_site=$intervention->site->longitude;
        return Inertia::render('intervention/show',[
            'intervention'=>$intervention,
            'message'=>$message
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Intervention $intervention)
    {
        Gate::authorize('update',$intervention);
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
        $intervention->nom_site=$intervention->site->nom_site;
        $intervention->nom_client=$intervention->site->client->raison_social;
        $intervention->created_atFormated=date('d/m/Y à H:m',strtotime($intervention->created_at));
        $intervention->formatedDate=date('d/m/Y H:m',strtotime($intervention->date_heure_intervention));
        return Inertia::render('intervention/edit',[
            'clients'=>$clients,
            'newClient'=>$newClient,
            'sites'=>$sites,
            'newSite'=>$newSite,
            'intervention'=>$intervention,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInterventionRequest $request, Intervention $intervention)
    {
        Gate::authorize('update',$intervention);
        $validatedData=$request->validate([
            'nature'=>'required',
            'tache_effectuee'=>'required',
            'observation' => 'nullable|string',
            'personne_rencontree'=>'nullable|string',
            'telephone'=>'nullable|regex:/^(?:\+229)?(0[1-9]\d{8})$/',
            'date_heure_intervention'=>'required',
            'site_id'=>'exists:sites,id'
        ]);

        if (!empty($validatedData['telephone']) && preg_match('/^01\d{8}$/', $validatedData['telephone'])) {
                $validatedData['telephone'] = '+229' . $validatedData['telephone'];
            }
        $intervention->update($validatedData);
        return redirect()->route('intervention.show',$intervention->id)->with('message',['success'=>"la modification de l'intervention a été enregistré"]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Intervention $intervention)
    {
        //
    }

     public function mesInterventions(){
    
        $interventions=Intervention::where('user_id', Auth::id())->get()->map(function ($intervention) {
            $intervention->nom_client=$intervention->site->client->raison_social;
            $intervention->nom_site=$intervention->site->nom_site;
            return $intervention;
        });
        return Inertia::render('intervention/mesInterventions',['interventions'=>$interventions]);
    }

    public function LocateInterventions(Request $request){
         
        $period = match ($request->get('period')) {
            'today' => now()->today(),
            '7 jours' => now()->subDays(7),
            '14 jours' => now()->subDays(14),
            '30 jours' => now()->subDays(30),
            '3 mois' => now()->subMonths(3),
            '1 an' => now()->subYear(),
            default => now()->subDays(7),
        };

    return Intervention::where('created_at', '>=', $period)
        ->get()
        ->map(fn ($intervention) => [
            'id'=>$intervention->id,
            'lat' => $intervention->latitude,
            'lng' => $intervention->longitude,
            'label' => $intervention->site->nom_site ?? 'Intervention',
            'lat_site'=>$intervention->site->latitude,
            'lng_site'=>$intervention->site->longitude,
            'user'=>$intervention->user->name,
            'created_at'=>$intervention->created_at->diffForHumans() 
        ]);
    }

    public function TotalInterventions(Request $request){
         
        $period = match ($request->get('period')) {
            'today' => now()->today(),
            '7 jours' => now()->subDays(7),
            '14 jours' => now()->subDays(14),
            '30 jours' => now()->subDays(30),
            '3 mois' => now()->subMonths(3),
            '1 an' => now()->subYear(),
            default => now()->subDays(7),
        };

        return response()->json([
            'total'=>Intervention::where('created_at', '>=', $period)->count(),
        ]);
    }

     public function Active(Request $request){
         
        $period = match ($request->get('period')) {
            'today' => now()->today(),
            '7 jours' => now()->subDays(7),
            '14 jours' => now()->subDays(14),
            '30 jours' => now()->subDays(30),
            '3 mois' => now()->subMonths(3),
            '1 an' => now()->subYear(),
            default => now()->subDays(7),
        };
        $topUsers = Intervention::where('created_at', '>=', $period)
            ->select('user_id', DB::raw('COUNT(*) as total'))
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take(3)
            ->with('user') // ❌ ne fonctionne pas ici, car ce n’est pas un modèle User
            ->get();

        
        // Il faut récupérer les users à part :
        $userIds = $topUsers->pluck('user_id');
       
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        return $topUsers->map(fn ($item) => [
                'id'=>$users[$item->user_id]?->id,
                'name' => $users[$item->user_id]?->name ?? 'Utilisateur inconnu',
                'total' => $item->total,
            ]);
    }

    public function Latest(Request $request){
         
        return Intervention::latest()
            ->take(3)
            ->get()
            ->map(fn ($intervention) => [
                 'id'=>$intervention->user_id,
                'label' => $intervention->site->nom_site ?? 'Intervention',
                'user' => $intervention->user->name,
                'created_at' => $intervention->created_at->diffForHumans(),
            ]);
            
    }

    public function UsersIntervention(User $user){
        $user_id=$user->id;
        $interventions=Intervention::where('user_id',$user_id)->get()->map(function ($intervention) {
            $intervention->nom_client=$intervention->site->client->raison_social;
            $intervention->nom_site=$intervention->site->nom_site;
            return $intervention;
        });
        return Inertia::render('intervention/usersIntervention',[
            'interventions'=>$interventions
        ]);
    }
}

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { log } from "console";
import { Check, ChevronDownIcon, ChevronsUpDown, Clock, LoaderCircle, Plus, Search } from "lucide-react";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import { toast } from "sonner";

const breadcrumbs :BreadcrumbItem[]=[
    {
        title:'interventions',
        href:route('intervention.index')
    },
     {
        title:'nouveau',
        href:route('intervention.create')
    },
]

export type client ={
    id:number;
    raison_social:string
    tel_structure:string
    user_id:number
}

export type site = {
    id:number;
    nom_site:string
    personne_a_contacter:string
    contact_personne:string
    fonction_personne:string
    quartier:string
    indication:string	
    longitude:number|null
    latitude:number|null
    client_id:number
}

interface interventionProps  {
    clients:client[]
        newClient:client
        sites:site[]
        newSite:site
}

export type clientForm = {
    raison_social:string
    tel_structure:string
}
export type siteForm = {
    nom_site:string
    personne_a_contacter:string
    contact_personne:string
    fonction_personne:string
    quartier:string
    indication:string	
    client_id:number
}

export type siteLocationForm={
    longitude:number
    latitude:number
    site_id:number
}

export type intervention = {
    id:number
	nature:string	
    tache_effectuee:string
    observation:string
	personne_rencontree:string
    telephone:string
    date_heure_intervention:string
    site_id:number
    longitude:number
    latitude:number
}

type interventionForm = {
	nature:string	
    tache_effectuee:string
    observation:string
	personne_rencontree:string
    telephone:string
    longitude:number
    latitude:number
    date_heure_intervention:string
    site_id:number
}

export type selectedPosition = {
  lat: number;
  lon: number;
  site_id: number;
}

export default function createIntervention({clients, newClient, sites, newSite}:interventionProps){
    const [clientSelected, setClientSelected]= useState<client|null>(null)
    const { data :dataClient, setData :setDataClient, post :postClient, processing :processingClient, errors :errorsClient, reset: resetClient } = useForm<Required<clientForm>>({
        raison_social:'',
        tel_structure:''
    })
    const [openSelectClient,setOpenSelectClient]=useState<boolean>(false)
    const [openNewClient,setOpenNewClient]=useState<boolean>(false)
    const submitClient: FormEventHandler = (e) => {
        e.preventDefault();
        postClient(route('client.store'), {
            onSuccess: () => {
                resetClient()
                setOpenNewClient(false)
                toast.success("Le client a été créé")
            }
        });
    };
    useEffect(() => {
        if (newClient) {
            setClientSelected(newClient);
        }
    }, [newClient]);
  
    const [siteSelected, setSiteSelected]= useState<site|null>(null)
    const [sitesClients, setSiteClients]= useState<site[]|null>(null)
    const [openSelectSite,setOpenSelectSite]=useState<boolean>(false)
    const [openNewSite,setOpenNewSite]=useState<boolean>(false)
    const { data :dataSite, setData :setDataSite, post :postSite, processing :processingSite, errors :errorsSite, reset: resetSite } = useForm<Required<siteForm>>({
        nom_site:'',
        indication:'',	
        quartier:'',
        personne_a_contacter:'',
        contact_personne:'',        
        fonction_personne:'',
        client_id: 0,
    })
    const submitSite: FormEventHandler = (e) => { 
        e.preventDefault();
        postSite(route('site.store'), {
            onSuccess: () => {
                resetSite()
                setOpenNewSite(false)
                toast.success('Le sité a été enregistré')
            }
        });
    };

       

    useEffect(() => {
        if (newSite) {
            setSiteSelected(newSite);
            const filteredSites = sites.filter(site => site.client_id === clientSelected?.id);
            setSiteClients(filteredSites)
             if (!newSite.latitude && !newSite.longitude) {
                setOpenSiteMap(true)
                setDataSiteLocation('site_id',newSite.id)
            }
        }
    }, [newSite]);
    useEffect(() => {
        if (clientSelected) {
            setDataSite('client_id',clientSelected?.id);
            const filteredSites = sites.filter(site => site.client_id === clientSelected.id);
            setSiteClients(filteredSites)
            setSiteSelected(null)
        }
    }, [clientSelected]);
    const [openDatePicker, setOpenDatePicker] = useState<boolean>(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const hours = Array.from({ length: 24 }, (_, i) => i );
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const [selectedHour, setSelectedHour] = useState("");
    const [selectedMinute, setSelectedMinute] = useState("");
    const [time, setTime] = useState<string>('')

    const [position, setPosition] = useState<{ lat: number; lng: number }>({lat:6.3703,lng: 2.3912});
    const [error, setError] = useState<string | null>(null);
    const [openSiteMap,setOpenSiteMap]=useState<boolean>(false)
    const [openSearchMap, setOpenSearchMap] = useState<boolean>(false)  
    const markerRef = useRef<L.Marker | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const roundCoord = (value: number)=>parseFloat(value.toFixed(7))
    useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          setPosition({ lat: roundCoord(latitude), lng: roundCoord(longitude) });
          setDataIntervention('longitude', roundCoord(longitude))
          setDataIntervention('latitude',  roundCoord(latitude))
        },
        (err) => {
          toast.error(err.message);
          
        }
      );
    } else {
      toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  }, []);
   const { data :dataSiteLocation, setData :setDataSiteLocation, post :postSiteLocation, processing :processingSiteLocation, errors :errorsSiteLocation, reset: resetSiteLocation } = useForm<Required<siteLocationForm>>({
        latitude:position.lat,
        longitude:position.lng,
        site_id:0
    })
    const submitSiteMap :FormEventHandler= (e)=>{
        e.preventDefault()
        postSiteLocation(route('addLocation'),{
            onSuccess:()=>{
                setOpenSiteMap(false) 
                toast.success('La localisation du site a été en registré')  
            },

            onError:(errors)=>{
            if (errors && typeof errors === 'object') {
                const messages = Object.values(errors).flat(); // ["Erreur 1", "Erreur 2", ...]
                messages.forEach((message) => toast.error(message)); // Affiche chaque erreur séparément
            } else {
                toast.error("Une erreur s'est produite");
            }
            }
        })
    }
const [selectedPosition, setSelectedPosition] = useState< selectedPosition | null>(null);
   useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (searchQuery.length > 2) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=bj&limit=5&addressdetails=1&q=${encodeURIComponent(
          searchQuery
        )}`
      )
        .then((res) => res.json())
        .then((data) => setSuggestions(data));
    } else {
      setSuggestions([]);
    }
  }, 500); // debounce 500ms

  return () => clearTimeout(delayDebounce);
}, [searchQuery]);

  useEffect(() => {
    if (openSearchMap) {
      setTimeout(() => {
        if (mapRef.current && !mapInstance.current) {
          mapInstance.current = L.map(mapRef.current).setView([6.5, 2.6], 6);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(mapInstance.current);
        }
      }, 100);
    } else {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [openSearchMap]);

  const handleSelect = (place: any) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const latLng = L.latLng(lat, lon);

    if (mapInstance.current) {
        mapInstance.current.setView(latLng, 13);
        if (markerRef.current) {
            markerRef.current.setLatLng(latLng);
        } else {
            markerRef.current = L.marker(latLng).addTo(mapInstance.current);
        }
        markerRef.current.bindPopup(place.display_name).openPopup();
    }

  // Enregistrement de la position sélectionnée
  setSelectedPosition({
    lat,
    lon,
    site_id: siteSelected?.id ?? 0,
  });

  setSuggestions([]);
  setSearchQuery(place.display_name);
};

const submitSelectedPosition :FormEventHandler=(e)=>{
    e.preventDefault()
    postSiteLocation(route('addLocation'),{
        onSuccess:()=>{
            setOpenSearchMap(false) 
            toast.success('La localisation du site a été enregistré')  
        },
        onError:()=>{
            toast.success('Une erreur s\'est produite')  

        }
    })
}
    useEffect(()=>{
        if(siteSelected){
            if (!siteSelected.latitude && !siteSelected.longitude) {
                setOpenSiteMap(true)
            }
            setDataIntervention('site_id',siteSelected.id)
        }
    },[siteSelected])
  const { data :dataIntervention, setData :setDataIntervention, post :postIntervention, processing :processingIntervention, errors :errorsIntervention, reset: resetIntervention } = useForm<Required<interventionForm>>({
        nature:'',	
        tache_effectuee:'',
        observation:'',
        personne_rencontree:'',
        telephone:'',
        date_heure_intervention:'',
        longitude:0,
        latitude:0,
        site_id:''

    })
    useEffect(()=>{
        if (date) {
            const hour = selectedHour.toString().padStart(2, '0');
            const minute = selectedMinute.toString().padStart(2, '0');
            const formattedDate = date.toISOString().split("T")[0];
            const dateTimeString = `${formattedDate}T${hour}:${minute}`;
            setDataIntervention('date_heure_intervention',dateTimeString)  
        }
    },[selectedHour,selectedMinute,date])
   const submitIntervention: FormEventHandler = async (e) => {
    e.preventDefault();

    if (!("geolocation" in navigator)) {
        toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Vous pouvez ici inclure les coordonnées dans les données postées
            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            
            setDataIntervention('latitude',roundCoord(coords.latitude))
            setDataIntervention('longitude', roundCoord(coords.longitude))
        

            postIntervention(route('intervention.store'), {
                onSuccess: () => {
                    resetIntervention();
                    setClientSelected(null);
                    setSiteSelected(null);
                    setDate(undefined);
                    setSelectedHour('');
                    setSelectedMinute('');
                    toast.success("L'intervention a été enregistrée");
                },
            });
        },
        (error) => {
            toast.error("Erreur lors de la récupération de la position. Veuillez autoriser la localisation.");
            console.error(error);
        }
    );
};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Dialog open={openNewClient} onOpenChange={setOpenNewClient}>
                <DialogContent>
                    <DialogHeader className="text-left">
                        <DialogTitle>Ajouter un nouveau client</DialogTitle>
                        <DialogDescription>ajouter un nouveau client à la liste des clients</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitClient}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="raison_social">Raison social</Label>
                                <Input 
                                    id="raison_social"
                                    type="text"
                                    value={dataClient.raison_social}
                                    onChange={(e)=>setDataClient('raison_social',e.target.value)}
                                />
                                <InputError message={errorsClient.raison_social}/>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tel_structure">Telephone</Label>
                                <Input 
                                    id="tel_structure"
                                    type="text"
                                    value={dataClient.tel_structure}
                                    onChange={(e)=>setDataClient('tel_structure',e.target.value)}
                                />
                                <InputError message={errorsClient.tel_structure}/>
                            </div>
                            <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processingClient}>
                                {processingClient && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
           <Dialog open={openNewSite} onOpenChange={setOpenNewSite}>                
                <DialogContent>
                    <DialogHeader className="text-left">
                        <DialogTitle>Ajouter un site</DialogTitle>
                        <DialogDescription>ajouter un nouveau site à {clientSelected?.raison_social}</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={submitSite}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nom_site">Nom site</Label>
                                <Input 
                                    id="nom_site"
                                    type="text"
                                    value={dataSite.nom_site}
                                    onChange={(e)=>setDataSite('nom_site',e.target.value)}
                                />
                                <InputError message={errorsSite.nom_site}/>
                            </div>
                            

                            <div className="grid gap-2">
                                <Label htmlFor="personne_a_contacter">Personne à contacter</Label>
                                <Input
                                    id="personne_a_contacter"
                                    type="text"
                                    value={dataSite.personne_a_contacter}
                                    onChange={(e)=>setDataSite('personne_a_contacter',e.target.value)}
                                />
                                <InputError message={errorsSite.personne_a_contacter}/>
                            </div>
                                <div className="grid gap-2">
                                <Label htmlFor="fonction_personne">Fonction de la personne</Label>
                                <Input
                                    id="fonction_personne"
                                    type="text"
                                    value={dataSite.fonction_personne}
                                    onChange={(e)=>setDataSite('fonction_personne',e.target.value)}
                                />
                                <InputError message={errorsSite.fonction_personne}/>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_personne">Telephone de la personne</Label>
                                <Input 
                                    id="contact_personne"
                                    type="text"
                                    value={dataSite.contact_personne}
                                    onChange={(e)=>setDataSite('contact_personne',e.target.value)}
                                />
                                <InputError message={errorsSite.contact_personne}/>
                            </div>
                                <div className="grid gap-2">
                                <Label htmlFor="quartier">Quartier</Label>
                                <Input
                                    id="quartier"
                                    type="text"
                                    value={dataSite.quartier}
                                    onChange={(e)=>setDataSite('quartier',e.target.value)}
                                />
                                <InputError message={errorsSite.quartier}/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="indication">Indication</Label>
                                <Textarea
                                    id="indication"
                                    value={dataSite.indication}
                                    onChange={(e)=>setDataSite('indication',e.target.value)}
                                />
                                <InputError message={errorsSite.indication}/>
                            </div>
                            <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processingSite}>
                                {processingSite && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={openSiteMap} onOpenChange={setOpenSiteMap}>
                <DialogContent>
                    <div>Vous vous trouvez ici actuellement. Est-ce la localisation de <span className="font-bold">{newSite.nom_site}</span> ?</div>
                    <div className="rounded">
                         <MapContainer center={[position?.lat,position?.lng]} zoom={13} scrollWheelZoom={true} className="h-[400px] w-full rounded-xl shadow">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[position?.lat,position?.lng]}>
                                <Popup>
                                    Position actuelle : {position?.lat}, {position?.lng}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    <DialogFooter >
                        <div className="flex justify-between w-full">
                            <DialogClose>
                                <Button variant={'secondary'}>Annuler</Button>
                            </DialogClose>
                            <div className="flex gap-2">
                                    <Button 
                                        variant={'secondary'} 
                                        onClick={()=>{
                                        setOpenSiteMap(false)
                                        setOpenSearchMap(true)
                                
                                    }}>
                                        Non, Rechercher
                                    </Button>
                                <form onSubmit={submitSiteMap}>
                                    <Input type="hidden" value={dataSiteLocation.latitude}/>
                                    <Input type="hidden" value={dataSiteLocation.longitude}/>
                                     <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processingSiteLocation}>
                                        {processingSiteLocation && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Oui
                                    </Button>
                                </form>
                            </div>
                        </div>
                      
                    </DialogFooter>
                   
                </DialogContent>
            </Dialog>
            {openSearchMap &&
             <Dialog open={openSearchMap} onOpenChange={setOpenSearchMap} >
                
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechercher la localisation du site</DialogTitle>
                    </DialogHeader>
                   
                    <Command>
                        <CommandInput placeholder="rechercher un lieu" value={searchQuery} onValueChange={setSearchQuery}/>
                        {suggestions.length > 0 && (
                            <CommandList>
                                {suggestions.map((sugg, index) => (
                                    <CommandItem
                                        key={index}
                                        value={sugg.display_name}
                                        onSelect={() => handleSelect(sugg)}
                                    >
                                        {sugg.display_name}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        )}
                    </Command>
                
                    <div ref={mapRef} style={{ height: '400px', width: '100%' }} className="rounded"></div>
                        
                    <DialogFooter>
                        <div className="flex justify-between w-full">
                            <DialogClose>
                                <Button variant={'secondary'}>Annuler</Button>
                            </DialogClose>
                            <div className="flex gap-2">
                                <Button 
                                    variant={'secondary'}
                                     onClick={()=>{
                                        setOpenSearchMap(false)
                                        setOpenSiteMap(true)
                                    }}
                                >
                                    Ma position 
                                </Button>
                                <form onSubmit={submitSelectedPosition}>
                                    <Input type="hidden" value={selectedPosition?.lat} />
                                    <Input type="hidden" value={selectedPosition?.lon}/>
                                    <Input type="hidden" value={selectedPosition?.site_id}/>
                                    <Button>Enregistrer</Button>
                                </form>
                            </div>
                        </div>
                            
                    </DialogFooter>
                </DialogContent>
                
            </Dialog>} 
            <form onSubmit={submitIntervention}>
            
              <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                        <div className="w-full max-w-sm">
                            <div className="flex flex-col gap-8">
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label>Client</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <Popover open={openSelectClient} onOpenChange={setOpenSelectClient}>   
                                                <PopoverTrigger className="col-span-3">
                                                    <div className="border p-2 flex justify-between rounded-md items-center">
                                                        {clientSelected?.raison_social ?? 'Sélectionner un client'}
                                                        <ChevronsUpDown className="text-muted-foreground"/>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <Command>
                                                        <CommandInput placeholder="Rechercher un client"/>
                                                        <CommandList>
                                                            <CommandEmpty>Aucun clients </CommandEmpty>
                                                            <CommandGroup heading='clients'>
                                                                <CommandItem>{openSelectClient}</CommandItem>
                                                                {clients.map((client)=>(
                                                                    <CommandItem
                                                                        key={client.id}
                                                                        value={client.id.toString()}
                                                                        onSelect={(selectedValue)=> {
                                                                            setClientSelected(selectedValue === clientSelected?.id.toString() ? null : client)
                                                                            setOpenSelectClient(false)
                                                                        }}
                                                                        className="flex justify-between"
                                                                    >
                                                                        {client.raison_social}
                                                                        
                                                                        {clientSelected?.id===client.id && <Check/>}
                                                                    </CommandItem>
                                                                ))} 
                                                            </CommandGroup>
                                                        </CommandList>

                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <Button type="button" className="h-full" onClick={()=>setOpenNewClient(true)}><Plus/> Ajouter</Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Site</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <Popover open={openSelectSite} onOpenChange={setOpenSelectSite}>   
                                                <PopoverTrigger className="col-span-3" disabled={!clientSelected}>
                                                    <div className="border p-2 flex justify-between rounded-md items-center">
                                                        {siteSelected?.nom_site??'Sélectionner un site'}
                                                        <ChevronsUpDown className="text-muted-foreground"/>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <Command>
                                                        <CommandInput placeholder="Rechercher un site"/>
                                                        <CommandList>
                                                            <CommandEmpty>Aucun résultats</CommandEmpty>
                                                            <CommandGroup heading='sites'>
                                                                {sitesClients?.map((site)=>(
                                                                    <CommandItem
                                                                        key={site.id}
                                                                        value={site.id.toString()}
                                                                        onSelect={(selectedValue)=> {
                                                                            setSiteSelected(selectedValue === siteSelected?.id.toString() ? null : site)
                                                                            setOpenSelectSite(false)
                                                                        }}
                                                                        className="flex justify-between"
                                                                    >
                                                                        {site.nom_site}
                                                                        
                                                                        {siteSelected?.id===site.id && <Check/>}
                                                                    </CommandItem>
                                                                ))} 
                                                            </CommandGroup>
                                                        </CommandList>

                                                    </Command>
                                                </PopoverContent>
                                            </Popover> 
                                            <Button 
                                                type="button" className="h-full"
                                                onClick={()=>
                                                    {
                                                        setOpenNewSite(true)
                                                        setDataSiteLocation('latitude',position.lat)
                                                        setDataSiteLocation('longitude',position.lng)
                                                    }
                                                } 
                                                disabled={!clientSelected}
                                            >
                                                <Plus/> Ajouter
                                            </Button>
                                            
                                             {!clientSelected && <div className="col-span-4  text-red-600 dark:text-red-400">Veuillez d'abord sélectionner un client</div>}
                                        </div>
                                        <InputError message={errorsIntervention.site_id}/>
                                    </div>
                                      <div className="grid grid-cols-5 gap-2">
                                        <div className="grid gap-2 col-span-3">
                                            <Label htmlFor="date-picker">Date intervention</Label>
                                            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                                                <PopoverTrigger asChild className="">
                                                    <Button
                                                        variant="outline"
                                                        id="date-picker"
                                                        className="w-32 justify-between font-normal w-full"
                                                    >
                                                        {date ? date.toLocaleDateString() : "Select date"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        captionLayout="dropdown"
                                                        onSelect={(date) => {
                                                            setDate(date)
                                                            setOpenDatePicker(false)
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            
                                        </div>
                                        <div className="grid gap-2 col-span-2">
                                            <Label htmlFor="time-picker">
                                                Time
                                            </Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Input
                                                    type="time"
                                                    id="time-picker"
                                                    value={`${selectedHour.padStart(2, "0")}:${selectedMinute.padStart(2, "0")}`}
                                                    onChange={(e) => {
                                                        const [hour, minute] = (e.target as HTMLInputElement).value.split(":");
                                                        setSelectedHour(hour);
                                                        setSelectedMinute(minute);
                                                    }} 
                                                    className="bg-background col-span-2 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none time-picker"
                                                />
                                                <Popover>
                                                    <PopoverTrigger className="text-muted-foreground"><Clock/></PopoverTrigger>
                                                    <PopoverContent className="grid grid-cols-2 w-50">
                                                        <Command>
                                                            <CommandGroup heading="heures">
                                                                <CommandList className="no-scrollbar">
                                                                    {hours.map((hour) => (
                                                                        <CommandItem 
                                                                            key={`h_${hour}`} 
                                                                            id={`h_${hour}`}
                                                                            onSelect={() => setSelectedHour(hour.toString())}
                                                                        >
                                                                            {hour.toString().padStart(2, '0')}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandList>
                                                            </CommandGroup>
                                                        </Command>
                                                        <Command>
                                                            <CommandGroup heading="minutes">
                                                                <CommandList className="no-scrollbar">
                                                                    {minutes.map((minute) => (
                                                                        <CommandItem 
                                                                            key={`m_${minute}`} 
                                                                            id={`m_${minute}`}
                                                                            onSelect={() => setSelectedMinute(minute.toString())}
                                                                        >
                                                                            {minute.toString().padStart(2, '0')}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandList>
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        <InputError message={errorsIntervention.date_heure_intervention}/>
                                    </div>
                                     
                                    <div className="grid gap-2">
                                        <Label>Tache effectuée</Label>
                                        <Textarea value={dataIntervention.tache_effectuee} onChange={(e)=>setDataIntervention('tache_effectuee',e.target.value)}/>
                                        <InputError message={errorsIntervention.tache_effectuee}/>
                                    </div>
                                     <div className="grid gap-2">
                                        <Label>Nature</Label>
                                        <Input value={dataIntervention.nature} onChange={(e)=>setDataIntervention('nature',e.target.value)}/>
                                        <InputError message={errorsIntervention.nature}/>

                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Observation</Label>
                                        <Textarea value={dataIntervention.observation} onChange={(e)=>setDataIntervention('observation',e.target.value)}/>
                                        <InputError message={errorsIntervention.observation}/>
                                        
                                    </div>
                                     <div className="grid gap-2">
                                        <Label>Personne rencontrée</Label>
                                        <Input value={dataIntervention.personne_rencontree} onChange={(e)=>setDataIntervention('personne_rencontree',e.target.value)}/>
                                        <InputError message={errorsIntervention.personne_rencontree}/>
                                    </div>
                                     <div className="grid gap-2">
                                        <Label>Telephone</Label>
                                        <Input value={dataIntervention.telephone} onChange={(e)=>setDataIntervention('telephone',e.target.value)}/>
                                        <InputError message={errorsIntervention.telephone}/>
                                    </div>
                                </div>
                                <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processingIntervention}>
                                    {processingIntervention && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Ajouter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    )
}
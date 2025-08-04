import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Link, useForm, usePage } from "@inertiajs/react";
import { clientForm, selectedPosition, site, siteForm, siteLocationForm } from "../intervention/create";
import { Building, Check, ChevronsUpDown, LoaderCircle, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { client } from "../client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
   
interface CreateSiteProps {
    clients:client[] 
    newClient:client
    sites:site[]
    newSite:site
}
export default function CreateSite({clients, newClient, sites, newSite}:CreateSiteProps){
  
    const breadcrumbs:BreadcrumbItem[] =[
        {
            title:'sites',
            href:route('mesSites')
        },
        {
            title:'nouveau',
            href:route('site.create')
        }
    ]
     const [openSelectClient,setOpenSelectClient]=useState<boolean>(false)
     const { data :dataSite, setData :setDataSite, post :postSite, processing :processingSite, errors :errorsSite, reset: resetSite } = useForm<Required<siteForm>>({
            nom_site:'',
            indication:'',	
            quartier:'',
            personne_a_contacter:'',
            contact_personne:'',        
            fonction_personne:'',
            client_id: 0,
    })
    const [openNewClient,setOpenNewClient]=useState<boolean>(false)
    const [clientSelected, setClientSelected]= useState<client|null>(null)
    const [position, setPosition] = useState<{ lat: number; lng: number }>({lat:6.3703,lng: 2.3912});
    const [error, setError] = useState<string | null>(null);
    const [openSiteMap,setOpenSiteMap]=useState<boolean>(false)
    const [openSearchMap, setOpenSearchMap] = useState<boolean>(false)  
    const markerRef = useRef<L.Marker | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedPosition, setSelectedPosition] = useState< selectedPosition | null>(null);
    const { data :dataClient, setData :setDataClient, post :postClient, processing :processingClient, errors :errorsClient, reset: resetClient } = useForm<Required<clientForm>>({
        raison_social:'',
        tel_structure:''
    })
     useEffect(() => {
        if (newSite) {
            setOpenSiteMap(true)
            setDataSiteLocation('site_id',newSite.id)
        }
    }, [newSite]);
     useEffect(() => {
            if (newClient) {
                setClientSelected(newClient);
            }
        }, [newClient]);
      useEffect(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setPosition({ lat: latitude, lng: longitude });
            },
            (err) => {
              setError(err.message);
              toast.error(err.message)
            }
          );
        } else {
          setError("La géolocalisation n'est pas supportée par ce navigateur.");
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
    
                onError:()=>{
                    toast.error('Une erreur s\'est produite')
                }
            })
        }
     useEffect(() => {
        if (clientSelected) {
            setDataSite('client_id',clientSelected?.id);
        }
    }, [clientSelected]);
    
     const submitSite: FormEventHandler = (e) => { 
            e.preventDefault();
            postSite(route('site.store'), {
                onSuccess: () => {
                    resetSite()
                    toast.success('Le site a été enregistré')
                    
                }
            });
        };

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
            site_id: newSite?.id ?? 0,
          });
          if(selectedPosition?.lat && selectedPosition?.lon){
            setDataSiteLocation('latitude',selectedPosition?.lat)

          }
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
    return(
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
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                    <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                        <Building className="size-9  " />
                                    </div>
                                    <span className="sr-only">Créer un site</span>
                                </Link>
                                <div className="space-y-2 text-center">
                                    <h1 className="text-xl font-medium">Créer un site</h1>
                                    <p className="text-center text-sm text-muted-foreground">Entrer les informations liées au site</p>
                                </div>
                            </div>
                            <form onSubmit={submitSite}>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nom_site">Nom site</Label>
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
                                      
                                        
                                        {!clientSelected && <div className=" text-red-600 dark:text-red-400">Veuillez d'abord sélectionner un client</div>}
                                        
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="nom_site">Nom site</Label>
                                        <Input 
                                            id="nom_site"
                                            type="text"
                                            value={dataSite.nom_site}
                                            onChange={(e)=>setDataSite('nom_site',e.target.value)}
                                            disabled={!clientSelected}
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
                                            disabled={!clientSelected}
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
                                            disabled={!clientSelected}
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
                                            disabled={!clientSelected}
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
                                            disabled={!clientSelected}
                                        />
                                        <InputError message={errorsSite.quartier}/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="indication">Indication</Label>
                                        <Textarea
                                            id="indication"
                                            value={dataSite.indication}
                                            onChange={(e)=>setDataSite('indication',e.target.value)}
                                            disabled={!clientSelected}
                                        />
                                        <InputError message={errorsSite.indication}/>
                                    </div>
                                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processingSite || !clientSelected}>
                                        {processingSite && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Ajouter
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
                

                        
            
        </AppLayout>    
    )
}
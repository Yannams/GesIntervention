import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { selectedPosition, site, siteLocationForm } from "../intervention/create";
import { Button } from "@/components/ui/button";
import { Edit, EllipsisVertical, Eye, LoaderCircle, MapPinned, MapPinPlus,  } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

const markerIcon = new L.Icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = markerIcon;

type siteProp= site & {nom_client : string}

interface mesSitesProps{
    sites: siteProp[]
}

export default function mesSites({sites}:mesSitesProps){
   
            
    const breadcrumbs : BreadcrumbItem[]=[
        {
            title:'Mes sites',
            href:route('mesSites')
        }
    ]
        const [selectedSite,setSelectedSite]=useState<site|null>(null)
        const [position, setPosition] = useState<{ lat: number; lng: number }>({lat:6.3703,lng: 2.3912});
        const [error, setError] = useState<string | null>(null);
        const [openSiteMap,setOpenSiteMap]=useState<boolean>(false)
        const [openSearchMap, setOpenSearchMap] = useState<boolean>(false)  
        const markerRef = useRef<L.Marker | null>(null);
        const mapRef = useRef<HTMLDivElement>(null);
        const mapInstance = useRef<L.Map | null>(null);
        const [searchQuery, setSearchQuery] = useState("");
        const [suggestions, setSuggestions] = useState<any[]>([]);

        useEffect(()=>{
            if(selectedSite){
                setOpenSiteMap(true)
                setDataSiteLocation('site_id',selectedSite.id)
            }
        },[selectedSite])
        useEffect(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setPosition({ lat: latitude, lng: longitude });
              
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
    
                onError:()=>{
                    toast.error('Une erreur s\'est produite')
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
    
        const [siteSelected, setSiteSelected]= useState<site|null>(null)
      
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

    return(

        <AppLayout breadcrumbs={breadcrumbs}>
            <Dialog open={openSiteMap} onOpenChange={setOpenSiteMap}>
                <DialogContent>
                    <div>Vous vous trouvez ici actuellement. Est-ce la localisation de <span className="font-bold">{selectedSite?.nom_site}</span> ?</div>
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nom site</TableHead>
                        <TableHead>Indication</TableHead>
                        <TableHead>Personne à contacter</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions </TableHead>
                    </TableRow>
                </TableHeader>
                    <TableBody>
                        {sites.map((site, index)=>(
                            <TableRow key={site.id}>
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{site.nom_site}</TableCell>
                                <TableCell>{site.nom_client}</TableCell>
                                <TableCell>{site.personne_a_contacter}</TableCell>
                                <TableCell>{site.contact_personne}</TableCell>
                                <TableCell>
                                    <Button
                                        className="mr-2"
                                        onClick={()=>setSelectedSite(site)}
                                    >
                                    {(site.longitude && site.latitude) ?
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-pen-icon lucide-map-pin-pen"><path d="M17.97 9.304A8 8 0 0 0 2 10c0 4.69 4.887 9.562 7.022 11.468"/><path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><circle cx="10" cy="10" r="3"/></svg>
                                            Modifier la localisation
                                        </>
                                        :
                                        <>
                                            <MapPinPlus/>
                                           Ajouter la localisation
                                        </>
                                    }
                                       
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant={'outline'}><EllipsisVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuGroup>
                                                {(site.longitude && site.latitude) &&
                                                    <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href= {route('findLocation',{slctdSte :site.id}) }><MapPinned/>Aller au site</Link></DropdownMenuItem>
                                                }
                                                <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href={route('site.edit',site.id)}><Edit/>Modifier</Link></DropdownMenuItem>
                                                <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href={route('site.show',site.id)}><Eye/>voir</Link></DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
    
            </Table>
        </AppLayout>
    )
}
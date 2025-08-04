import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue ,SelectItem} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import axios from 'axios'
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Circle, Dot, Info, List, Map, TrendingUp, Trophy } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function createInitialsIcon(name: string): L.DivIcon {
  const initials = getInitials(name);

  return L.divIcon({
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #4b5563;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 0 6px rgba(0,0,0,0.3);
      ">
        ${initials}
      </div>
    `,
    iconSize: [36, 36],
    className: '', // désactive le style Leaflet par défaut
  });
}

export default function Dashboard() {
    const [selectedPeriode, setSelectedPeriode]=useState<string>('today');
    const [locations, setLocations] = useState<{id:number,lat: number, lng: number, label: string, user:string, created_at:string,lat_site:number,lng_site:number}[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedPeriodeForTotal, setSelectedPeriodeForTotal]=useState<string>('today');
    const [totalIntervention,setTotalIntervention]=useState<{total:number}>()

    const [selectedPeriodeForActif, setSelectedPeriodeForActif]=useState<string>('today')
    const [Active,setActive]=useState<{id:number, name: string, total:number}[]>([])
    
    const [Latest,setLatest]=useState<{id:number, label: string, user:string, created_at:string}[]>([])
            const fetchLocations = async () => {
                setLoading(true);
                try {
                    const res = await axios.get('/interventions/localisations', {
                        params: { period: selectedPeriode }
                    });
                    setLocations(res.data); // format : [{lat, lng, label}, ...]
                } catch (error) {
                    toast.error('Erreur lors du chargement des localisations ');
                } finally {
                    setLoading(false);
                }
            };
    
            const fetchActive = async () => {
                setLoading(true);
                try {
                    const res = await axios.get('/interventions/active', {
                        params: { period: selectedPeriodeForActif }
                    });
                    setActive(res.data); // format : [{lat, lng, label}, ...]
                } catch (error) {
                    toast.error('Erreur lors du chargement des plus actifs ');
                } finally {
                    setLoading(false);
                }
            };

            const latest = async ()=>{  
                try {
                    const res = await axios.get('/interventions/latest');
                    setLatest(res.data); // format : [{lat, lng, label}, ...]
                } catch (error) {
                    toast.error('Erreur lors du chargement des dernières interventions ');
                } finally {
                    setLoading(false);
                }
            }

             const fetchTotal = async () => {
                setLoading(true);
                try {
                    const res = await axios.get('/interventions/Total', {
                        params: { period: selectedPeriodeForTotal }
                    });
                    setTotalIntervention(res.data); // format : [{lat, lng, label}, ...]
                } catch (error) {
                    toast.error('Erreur lors du chargement du total ');
                } finally {
                    setLoading(false);
                }
            };
    
        useEffect(()=>{
            if (selectedPeriode) {
                fetchLocations();
            }
        },[selectedPeriode])
        
        

        useEffect(()=>{
            if (selectedPeriodeForActif) {
                fetchActive();
            }
        },[selectedPeriodeForActif])

    
    useEffect(() => {
        latest(); 
        fetchTotal();
        fetchActive();
        fetchLocations();
            const interval = setInterval(() => {
                latest();
                fetchTotal();
                fetchLocations();
            }, 10000); // toutes les 10 secondes

            return () => clearInterval(interval); // nettoyage à la destruction
        }, []);
    function distanceEnMetres(
        lat1: number, lon1: number,
        lat2: number, lon2: number
    ): number {
        const R = 6371000; // Rayon de la Terre en mètres
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    
    }

    function sontCoordonneesProchesMetres(
        lat1: number, lon1: number,
        lat2: number, lon2: number,
        toleranceMetres: number = 20
    ): boolean {
        const distance = distanceEnMetres(lat1, lon1, lat2, lon2);
        return distance <= toleranceMetres;
    }
     const [view, setView] = useState("map")
    useEffect(() => {
        latest(); // s'exécute au chargement du composant
    }, []);
    // latest()
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className='border-b bg-sidebar p-2 flex justify-between items-center'>
                           <span className='font-bold'>Total interventions </span> 
                           <span>
                                <Select value={selectedPeriodeForTotal} onValueChange={setSelectedPeriodeForTotal}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="période"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value='today'>Aujourd'hui</SelectItem>
                                            <SelectItem value='7 jours'>7 jours</SelectItem>
                                            <SelectItem value='14 jours'>14 jours</SelectItem>
                                            <SelectItem value='30 jours'>30 jours</SelectItem>
                                            <SelectItem value='3 mois'>3 mois</SelectItem>
                                            <SelectItem value='1 an'>1 an</SelectItem>  
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </span> 
                        </div>
                        <div className='mt-10 flex justify-center items-center text-5xl'>{totalIntervention?.total} <TrendingUp/> </div>
                    </div>
                    <div className="relative aspect-video overflow-y-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                         <div className='border-b bg-sidebar p-2 flex justify-between items-center'>
                           <span className='font-bold'>Les plus actifs </span> 
                           <span>
                                <Select value={selectedPeriodeForActif} onValueChange={setSelectedPeriodeForActif}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="période"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value='today'>Aujourd'hui</SelectItem>
                                            <SelectItem value='7 jours'>7 jours</SelectItem>
                                            <SelectItem value='14 jours'>14 jours</SelectItem>
                                            <SelectItem value='30 jours'>30 jours</SelectItem>
                                            <SelectItem value='3 mois'>3 mois</SelectItem>
                                            <SelectItem value='1 an'>1 an</SelectItem>  
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </span> 
                        </div>
                       {Active.length > 0 ? (
                            Active.map((active, index) => (
                                <div
                                    key={index}
                                    className="border-b px-3 py-2 hover:bg-sidebar flex justify-between"
                                    onClick={()=>{
                                        window.location.href=route('UsersIntervention',active.id)
                                    }}
                                >
                                    
                                    <span>{active.name}</span>
                                    <span className='flex'>
                                        <span className='font-bold mr-2'>{active.total}</span>
                                        {index==0 && <Trophy/>}
                                    </span>
                                  
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-gray-500">Aucune activité trouvée</div>
                        )}
                    </div>
                     <div className="relative aspect-video overflow-y-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                         <div className='border-b bg-sidebar p-3 flex justify-between items-center'>
                           <span className='font-bold'>Dernières interventions </span> 
                        </div>
                        <div>
                             {Latest.length > 0 ? (
                            Latest.map((last, index) => (
                                <div
                                    key={index}
                                    className="border-b px-3 py-2 hover:bg-sidebar grid "
                                    onClick={()=>{
                                        window.location.href=route('intervention.show',last.id)
                                    }}
                                >
                                <div className='flex justify-between items-center'>
                                    <span>{last.label}</span>
                                    <span className='text-sm text-muted-foreground'>{last.user}</span>
                                </div>
                                <div className='text-sm text-muted-foreground'>{last.created_at}</div>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-gray-500">Aucune activité trouvée</div>
                        )}
                        </div>
                         
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className={`${view=='map' ? ' absolute top-4 right-4' :'justify-end p-4'} z-10 flex gap-2`}>
                        <div className="bg-white dark:bg-gray-800 rounded-md shadow">
                            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une période" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value='today'>Aujourd'hui</SelectItem>
                                        <SelectItem value='7 jours'>7 jours</SelectItem>
                                        <SelectItem value='14 jours'>14 jours</SelectItem>
                                        <SelectItem value='30 jours'>30 jours</SelectItem>
                                        <SelectItem value='3 mois'>3 mois</SelectItem>
                                        <SelectItem value='1 an'>1 an</SelectItem>  
                                    </SelectGroup>
                                </SelectContent>    
                            </Select>
                        </div>      
                        <ToggleGroup type="single" defaultValue="map" className="rounded-md shadow" value={view} onValueChange={(value) => value && setView(value)}>
                            <ToggleGroupItem
                                value="map"
                                aria-label="Vue carte"
                                className="border data-[state=on]:bg-primary data-[state=off]:bg-white data-[state=off]:dark:bg-gray-800  data-[state=on]:text-white data-[state=on]:border-black transition-colors "
                            >
                                <Map />
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="liste"
                                aria-label="Vue liste"
                                className="border data-[state=on]:bg-primary data-[state=off]:bg-white data-[state=off]:dark:bg-gray-800  data-[state=on]:text-white data-[state=on]:border-black transition-colors "
                            >
                                <List />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    {view=='map' &&
                        <MapContainer  center={locations.length ? [locations[0].lat, locations[0].lng] : [6.3703, 2.3912]}  zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-xl z-[1] shadow">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        {locations.map((loc, index) => (
                                <Marker key={index} position={[loc.lat, loc.lng]} icon={createInitialsIcon(loc.user)}>
                                    <Popup>
                                        <div className='flex flex-col'>
                                            <span>{loc.user} à {loc.label}</span>
                                            <span>{loc.created_at}  </span>
                                            <span>
                                                {sontCoordonneesProchesMetres(loc.lat,loc.lng,loc.lat_site,loc.lng_site,30) ? 
                                                <span className='text-green-600 text-dark-100 flex gap-2'>
                                                        <Info className='h-4 w-4'/>
                                                        L'intervention a été réalisée près du site.
                                                    </span>
                                                :
                                                    <span className='text-red-400 flex gap-2'>
                                                        <Info className='h-4 w-4'/>
                                                        Les positions sont trop éloignées.
                                                    </span>
                                                }
                                            </span>
                                        </div>               
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    }
                    {view=='liste' &&
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Nom site</TableHead>
                                    <TableHead>Nom technicien</TableHead>
                                    <TableHead>correspondance lieu</TableHead>
                                    <TableHead>créé le</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((loc, index)=>(
                                    <TableRow 
                                        onClick={
                                            ()=>{
                                                window.location.href=route('intervention.show',loc.id)
                                            }
                                        }
                                    >
                                        <TableCell>{index+1}</TableCell>
                                        <TableCell>{loc.label}</TableCell>
                                        <TableCell>{loc.user}</TableCell>
                                        <TableCell>
                                             {sontCoordonneesProchesMetres(loc.lat,loc.lng,loc.lat_site,loc.lng_site,30) ? 
                                                <span className='text-green-600 text-dark-100 flex gap-2'>
                                                        <Info className='h-4 w-4'/>
                                                        L'intervention a été réalisée près du site.
                                                    </span>
                                                :
                                                    <span className='text-red-400 flex gap-2'>
                                                        <Info className='h-4 w-4'/>
                                                        Les positions sont trop éloignées.
                                                    </span>
                                                }
                                        </TableCell>
                                        <TableCell>{loc.created_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
            </div>
        </AppLayout>
    );
}

import AppLayout from "@/layouts/app-layout";
import { InterventionGot } from "./mesInterventions";
import { BreadcrumbItem, message, SharedData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { Info } from "lucide-react";
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

interface showInterventionProps{
    intervention : InterventionGot & {
        formatedDate:string 
        created_atFormated:string  
        lat_site:number
        lng_site:number
    }
    message:message 

}


export default function showIntervention({intervention,message}:showInterventionProps){
    const { auth } = usePage<SharedData>().props;
    const breadcrumbs:BreadcrumbItem[]=[
    {
        title:'interventions',
        href:route('mesInterventions')
    },
    {
        title:`${intervention.nom_site}  ${intervention.formatedDate}`,
        href:route('intervention.show',intervention.id)
    }
]   
const userRoles = auth.user?.roles.map(role => role.name) || []
 useEffect(()=>{
        if(message){
            if (message.success) {
                toast.success(message.success)
            }
            if(message.error){
                toast.error(message.error)
            }
            if(message.warning){
                toast.warning(message.warning)
            } 
            if(message.info){
                toast.info(message.info)
            }
        }
    },[message])
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

    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Card className="bg-sidebar">
                    <CardHeader>
                        <CardTitle className="leading-tight">
                           Intervention à {intervention.nom_site} du {intervention.formatedDate}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                             <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Nom client:</span>
                                <span>{intervention.nom_client}</span>
                            </div> <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Nom site :</span>
                                <span>{intervention.nom_site }</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Nature :</span>
                                <span>{intervention.nature}</span>
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Tâche éffectuée :</span>
                                <span>{intervention.tache_effectuee}</span>
                            </div> <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Observation :</span>
                                <span>{intervention.observation}</span>
                            </div> <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Personne rencontrée :</span>
                                <span>{intervention.personne_rencontree}</span>
                            </div> <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Téléphone :</span>
                                <span>{intervention.telephone}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold">Date heure intervention :</span>
                                <span>{intervention.formatedDate}</span>
                            </div>
                            {userRoles.includes('Admin') &&
                                 <div className="grid grid-cols-2 gap-2">
                                    <span className="font-bold">créé le :</span>
                                    <span>{intervention.created_atFormated}</span>
                                </div>
                            }

                            {userRoles.includes('Admin') &&
                                <div className="grid grid-cols-2 gap-2">
                                    <span  className="font-bold">Info:</span>
                                    <span>
                                        {sontCoordonneesProchesMetres(intervention.latitude,intervention.longitude,intervention.lat_site,intervention.lng_site,30) ? 
                                            <span className='text-green-600 text-dark-100 flex gap-2 items-center'>
                                                <Info className='h-4 w-4'/>
                                                L'intervention a été réalisée près du site.
                                            </span>
                                            :
                                            <span className='text-red-400 flex gap-2  items-center'>
                                                <Info className='h-4 w-4'/>
                                                Les positions sont trop éloignées.
                                            </span>
                                        }
                                    </span>
                                </div>
                            }
                        </div>                
                    </CardContent>
                </Card>
                 <div className="rounded">
                    Effectuée ici:
                    <MapContainer center={[intervention?.latitude,intervention?.longitude]} zoom={13} scrollWheelZoom={true} className="h-[400px] z-[1] w-full rounded-xl shadow">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[intervention?.latitude,intervention?.longitude]}>
                            <Popup>
                                Position actuelle : {intervention.latitude}, {intervention.longitude}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>
                
        </AppLayout>
    )
}
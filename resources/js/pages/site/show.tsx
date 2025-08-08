import AppLayout from "@/layouts/app-layout";
import { site } from "../intervention/create";
import { BreadcrumbItem, message, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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


interface siteShowProps{
    site:site & { nom_client:string}
    message:message 
}

export default function siteShow({site,message}:siteShowProps){
  
    const breadcrumbs:BreadcrumbItem[] =[
        {
            title:'sites',
            href:route('mesSites')
        },
        {
            title:site.nom_site,
            href:route('site.show',site.id)
        }
    ]

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

    return(
          <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
              
                <div>
                    <Card className="bg-sidebar">
                        <CardHeader>
                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={
                                        () => {
                                            const url = route('site.edit',site.id)
                                            window.location.href=url
                                        }
                                    }
                                >
                                    Modifier
                                </Button>
                                
                            </div>
                            <div className="flex justify-between items-center">
                                <CardTitle>Client</CardTitle>
                                <span>{site.nom_client}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <CardTitle>Site</CardTitle>
                                <span>{site.nom_site}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 ">
                                 <div className="flex justify-between">
                                    <span className="font-bold">Indication :</span>
                                    <span>{site?.indication ?? 'aucune description'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Quartier:</span>
                                    <span>{site?.quartier ?? 'aucun quartier'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">personne à contacter:</span>
                                    <span>{site?.personne_a_contacter ?? 'aucune personne à contacter'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">fonction de la personne:</span>
                                    <span>{site?.fonction_personne ?? 'aucune fonction '}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="font-bold">contact de la personne:</span>
                                    <span>{site?.contact_personne ?? 'aucune contact '}</span>
                                </div>
                            </div>
                            <div className="mt-5">
                                 {
                                   (site?.latitude && site.longitude) ? 
                                    <MapContainer center={[site?.latitude,site?.longitude]} zoom={13} scrollWheelZoom={true} className="h-[400px] w-full rounded-xl shadow z-[1]">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[site?.latitude,site?.longitude]}>
                                            <Popup>
                                                                                            <button
                                                onClick={() => {
                                                    const url = `https://www.google.com/maps?q=${site?.latitude},${site?.longitude}`;
                                                    window.open(url, '_blank');
                                                }}
                                                >
                                                Voir dans Google Maps
                                                </button>

                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                    :
                                    <div className="p-15 border rounded-lg text-center  ">
                                        Aucune localisation
                                    </div>
                                }  
                            </div>
                           
                           
                        </CardContent>
                    </Card>
                </div>
           </div>
        </AppLayout>
    )
}
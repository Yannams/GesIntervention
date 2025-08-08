import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, message } from "@/types";
import { Label } from "@headlessui/react";
import { log } from "console";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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


type client = {
    id:number;
    raison_social:string
    tel_structure:string
    user_id:number
}   

export type site = {
    id:number;
    nom_site:string
    indication:string	
    quartier:string
    personne_a_contacter:string
    contact_personne:string
    fonction_personne:string
    longitude:number
    latitude:number
    client_id:number
}

interface clientProps {
    client:client
    sites:site[]
    message:message 

}

export default function showClient({client, sites,message} :clientProps){
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
    const breadcrumbs:BreadcrumbItem[] = [
    {
        title:'client',
        href:route('mesClients')
    },
    {
        title:client.raison_social,
        href:route('client.show',client.id)
    },
]

const [selectedSite, setSelectedSite]=useState<site|undefined>(undefined)

    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className=" flex justify-between items-center">
                    <div >
                        <h1 className="text-lg font-bold">{client.raison_social}</h1>
                        <h3 className="text-muted-foreground">{client.tel_structure}</h3>
                    </div>
                    <div>
                        <Button
                            onClick={()=>window.location.href=route('site.create',{slctdClt: client.id})}
                        >Ajouter un site</Button>
                    </div>
                </div>
                <div>
                    <Card className="bg-sidebar">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Sites</CardTitle>
                                <Select onValueChange={(value) => {
                                    const site = sites.find(s => s.id.toString() === value);
                                    setSelectedSite(site); // 👈 Stocke le site sélectionné
                                }}>
                                    <SelectTrigger className="w-50">
                                        <SelectValue placeholder="Sélectionner un Site"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map((site)=>(
                                            <SelectItem key={site.id} value={site.id.toString()}>{site.nom_site}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 ">
                                 <div className="flex justify-between">
                                    <span className="font-bold">Indication : </span>
                                    <span>{selectedSite?.indication ?? 'aucune indication'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Quartier:</span>
                                    <span>{selectedSite?.quartier ?? 'aucun quartier'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">personne à contacter:</span>
                                    <span>{selectedSite?.personne_a_contacter ?? 'aucune personne à contacter'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">fonction de la personne:</span>
                                    <span>{selectedSite?.fonction_personne ?? 'aucune fonction '}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="font-bold">contact de la personne:</span>
                                    <span>{selectedSite?.contact_personne ?? 'aucune contact '}</span>
                                </div>
                            </div>
                            <div className="mt-5">
                                 {
                                   (selectedSite?.latitude && selectedSite.longitude) ? 
                                    <MapContainer center={[selectedSite?.latitude,selectedSite?.longitude]} zoom={13} scrollWheelZoom={true} className="h-[400px] w-full rounded-xl shadow z-[1]">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[selectedSite?.latitude,selectedSite?.longitude]}>
                                            <Popup>
                                                <button
                                                    onClick={() => {
                                                        const url = `https://www.google.com/maps?q=${selectedSite?.latitude},${selectedSite?.longitude}`;
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
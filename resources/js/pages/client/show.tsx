import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Label } from "@headlessui/react";
import { log } from "console";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


type client = {
    id:number;
    raison_social:string
    tel_structure:string
    user_id:number
}   

type site = {
    id:number;
    nom_site:string
    description:string	
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
}
export default function showClient({client, sites} :clientProps){
    const breadcrumbs:BreadcrumbItem[] = [
    {
        title:'client',
        href:route('client.index')
    },
    {
        title:client.raison_social,
        href:route('client.index')
    },
]

const [selectedSite, setSelectedSite]=useState<site|undefined>(undefined)

    return(
        <AppLayout breadcrumbs={breadcrumbs}>
                <div >
                    <h1 className="text-lg font-bold">{client.raison_social}</h1>
                    <h3 className="text-muted-foreground">{client.tel_structure}</h3>
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
                                    <span className="font-bold">Description:</span>
                                    <span>{selectedSite?.description ?? 'aucune description'}</span>
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
           
        </AppLayout>
    )
}
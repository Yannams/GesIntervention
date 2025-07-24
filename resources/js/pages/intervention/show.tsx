import AppLayout from "@/layouts/app-layout";
import { InterventionGot } from "./mesInterventions";
import { BreadcrumbItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Button } from "@/components/ui/button";

interface showInterventionProps{
    intervention : InterventionGot & {
        formatedDate:string
    }
}


export default function showIntervention({intervention}:showInterventionProps){
    const breadcrumbs:BreadcrumbItem[]=[
    {
        title:'interventions',
        href:route('intervention.index')
    },
    {
        title:`${intervention.nom_site}  ${intervention.formatedDate}`,
        href:route('intervention.show',intervention.id)
    }
]   
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
                                <span>{intervention.nature}</span>
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
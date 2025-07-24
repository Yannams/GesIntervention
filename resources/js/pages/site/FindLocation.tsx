import { Command, CommandEmpty, CommandInput } from "@/components/ui/command";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const breadcrumbs:BreadcrumbItem[] =[
    {
        title:'Aller quelque part',
        href:route('findLocation')
    }
]

export default function findLocation() {
    const [position, setPosition] = useState<{ lat: number; lng: number }>({lat:6.3703,lng: 2.3912});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition({ lat: latitude, lng: longitude });
            },
            (err) => {
            setError(err.message);
            }
        );
        } else {
        setError("La géolocalisation n'est pas supportée par ce navigateur.");
        }
    }, []);
    return(
      
        <AppLayout breadcrumbs={breadcrumbs}>
            <Command>
                <CommandInput placeholder="rechercher un site"/>
                <CommandEmpty>Aucun site de s</CommandEmpty>
            </Command>
             <MapContainer center={[position?.lat,position?.lng]} zoom={13} scrollWheelZoom={true} className="h-full z-[1] w-full  shadow">
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
        </AppLayout>
    )
    
}
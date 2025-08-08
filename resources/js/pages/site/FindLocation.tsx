import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { site } from "../intervention/create";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { log } from "console";
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

const breadcrumbs:BreadcrumbItem[] =[
    {
        title:'Aller quelque part',
        href:route('findLocation')
    }
]

interface findLocationProps {
    sites:site[]
    selectedSite:site
}
export default function findLocation({sites, selectedSite} :findLocationProps) {
  // en haut du composant
const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: 6.3703,
    lng: 2.3912,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectSite, setSelectSite] = useState<site | null>(null);

  // 2) Géoloc navigateur (ne touche pas à la valeur par défaut en cas d’erreur)
  useEffect(() => {
  if (!selectedSite && "geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        /* si l’utilisateur refuse la géoloc, on reste sur la valeur par défaut */
      }
    );
  }
}, [selectedSite]);
  // 3) Quand Inertia passe un selectedSite en prop, on pré‑sélectionne
  useEffect(() => {
    if (selectedSite) {
      setSelectSite(selectedSite);
      setSearchQuery(selectedSite.nom_site);
    }
  }, [selectedSite]);

  // 4) A chaque fois qu’on change de selectSite, on recentre la carte
  useEffect(() => {
    if (selectSite?.latitude && selectSite?.longitude) {
      setPosition({
        lat: selectSite.latitude,
        lng: selectSite.longitude,
      });
    }
  }, [selectSite]);

      return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="relative h-[600px] w-full">
        {/* INPUT + LISTE */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[2] w-60">
          <Command className="w-full">
            <CommandInput
              placeholder="Rechercher un site"
              className="w-full"
              value={searchQuery}
              onValueChange={(val) => {
                setSearchQuery(val);
                setSelectSite(null);
              }}
            />
            {searchQuery.trim() !== "" && (
              <CommandList>
                <CommandEmpty>Aucun site</CommandEmpty>
                <CommandGroup>
                  {sites
                    .filter((s) =>
                      s.nom_site.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((s) => (
                      <CommandItem
                        key={s.id}
                        onSelect={() => {
                          setSelectSite(s);
                          setSearchQuery(s.nom_site);
                        }}
                      >
                        {s.nom_site}
                        {selectSite?.id === s.id && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </div>

        {/* CARTE */}
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          scrollWheelZoom
          className="h-screen w-full z-[1] shadow"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${position.lat},${position.lng}`,
                    "_blank"
                  )
                }
              >
                Voir dans Google Maps
              </button>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </AppLayout>
  );
}
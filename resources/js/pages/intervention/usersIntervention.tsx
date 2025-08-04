import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { intervention } from "./create";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building, Edit, EllipsisVertical, Eye } from "lucide-react";

 export type InterventionGot = intervention & {
   nom_site:string
   nom_client:string

 }
interface mesInterventionsProps{
    interventions: InterventionGot[]
}

export default function usersIntervention({interventions}:mesInterventionsProps){
     
        
        const breadcrumbs : BreadcrumbItem[]=[
            {
                title:'Mes interventions',
                href:route('mesInterventions')
            }
        ]
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Clients</TableHead>
                        <TableHead>Sites</TableHead>
                        <TableHead>Taches effectuée</TableHead>
                        <TableHead>Nature</TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                        {interventions.map((intervention, index)=>(
                            <TableRow key={intervention.id}
                                onClick={
                                    ()=>{
                                        window.location.href=route('intervention.show',intervention.id)
                                    }
                                }
                            >
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{intervention.nom_client}</TableCell>
                                <TableCell>{intervention.nom_site}</TableCell>
                                <TableCell>{intervention.tache_effectuee}</TableCell>
                                <TableCell>{intervention.nature}</TableCell>
                               
                            </TableRow>
                        ))}
                    </TableBody>
 
            </Table>
        </AppLayout>
    )
}
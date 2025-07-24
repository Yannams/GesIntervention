import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { intervention } from "./create";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, EllipsisVertical, Eye } from "lucide-react";

 export type InterventionGot = intervention & {
   nom_site:string
   nom_client:string

 }
interface mesInterventionsProps{
    interventions: InterventionGot[]
}

export default function mesIntervention({interventions}:mesInterventionsProps){
       const { auth } = usePage<SharedData>().props;
        
        const breadcrumbs : BreadcrumbItem[]=[
            {
                title:'Mes interventions',
                href:route('mesInterventions',auth.user.id)
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
                        <TableHead>Actions </TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                        {interventions.map((intervention, index)=>(
                            <TableRow>
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{intervention.nom_client}</TableCell>
                                <TableCell>{intervention.nom_site}</TableCell>
                                <TableCell>{intervention.tache_effectuee}</TableCell>
                                <TableCell>{intervention.nature}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant={'outline'}><EllipsisVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem><Edit/>Modifier</DropdownMenuItem>
                                                <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href={route('intervention.show',intervention.id)}><Eye/>voir</Link></DropdownMenuItem>
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
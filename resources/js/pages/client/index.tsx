import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Link, router } from "@inertiajs/react";
import { ChevronRight, Edit, EllipsisVertical, Eye } from "lucide-react";
import { useState } from "react";

const breadcrumbs :BreadcrumbItem[]=[
    {
        title:'client',
        href:route('client.index'),
    },
]   
export type client = {
    id:number;
    raison_social:string
    tel_structure:string
    user_id:number
}   
interface ClientsListProps {
    clients:client[]
}

export default function ClientsList({clients} :ClientsListProps){
    const [clicked,setClicked]=useState<boolean>(false)
    const [selectedClient, setSelectedClient]=useState<number|null>(null)
    const redirectToDetails = (client_id :number) =>{
        setSelectedClient(client_id)
        setClicked(true)
        router.visit(route('client.show',client_id));
    }
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
              <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Raison social</TableHead>
                            <TableHead>Numéro </TableHead>
                            <TableHead>Actions </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client, index)=>(
                            <TableRow>
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{client.raison_social}</TableCell>
                                <TableCell>{client.tel_structure}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant={'outline'}><EllipsisVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem><Edit/>Modifier</DropdownMenuItem>
                                                <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href={route('client.show',client.id)}><Eye/>voir</Link></DropdownMenuItem>
                                                
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
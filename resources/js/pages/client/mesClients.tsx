import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { client } from ".";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building, Edit, EllipsisVertical, Eye } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

interface mesClientsProps {
    clients:client[]
}



export default function mesClients( {clients} :mesClientsProps){
  
    
    const breadcrumbs : BreadcrumbItem[]=[
        {
            title:'Mes clients',
            href:route('mesClients')
        }
    ]
    return(
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex justify-end p-4">
                <Button
                    onClick={()=>window.location.href=route('client.create')}
                >Ajouter un client</Button>
            </div>
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
                            <TableRow key={client.id}>
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
                                                <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href={route('site.create',{slctdClt: client.id})}><Building/>Ajouter un site</Link></DropdownMenuItem>
                                                <DropdownMenuItem><Link className="flex items-center gap-2 w-full" href={route('client.edit', client.id)}><Edit/>Modifier</Link></DropdownMenuItem>
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
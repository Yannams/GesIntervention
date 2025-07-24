import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { client } from ".";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, EllipsisVertical, Eye } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

interface mesClientsProps {
    clients:client[]
}



export default function mesClients( {clients} :mesClientsProps){
    const { auth } = usePage<SharedData>().props;
    
    const breadcrumbs : BreadcrumbItem[]=[
        {
            title:'Mes clients',
            href:route('mesClients',auth.user.id)
        }
    ]
    return(
        <AppLayout breadcrumbs={breadcrumbs} >
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
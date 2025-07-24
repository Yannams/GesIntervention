import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";

const breadcrumbs : BreadcrumbItem[]=[
    {
        title:'users',
        href:route('usersList')
    }
]

export interface user{
    name: string;
    email:string;
    num_user:string;
}


type usersListProps = {
  users: user[];
};
export default function usersList({ users} :usersListProps){

    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <Table>
                <TableCaption>Tous les utilisateurs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>email</TableHead>
                        <TableHead>numéro</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user,index)=>(
                        <TableRow>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.num_user}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AppLayout>
    )
}
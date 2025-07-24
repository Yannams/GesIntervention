import AppLayout from "@/layouts/app-layout";
import Register from "../auth/register";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'utilisateur',
        href: route('usersList')
    },
    {
        title: 'nouveau',
        href: route('CreateUser'), 
    }
];
export default function CreateUser() {
   return (
    <AppLayout breadcrumbs={breadcrumbs}>
            <Register/>
    </AppLayout>
   
)}

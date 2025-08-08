import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { FormEventHandler } from "react";
import { Link, useForm } from "@inertiajs/react";
import { clientForm } from "../intervention/create";
import { LoaderCircle, Users } from "lucide-react";
import { toast } from "sonner";



const breadcrumbs:BreadcrumbItem[]=[
    {
        title:'clients',
        href:route('mesClients'),
    },
    {
        title:'nouveau',
        href:route('client.create'),
    },
]
export default function createClient(){
     const { data :dataClient, setData :setDataClient, post :postClient, processing :processingClient, errors :errorsClient, reset: resetClient } = useForm<Required<clientForm>>({
            raison_social:'',
            tel_structure:''
        })
        const submitClient: FormEventHandler = (e) => {
            e.preventDefault();
            postClient(route('client.store'), {
                onSuccess: () => {
                    resetClient()
                    toast.success('le client est enregistré')
                }
            });
        };
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                         <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                    <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                        <Users className="size-9  " />
                                    </div>
                                    <span className="sr-only">Créer un client</span>
                                </Link>
                                <div className="space-y-2 text-center">
                                    <h1 className="text-xl font-medium">Créer un client</h1>
                                    <p className="text-center text-sm text-muted-foreground">Entrer les informations liées au client</p>
                                </div>
                            </div>
                            <form onSubmit={submitClient}>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="raison_social">Raison social</Label>
                                        <Input 
                                            id="raison_social"
                                            type="text"
                                            value={dataClient.raison_social}
                                            onChange={(e)=>setDataClient('raison_social',e.target.value)}
                                            placeholder="Nom de l'entreprise"
                                        />
                                        <InputError message={errorsClient.raison_social}/>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="tel_structure">Telephone</Label>
                                        <Input 
                                            id="tel_structure"
                                            type="text"
                                            value={dataClient.tel_structure}
                                            onChange={(e)=>setDataClient('tel_structure',e.target.value)}
                                            placeholder="01XXXXXXXX"
                                        />
                                        <InputError message={errorsClient.tel_structure}/>
                                    </div>
                                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processingClient}>
                                        {processingClient && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Ajouter
                                    </Button>
                                </div>
                            </form>

                       </div>
                    </div>
                </div>
            </div>
            
        </AppLayout>
    )
}
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CirclePlus, Folder, Grid, Headset, LayoutGrid, Locate, MapPinned, Navigation, Plus, User, Users, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';




export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
const AdminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title:'Utilisateurs',
        icon:User,
        subItem:[
            {
                icon: CirclePlus,
                title:'Nouveau',
                href:route('CreateUser')
            },
            {
                icon: Grid,
                title:'Tous',
                href:route('usersList')
            },
        ]
    },
     {
        title:'Clients',
        icon:Users,
        subItem:[
            {
                icon: CirclePlus,
                title:'Nouveau',
                href:route('client.create')
            },
            {
                icon: Grid,
                title:'Tous',
                href:route('client.index')
            },
        ]
    },
];

const UserNavItems: NavItem[] = [
     {
        title: 'Ajouter',
        icon: CirclePlus,
        subItem:[
            {
                icon: Users,
                title:'clients',
                href:route('client.create')
            },
            {
                icon: Headset,
                title:'Interventions',
                href:route('intervention.create')
            },
        ]
    },

    {

        title:'mes enregistrements',
        icon: Folder,
        subItem:[
            {
                icon: Users,
                title:'clients',
                href:route('client.create')
            },
            {
                icon: Headset,
                title:'Interventions',
                href:route('intervention.create')
            },
        ]
    },
    {
        title: 'Aller quelque part',
        href: route('findLocation'),
        icon: MapPinned,
    },
   
]
const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];
    const userRoles = auth.user?.roles.map(role => role.name) || []
    return (
 
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {userRoles.includes('Admin') ? (
                     <NavMain items={AdminNavItems} />
                ):
                    <NavMain items={UserNavItems} />
                }
               
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

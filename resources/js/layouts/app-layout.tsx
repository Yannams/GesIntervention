import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import { Toaster } from '@/components/ui/sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
          <Toaster 
                position="top-center"
                toastOptions={{
                    unstyled: true,
                    classNames: {
                        error: 'bg-red-100 text-red-500 flex justify-between items-center p-2 rounded-md gap-2',
                        success: 'bg-primary text-primary-foreground flex justify-between items-center p-2 rounded-md gap-2',
                        warning: 'bg-yellow-100 text-yellow-500 flex justify-between items-center p-2 rounded-md gap-2',
                        info: 'bg-primary text-primary-foreground flex justify-between items-center p-2 rounded-md gap-2',
                    },
                }}
            />
    </AppLayoutTemplate>
);

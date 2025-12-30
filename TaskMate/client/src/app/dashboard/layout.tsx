import { requireAuth } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import DashboardSidebar from './DashboardSidebar';
import { SocketProvider } from '@/contexts/SocketContext';
import { Group } from '@/types';

interface GroupsResponse {
    success: boolean;
    groups: Group[];
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Server-side auth check - redirects to /login if not authenticated
    const user = await requireAuth();

    // Fetch groups for sidebar
    let groups: Group[] = [];
    try {
        const res = await serverApi.getGroups() as GroupsResponse;
        if (res.success) {
            groups = res.groups;
        }
    } catch (error) {
        console.error('Error fetching groups for sidebar:', error);
    }

    return (
        <SocketProvider>
            <DashboardSidebar initialUser={user} initialGroups={groups}>
                {children}
            </DashboardSidebar>
        </SocketProvider>
    );
}

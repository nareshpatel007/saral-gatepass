'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function Home() {
    // Define state
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && user) {
                const redirectMap: Record<string, string> = {
                    security: '/security/dashboard',
                    member: '/member/dashboard',
                    admin: '/admin/dashboard',
                };
                router.push(redirectMap[user.role] || '/');
            } else {
                router.push('/login');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
        </div>
    );
}

import GlobalConst from '@/utils/const';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

const AdminRoute = ({ children }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname()
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  
  console.log(session?.user?.role,pathname)
  if(GlobalConst.MenuItems.find(item => item.id === pathname)?.access.includes(session?.user?.role) === false) {
     if (typeof window !== 'undefined') {
         router.push('/dashboard'); // redirect non-admins to home or another page
     }
     return null;

  }

  return children;
};

export default AdminRoute;

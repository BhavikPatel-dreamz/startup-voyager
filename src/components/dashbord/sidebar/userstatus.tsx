"use client";
import { useSession, signOut } from "next-auth/react";
import React from 'react'

export default function Userstatus() {
    const { data: session } = useSession();
    const user = session?.user;
    const handleLogout = () => {
      signOut({ callbackUrl: "/login" });
    };
    console.log(session)
  return (
    user && 
    <div className='p-4 border-t border-slate-200'>
            <div className='flex items-center space-x-3'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-slate-900 truncate'>
                    {user.name}
                </p>
                <p className='text-xs text-slate-500 truncate'>
                {user.email}
                </p>
              </div>
              <button onClick={()=>handleLogout()}  className='inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent h-9 rounded-md text-slate-400 hover:text-slate-500 p-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-log-out h-4 w-4'
                >
                  <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                  <polyline points='16 17 21 12 16 7'></polyline>
                  <line x1='21' x2='9' y1='12' y2='12'></line>
                </svg>
              </button>
            </div>
          </div>
  )
}

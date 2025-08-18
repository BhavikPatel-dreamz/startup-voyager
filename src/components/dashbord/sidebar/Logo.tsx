import React from 'react'

export default function Logo({ appName }: { appName: string }) {
  return (
    <div className="flex items-center gap-3 p-6 border-b border-slate-200">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-shopping-cart text-white text-sm"
          data-replit-metadata="client/src/components/sidebar.tsx:69:12"
          data-component-name="ShoppingCart"
        >
          <circle cx="8" cy="21" r="1"></circle>
          <circle cx="19" cy="21" r="1"></circle>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
        </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">{appName}</h1>
   </div>
  )
}

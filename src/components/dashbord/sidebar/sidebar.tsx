import React from 'react'
import Logo from './Logo'
import Navigations from './Navigations'
import Userstatus from './userstatus'

export default function DashbaordSidebar({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    menuItems = [
        { id: "/dashboard", label: "Dashboard", icon: "📊" },
        { id: "/campaigns", label: "Campaigns", icon: "🎯" },
        { id: "/scripts", label: "Scripts", icon: "📝" },
        { id: "/team", label: "Team", icon: "👥" },
        { id: "/settings", label: "Settings", icon: "⚙️" },
      ]
    }: {
      isMobileMenuOpen: boolean;
      setIsMobileMenuOpen: (open: boolean) => void;
      menuItems?: { id: string; label: string; icon: string }[];
    })  
  {  
  return (
    <aside
    className={` flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-50
  ${
    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
  } lg:translate-x-0`}
  >
    {/* Logo */}
    <Logo appName={'CartVoyager'} />

    {/* Navigation */}
    <Navigations
      menuItems={menuItems}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />

   <Userstatus/>
  </aside>
  )
}

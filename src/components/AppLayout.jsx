"use client";
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashbaordSidebar from "./dashbord/sidebar/sidebar";
import PageHeader from "./dashbord/Header";
import GlobalConst from "../utils/const";

// Context to allow child pages to set the layout titles dynamically
const AppLayoutContext = React.createContext({
  setTitles: (_titles) => {},
  pageTitle: "",
  secondPageTitle: "",
});

export const useAppLayout = () => React.useContext(AppLayoutContext);

const AppLayout = ({
  children,
  pageTitle = "Dashboard",
  secondPageTitle = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Local state for dynamic titles with defaults from props
  const [currentPageTitle, setCurrentPageTitle] = useState(pageTitle);
  const [currentSecondPageTitle, setCurrentSecondPageTitle] =
    useState(secondPageTitle);

  const setTitles = React.useCallback(
    ({ pageTitle: newTitle, secondPageTitle: newSecondTitle = "" }) => {
      if (typeof newTitle === "string") setCurrentPageTitle(newTitle);
      if (typeof newSecondTitle === "string")
        setCurrentSecondPageTitle(newSecondTitle);
    },
    []
  );

  return (
    <AppLayoutContext.Provider
      value={{
        setTitles,
        pageTitle: currentPageTitle,
        secondPageTitle: currentSecondPageTitle,
      }}
    >
      <div className='min-h-screen bg-gray-50'>
        {/* Mobile menu toggle */}
        <div className='lg:hidden fixed top-4 left-4 z-50'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='p-2 bg-white rounded-lg shadow-md border border-gray-200'
          >
            {isMobileMenuOpen ? (
              <X className='w-5 h-5' />
            ) : (
              <Menu className='w-5 h-5' />
            )}
          </button>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <DashbaordSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          menuItems={GlobalConst.MenuItems}
        />

        {/* Main Content */}
        <div className='lg:ml-64'>
          {/* Header */}
          <PageHeader
            currentPageTitle={currentPageTitle}
            currentSecondPageTitle={currentSecondPageTitle}
          />

          {/* Page Content */}
          <main className='flex-1 p-6 overflow-auto'>{children}</main>
        </div>

        {isUserMenuOpen && (
          <div
            className='fixed inset-0 z-20'
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </div>
    </AppLayoutContext.Provider>
  );
};

export default AppLayout;

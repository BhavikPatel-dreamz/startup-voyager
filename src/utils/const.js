  export const MenuItems = [
        { id: "/dashboard", label: "Dashboard", icon: "📊", "access": ['admin', 'editor', 'viewer'] },
        { id: "/campaigns", label: "Campaigns", icon: "🎯", "access": ['admin', 'editor'] },
        { id: "/scripts", label: "Scripts", icon: "📝", "access": ['admin', 'editor'] },
        { id: "/team", label: "Team", icon: "👥", "access": ['admin'] },
        { id: "/settings", label: "Settings", icon: "⚙️", "access": ['admin'] },
      ]


const GlobalConst = {
 MenuItems
};

export default GlobalConst;

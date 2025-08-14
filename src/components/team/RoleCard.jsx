
import { BarChart3, Plus, X, ChevronDown, Mail, Users, Shield, Eye, RefreshCw, Search } from 'lucide-react';
export default function RoleCards({title, description, permissions, icon: Icon, color}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <RoleCard
        title="Admin Role"
        description="Full access to all features"
        icon={Shield}
        color="bg-blue-500"
        permissions={[
            'Create and manage campaigns',
            'Generate tracking scripts',
            'Access all analytics',
            'Invite team members',
            'Manage settings'
        ]}
    />
    <RoleCard
        title="Editor Role"
        description="Create and edit content"
        icon={BarChart3}
        color="bg-purple-500"
        permissions={[
            'Create and edit campaigns',
            'Access analytics dashboard',
            'Generate tracking scripts',
            'Limited user management'
        ]}
    />
    <RoleCard
        title="Viewer Role"
        description="Read-only access to data"
        icon={Eye}
        color="bg-green-500"
        permissions={[
            'View campaign performance',
            'Access analytics dashboard',
            'No editing permissions'
        ]}
    />
</div>
  )
}



// Role Card Component
const RoleCard = ({ title, description, permissions, icon: Icon, color }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <ul className="space-y-2">
      {permissions.map((permission, index) => (
        <li key={index} className="text-sm text-gray-600 flex items-center">
          <span className="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>
          {permission}
        </li>
      ))}
    </ul>
  </div>
);

export { RoleCard };
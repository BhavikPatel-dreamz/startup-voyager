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

export default RoleCard;
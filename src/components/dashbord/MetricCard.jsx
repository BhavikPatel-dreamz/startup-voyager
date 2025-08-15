import { RefreshCw, Info, MousePointer, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, info = false }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <h3 className="tracking-tight text-sm font-medium">{title}</h3>
      <div className="flex items-center gap-1">
        {info && <Info className="w-3 h-3 text-gray-400" />}
        {/* {Icon && <Icon className="w-4 h-4 text-gray-400" />} */}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default MetricCard
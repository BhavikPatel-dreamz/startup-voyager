import { RefreshCw, Info, MousePointer, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, info = false }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className="flex items-center gap-1">
        {info && <Info className="w-4 h-4 text-gray-400" />}
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default MetricCard
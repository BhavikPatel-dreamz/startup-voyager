import { RefreshCw, Info, MousePointer, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import CampaignRow from './CampaignRow';

const CampaignMetricsDashboard = ({ 
  data = {
    totalImpressions: 5,
    totalCtaClicks: 0,
    totalCompletions: 0,
    totalRevenue: 0.00,
    overallConversionRate: 0.00,
    campaigns: [
      { name: "THU-pop1", impressions: 4, ctaClicks: 0, completions: 0, revenue: 0.00, conversionRate: 0.00 },
      { name: "SVC-test1", impressions: 1, ctaClicks: 0, completions: 0, revenue: 0.00, conversionRate: 0.00 }
    ]
  },

  lastUpdated = "14:45:15",
  autoRefreshInterval = "10s"
}) => {
  
  const handleRefresh = () => {
    // Refresh logic here
    console.log("Refreshing data...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="ml-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <span>Last updated: {lastUpdated}</span>
            <span>Auto-refresh: {autoRefreshInterval}</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Impressions"
            value={data.totalImpressions}
            icon={MousePointer}
            info
          />
          <MetricCard
            title="CTA Clicks"
            value={data.totalCtaClicks}
            icon={MousePointer}
            info
          />
          <MetricCard
            title="Cart Completions"
            value={data.totalCompletions}
            icon={ShoppingCart}
            info
          />
          <MetricCard
            title="Revenue Recovered"
            value={`$${data.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            info
          />
          <MetricCard
            title="Conversion Rate"
            value={`${data.overallConversionRate.toFixed(2)}%`}
            icon={TrendingUp}
            info
          />
        </div>

        {/* Campaign Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Campaign Performance</h2>
            <p className="text-sm text-gray-600">Detailed metrics for each campaign showing impressions, clicks, completions, and revenue.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      Popup Impressions
                      <Info className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      CTA Clicks
                      <Info className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      Cart Completions
                      <Info className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      Revenue Recovered
                      <Info className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      Conversion Rate
                      <Info className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.campaigns.map((campaign, index) => (
                  <CampaignRow
                    key={index}
                    campaign={campaign.name}
                    impressions={campaign.impressions}
                    ctaClicks={campaign.ctaClicks}
                    completions={campaign.completions}
                    revenue={campaign.revenue}
                    conversionRate={campaign.conversionRate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignMetricsDashboard;

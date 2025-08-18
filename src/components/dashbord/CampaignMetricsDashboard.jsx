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

 
}) => {
  


  return (
    <div className="min-h-screen bg-gray-50">
    
            {/* Header */}
      
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
          <div className="space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Campaign Performance</h2>
            <p className="text-sm text-muted-foreground mt-2">Detailed metrics for each campaign showing impressions, clicks, completions, and revenue.</p>
          </div>
          
          <div className="px-6 pt-0 overflow-x-auto">
            <table className="min-w-full">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                    Campaign
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                    Popup Impressions
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                    CTA Clicks
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                    Cart Completions
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                    Revenue Recovered
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
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
  );
};

export default CampaignMetricsDashboard;

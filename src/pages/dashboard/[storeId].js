import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Eye, ShoppingCart, CreditCard, Users, TrendingUp, 
  Calendar, Download, Settings, Copy, Check
} from 'lucide-react';

const Dashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  // Mock data for demonstration
  const mockData = {
    overview: {
      total_events: 12543,
      page_views: 8234,
      product_views: 2341,
      add_to_carts: 453,
      purchases: 87,
      unique_visitors: 1876,
      conversion_rate: 3.72
    },
    top_products: [
      { _id: 'prod_1', product_name: 'Wireless Headphones', views: 234, add_to_carts: 45 },
      { _id: 'prod_2', product_name: 'Smart Watch', views: 189, add_to_carts: 32 },
      { _id: 'prod_3', product_name: 'Laptop Stand', views: 156, add_to_carts: 28 },
      { _id: 'prod_4', product_name: 'Phone Case', views: 143, add_to_carts: 25 },
      { _id: 'prod_5', product_name: 'USB Cable', views: 98, add_to_carts: 18 }
    ],
    daily_stats: [
      { _id: '2024-01-01', total: 423, events: [{ event: 'page_view', count: 234 }, { event: 'product_view', count: 123 }, { event: 'add_to_cart', count: 45 }, { event: 'purchase', count: 21 }] },
      { _id: '2024-01-02', total: 456, events: [{ event: 'page_view', count: 245 }, { event: 'product_view', count: 134 }, { event: 'add_to_cart', count: 52 }, { event: 'purchase', count: 25 }] },
      { _id: '2024-01-03', total: 389, events: [{ event: 'page_view', count: 203 }, { event: 'product_view', count: 112 }, { event: 'add_to_cart', count: 48 }, { event: 'purchase', count: 26 }] },
      { _id: '2024-01-04', total: 512, events: [{ event: 'page_view', count: 267 }, { event: 'product_view', count: 145 }, { event: 'add_to_cart', count: 67 }, { event: 'purchase', count: 33 }] },
      { _id: '2024-01-05', total: 478, events: [{ event: 'page_view', count: 251 }, { event: 'product_view', count: 138 }, { event: 'add_to_cart', count: 59 }, { event: 'purchase', count: 30 }] },
      { _id: '2024-01-06', total: 445, events: [{ event: 'page_view', count: 234 }, { event: 'product_view', count: 129 }, { event: 'add_to_cart', count: 54 }, { event: 'purchase', count: 28 }] },
      { _id: '2024-01-07', total: 523, events: [{ event: 'page_view', count: 278 }, { event: 'product_view', count: 152 }, { event: 'add_to_cart', count: 68 }, { event: 'purchase', count: 25 }] }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStoreData(mockData);
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const copyTrackingScript = () => {
    const script = `<script 
  src="https://your-domain.com/tracking.js"
  data-store-id="store_1234567890"
  data-api-key="sk_abcdefghijklmnopqrstuvwxyz123456"
  data-endpoint="https://your-domain.com/api/track"
  data-auto-track="true"
  async>
</script>`;
    
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = storeData.daily_stats.map(day => ({
    date: new Date(day._id).toLocaleDateString(),
    page_views: day.events.find(e => e.event === 'page_view')?.count || 0,
    product_views: day.events.find(e => e.event === 'product_view')?.count || 0,
    add_to_carts: day.events.find(e => e.event === 'add_to_cart')?.count || 0,
    purchases: day.events.find(e => e.event === 'purchase')?.count || 0,
    total: day.total
  }));

  const funnelData = [
    { name: 'Page Views', value: storeData.overview.page_views, color: '#3B82F6' },
    { name: 'Product Views', value: storeData.overview.product_views, color: '#10B981' },
    { name: 'Add to Cart', value: storeData.overview.add_to_carts, color: '#F59E0B' },
    { name: 'Purchases', value: storeData.overview.purchases, color: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your e-commerce performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'products', 'setup'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {storeData.overview.page_views.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Add to Cart</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {storeData.overview.add_to_carts.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Purchases</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {storeData.overview.purchases.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {storeData.overview.conversion_rate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Traffic */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Traffic</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F680" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Breakdown (7 Days)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="page_views" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="product_views" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="add_to_carts" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="purchases" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Add to Cart
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {storeData.top_products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.add_to_carts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((product.add_to_carts / product.views) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation Instructions</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">1. Add tracking script to your website</h4>
                  <p className="text-gray-600 mb-3">
                    Copy and paste this script before the closing &lt;/head&gt; tag on all pages you want to track.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <code className="text-green-400 text-sm">
{`<script 
  src="https://your-domain.com/tracking.js"
  data-store-id="store_1234567890"
  data-api-key="sk_abcdefghijklmnopqrstuvwxyz123456"
  data-endpoint="https://your-domain.com/api/track"
  data-auto-track="true"
  async>
</script>`}
                    </code>
                    <button
                      onClick={copyTrackingScript}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">2. Manual event tracking (optional)</h4>
                  <p className="text-gray-600 mb-3">
                    Use these JavaScript functions to track custom events:
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
{`// Track product view
ea('trackProductView', {
  id: 'product-123',
  name: 'Product Name',
  price: 29.99,
  category: 'Electronics'
});

// Track add to cart
ea('trackAddToCart', {
  id: 'product-123',
  name: 'Product Name', 
  price: 29.99
}, 1);

// Track custom event
ea('trackEvent', 'newsletter_signup', {
  source: 'homepage'
});`}
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">3. Platform-specific setup</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">WooCommerce</h5>
                      <p className="text-sm text-gray-600">
                        Add the script to your theme's header.php file or use a plugin like "Insert Headers and Footers"
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Shopify</h5>
                      <p className="text-sm text-gray-600">
                        Add the script to your theme.liquid file in the &lt;head&gt; section
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-blue-700 text-sm mb-3">
                Our analytics script automatically detects WooCommerce and Shopify platforms and starts tracking immediately.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Page views, product views, and purchases are tracked automatically</li>
                <li>• No additional configuration needed for most e-commerce platforms</li>
                <li>• Data appears in your dashboard within minutes</li>
                <li>• Free tier includes 100,000 events per month</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
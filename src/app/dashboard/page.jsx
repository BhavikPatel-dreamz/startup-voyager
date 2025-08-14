"use client";
import CampaignMetricsDashboard from "../../components/dashbord/CampaignMetricsDashboard";
import AppLayout from "../../components/AppLayout";

export default function DashboardPage() {

  const sampleData = {
    totalImpressions: 1250,
    totalCtaClicks: 89,
    totalCompletions: 23,
    totalRevenue: 1450.75,
    overallConversionRate: 7.12,
    campaigns: [
      { name: "Summer Sale 2024", impressions: 850, ctaClicks: 67, completions: 18, revenue: 980.50, conversionRate: 7.88 },
      { name: "Black Friday", impressions: 400, ctaClicks: 22, completions: 5, revenue: 470.25, conversionRate: 5.50 }
    ]
  };

  return (
    <AppLayout
      pageTitle="Campaign Metrics"
      secondPageTitle="Track popup impressions, CTA clicks, and cart completions across all campaigns."
    >
      <CampaignMetricsDashboard data={sampleData} />
    </AppLayout>
  );
}

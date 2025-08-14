const CampaignRow = ({ campaign, impressions, ctaClicks, completions, revenue, conversionRate }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {campaign}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
      {impressions}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
      {ctaClicks}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
      {completions}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
      ${revenue.toFixed(2)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
      {conversionRate.toFixed(2)}%
    </td>
  </tr>
);

export default CampaignRow
const CampaignRow = ({ campaign, impressions, ctaClicks, completions, revenue, conversionRate }) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
      {campaign}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
      {impressions}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
      {ctaClicks}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
      {completions}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
      ${revenue.toFixed(2)}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
      {conversionRate.toFixed(2)}%
    </td>
  </tr>
);

export default CampaignRow

import { fetchSites } from "../../lib/actions/connectedSiteActions";
import ScriptsClient from "../../components/script/ScriptsClient";

export default async function TrackingScriptsPage() {
    // Fetch data on the server side
    const sitesResult = await fetchSites();
    const sites = sitesResult.success ? JSON.parse(JSON.stringify(sitesResult.data)) : [];

    return <ScriptsClient initialSites={sites}  />;
}

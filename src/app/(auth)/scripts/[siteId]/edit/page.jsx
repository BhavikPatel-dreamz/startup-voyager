
import EditScriptClient from '../../../../../components/script/Edit/main';
import { fetchSiteScript, fetchSiteAccess } from '../../../../../lib/actions/scriptActions';


export default async function EditScriptPage({ params }) {
    const { siteId } = await params



    
    // Fetch site script data and access information
    const [scriptResult, accessResult] = await Promise.all([
        fetchSiteScript(siteId),
        fetchSiteAccess(siteId)
    ]);

    const site = scriptResult.success ? scriptResult.data : null;
    console.log(site)

     const siteAccess = accessResult.success ? accessResult.data : [];
     console.log(siteAccess)
     

    if (!site) {
        return (
          
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Site Not Found</h1>
                    <p className="text-gray-600">The requested site could not be found.</p>
                </div>
            </div>
           
        );
    }
     <EditScriptClient site={site} siteAccess={siteAccess} /> 

} 
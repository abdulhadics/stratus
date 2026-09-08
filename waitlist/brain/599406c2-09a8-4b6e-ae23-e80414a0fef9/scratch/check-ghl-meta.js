async function check() {
  const GHL_API_TOKEN = process.env.GHL_DASHBOARD_API_TOKEN;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
  
  const headers = {
    'Authorization': `Bearer ${GHL_API_TOKEN}`,
    'Version': '2021-07-28',
    'Accept': 'application/json'
  };

  // Contacts Meta
  const cRes = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`, { headers });
  const cData = await cRes.json();
  console.log("Contacts Meta:", cData.meta);

  // Opportunities Meta
  const oRes = await fetch(`https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION_ID}`, { headers });
  const oData = await oRes.json();
  console.log("Opps Meta:", oData.meta);
  
  // Summing monetary values
  const totalValue = (oData.opportunities || []).reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0);
  console.log("Pipeline Value:", totalValue);
}

check();

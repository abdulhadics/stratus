async function check() {
  const GHL_API_TOKEN = process.env.GHL_DASHBOARD_API_TOKEN;
  const RANDOM_LOCATION_ID = "xyz123test"; // testing an invalid/different location
  
  const headers = {
    'Authorization': `Bearer ${GHL_API_TOKEN}`,
    'Version': '2021-07-28',
    'Accept': 'application/json'
  };

  const cRes = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${RANDOM_LOCATION_ID}&limit=1`, { headers });
  console.log("Status:", cRes.status);
  console.log("Body:", await cRes.text());
}
check();

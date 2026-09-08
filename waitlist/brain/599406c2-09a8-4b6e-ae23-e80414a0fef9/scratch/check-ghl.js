async function check() {
  const GHL_API_TOKEN = process.env.GHL_DASHBOARD_API_TOKEN;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
  
  const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`, {
    headers: {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  const contact = data.contacts.find(c => c.email === 'adam@adamkoubi.com');
  console.log(JSON.stringify(contact?.customFields, null, 2));
}

check();

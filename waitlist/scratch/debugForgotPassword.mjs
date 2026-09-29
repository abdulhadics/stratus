// Debug script: Test GHL contact search and tag addition
const email = "d3monslay3r333@gmail.com";
const locationId = "jfoD7cKt3XJ0FObiU5i3"; // Stratus Internal
const ghlToken = process.env.GHL_API_TOKEN || "pit-2d0c44c2-65d7-417c-b5b9-1482d0e1885c";

const headers = {
  'Authorization': `Bearer ${ghlToken}`,
  'Version': '2021-07-28',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function main() {
  console.log("1. Searching for contact by email...");

  const searchRes = await fetch(`https://services.leadconnectorhq.com/contacts/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      locationId,
      filters: [{ field: 'email', operator: 'eq', value: email }],
      pageLimit: 1
    })
  });
  console.log("   Status:", searchRes.status);

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error("   Search FAILED:", errText);
    return;
  }

  const searchData = await searchRes.json();
  console.log("   Total contacts found:", searchData.total || searchData.contacts?.length || 0);

  if (!searchData.contacts || searchData.contacts.length === 0) {
    console.error("   No contact found with this email in GHL location:", locationId);
    return;
  }

  const contact = searchData.contacts[0];
  console.log(`   Found contact: ${contact.firstName} ${contact.lastName} (ID: ${contact.id})`);

  console.log("\n2. Adding 'forgot-password' tag...");
  const tagRes = await fetch(`https://services.leadconnectorhq.com/contacts/${contact.id}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tags: ["forgot-password"] })
  });

  console.log("   Tag Status:", tagRes.status);
  const tagData = await tagRes.text();
  console.log("   Tag Response:", tagData);
}

main().catch(console.error);

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function getAppStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/app-status`);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    const data = json.data;

    if (!data) return null;

    // 1. Handle whatsapp_links if provided by API (New preferred way)
    if (data.whatsapp_links && data.whatsapp_links.length > 0) {
      data.contact_whatsapp = data.whatsapp_links[0];
    } 
    // 2. Handle legacy contact_whatsapp format (comma-separated numbers)
    else if (data.contact_whatsapp && data.contact_whatsapp.includes(',')) {
      const firstNum = data.contact_whatsapp.split(',')[0].trim();
      data.contact_whatsapp = `https://wa.me/${firstNum}`;
    }
    // 3. Handle single number string that is not a full URL
    else if (data.contact_whatsapp && !data.contact_whatsapp.startsWith('http')) {
      data.contact_whatsapp = `https://wa.me/${data.contact_whatsapp.trim()}`;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching app status:', error);
    return null;
  }
}

export async function getWhatsAppContacts() {
  try {
    const response = await fetch(`${API_BASE_URL}/app-status`);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    const data = json.data;
    
    let contacts: string[] = [];
    
    if (data && data.whatsapp_contacts && Array.isArray(data.whatsapp_contacts)) {
      contacts = data.whatsapp_contacts;
    } else if (data && data.contact_whatsapp) {
      contacts = data.contact_whatsapp.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
    }
    
    if (contacts.length === 0) {
      return []; // Return empty instead of hardcoded fallback
    }
    
    return contacts.map(num => ({
      number: num,
      link: num.startsWith('http') ? num : `https://wa.me/${num}`
    }));
  } catch (error) {
    console.error('Error fetching whatsapp contacts:', error);
    return [];
  }
}

export async function getTerms() {
  try {
    const response = await fetch(`${API_BASE_URL}/legal/terms`);
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching terms:', error);
    return null;
  }
}

export async function getPrivacy() {
  try {
    const response = await fetch(`${API_BASE_URL}/legal/privacy`);
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching privacy:', error);
    return null;
  }
}

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;
const BASE_URL = API_BASE_URL.replace('/api', '');

export const formatCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(num)) return value.toString();
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

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
    
    // 4. Handle download_url - ensure absolute URL
    if (data.download_url && !data.download_url.startsWith('http')) {
      data.download_url = `${BASE_URL}${data.download_url.startsWith('/') ? '' : '/'}${data.download_url}`;
    }

    // Add file size if download_url exists
    if (data.download_url && data.download_url.startsWith('http')) {
      try {
        const fileRes = await fetch(data.download_url, { method: 'HEAD' });
        const size = fileRes.headers.get('content-length');
        if (size) {
          const mb = parseInt(size) / (1024 * 1024);
          data.file_size = `~${Math.round(mb)} MB`;
        }
      } catch (e) {
        // Ignore errors, file_size will be undefined
      }
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

export async function getBanners() {
  try {
    const response = await fetch(`${API_BASE_URL}/banners`);
    if (!response.ok) return [];
    const json = await response.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

export async function getAnnouncements() {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`);
    if (!response.ok) return [];
    const json = await response.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function getTerms() {
  try {
    const response = await fetch(`${API_BASE_URL}/legal/terms`);
    if (!response.ok) return null;
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
    if (!response.ok) return null;
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching privacy:', error);
    return null;
  }
}

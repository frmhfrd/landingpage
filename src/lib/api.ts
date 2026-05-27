const DEFAULT_API_URL = 'https://api.gampangberes.biz.id/api';
let rawUrl = import.meta.env.PUBLIC_API_BASE_URL || DEFAULT_API_URL;
rawUrl = rawUrl.replace(/\/+$/, '');
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}
export const API_BASE_URL = rawUrl;
export const BASE_URL = API_BASE_URL.replace(/\/api$/, '');

let appStatusPromise: Promise<any> | null = null;

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
  if (typeof window !== 'undefined' && appStatusPromise) {
    return appStatusPromise;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/app-status`);
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      const data = json.data;
      if (!data) return null;

      if (data.whatsapp_links && data.whatsapp_links.length > 0) {
        data.contact_whatsapp = data.whatsapp_links[0];
      } else if (data.contact_whatsapp && data.contact_whatsapp.includes(',')) {
        const firstNum = data.contact_whatsapp.split(',')[0].trim();
        data.contact_whatsapp = `https://wa.me/${firstNum}`;
      } else if (data.contact_whatsapp && !data.contact_whatsapp.startsWith('http')) {
        data.contact_whatsapp = `https://wa.me/${data.contact_whatsapp.trim()}`;
      }
      
      if (data.download_url && !data.download_url.startsWith('http')) {
        data.download_url = `${BASE_URL}${data.download_url.startsWith('/') ? '' : '/'}${data.download_url}`;
      }

      // Fetch file size if missing and we have a valid download URL
      if (data.download_url && data.download_url.startsWith('http') && !data.file_size) {
        try {
          // Try to fetch file size via HEAD request
          // We follow redirects because GitHub/CDN links often redirect
          const fetchOptions: RequestInit = { 
            method: 'HEAD', 
            redirect: 'follow',
            // Add a signal to timeout if it takes too long
          };
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          fetchOptions.signal = controller.signal;

          const fileRes = await fetch(data.download_url, fetchOptions);
          clearTimeout(timeoutId);
          
          const size = fileRes.headers.get('content-length');
          if (size) {
            const mb = parseInt(size) / (1024 * 1024);
            data.file_size = `~${Math.round(mb)} MB`;
          }
        } catch (e) {
          // Silently fail if we can't get the size (common on client-side due to CORS)
        }
      }
      return data;
    } catch (error) {
      console.error('Error fetching app status:', error);
      appStatusPromise = null;
      return null;
    }
  })();

  if (typeof window !== 'undefined') {
    appStatusPromise = fetchPromise;
  }
  return fetchPromise;
}

export async function getWhatsAppContacts() {
  try {
    const data = await getAppStatus();
    let contacts: string[] = [];
    if (data && data.whatsapp_contacts && Array.isArray(data.whatsapp_contacts)) {
      contacts = data.whatsapp_contacts;
    } else if (data && data.contact_whatsapp) {
       contacts = [data.contact_whatsapp];
    }
    if (contacts.length === 0) return [];
    return contacts.map(num => ({
      number: num,
      link: num.startsWith('http') ? num : `https://wa.me/${num}`
    }));
  } catch (error) {
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
    return null;
  }
}

import axios from "axios";

const ngrokUrl = 'https://investigatory-shayla-unstalemated.ngrok-free.dev';
const localhostUrl = 'http://localhost:8000';

let defaultBase = ngrokUrl;

// Determine which base URL to use. Prefer VITE_API_BASE when provided.
function getDefaultBase() {
  const envBase = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : null;

  if (envBase) return envBase;
  // Default to localhost for local development; set VITE_API_BASE to override (ngrok, etc.).
  return ngrokUrl;
}

// Initialize API with default localhost, will update after checking URLs
const api = axios.create({
  baseURL: ngrokUrl.replace(/\/$/, '') + '/api',
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "ngrok-skip-browser-warning": "true",
  },
});

// Set base synchronously using env or default to localhost to avoid early CORS probes
api.defaults.baseURL = getDefaultBase().replace(/\/$/, '') + '/api';

// ...existing code...
export async function ensureCsrf() {
  try {
    const root = api.defaults.baseURL.replace(/\/api\/?$/, '');
    await axios.get(root + '/sanctum/csrf-cookie', { withCredentials: true });
    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? decodeURIComponent(v.pop()) : null;
    };
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf) {
      api.defaults.headers.common['X-XSRF-TOKEN'] = xsrf;
    }
  } catch (e) {
    // ignore — some backends don't use sanctum
  }
}

export function storageUrl(path){
  if(!path) return 'https://via.placeholder.com/150?text=No+Image';
  try{
    return api.defaults.baseURL.replace(/\/api\/?$/, '') + '/storage/' + path;
  }catch(e){
    return '/storage/' + path;
  }
}

export default api;
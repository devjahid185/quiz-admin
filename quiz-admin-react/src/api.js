import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Ensure CSRF cookie (useful for Laravel Sanctum flows). Call before POST login if needed.
export async function ensureCsrf() {
  try {
    // api.baseURL points to /api; sanctum csrf endpoint lives at the root '/sanctum/csrf-cookie'
    const root = api.defaults.baseURL.replace(/\/api\/?$/, '');
    await axios.get(root + '/sanctum/csrf-cookie', { withCredentials: true });
    // read XSRF-TOKEN cookie and set it as default header for api instance
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
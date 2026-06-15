const TOKEN_KEY = "cup-pulse-admin-token";
export const getAdminToken = () => sessionStorage.getItem(TOKEN_KEY) || "";
export const setAdminToken = (token) => sessionStorage.setItem(TOKEN_KEY, token.trim());
export const clearAdminToken = () => sessionStorage.removeItem(TOKEN_KEY);
export async function adminApi(path, options = {}) { const token=getAdminToken(); const response=await fetch(`${import.meta.env.VITE_API_URL || "/api/v1"}/admin${path}`,{...options,headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`,...options.headers}}); if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.error?.message||`Admin request failed (${response.status})`)} if(response.status===204)return null;return response.json() }

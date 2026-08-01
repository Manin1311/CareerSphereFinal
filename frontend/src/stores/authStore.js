import {create} from 'zustand'
export const useAuthStore = create((set) => ({
  company: null, apiKey: "", jwt: "", tier: "free",
  
  setAuth: (data) => {
    if (data) {
      localStorage.setItem("cs_jwt", data.jwt_token || "");
      localStorage.setItem("cs_api_key", data.api_key || data.secret_key || "");
      localStorage.setItem("cs_company", JSON.stringify(data));
      localStorage.setItem("careersphere_user", JSON.stringify({
        id: data.id || data.company_id,
        user_id: data.id || data.company_id,
        email: data.email,
        name: data.name || data.email?.split("@")[0] || "User",
        tier: data.tier || "free",
        role: "recruiter"
      }));
    }
    set({
      company: data,
      apiKey: data.api_key || data.secret_key || "",
      jwt: data.jwt_token || "",
      tier: data.tier || "free"
    })
  },
  
  clearAuth: () => {
    localStorage.removeItem("cs_jwt");
    localStorage.removeItem("cs_api_key");
    localStorage.removeItem("cs_company");
    localStorage.removeItem("careersphere_user");
    set({company:null,apiKey:"",jwt:"",tier:"free"})
    window.location.href="/login"
  },
  
  initFromStorage: () => {
    const company = JSON.parse(
      localStorage.getItem("cs_company") || "null"
    )
    const jwt = localStorage.getItem("cs_jwt") || ""
    const apiKey = localStorage.getItem("cs_api_key")||""
    if (company && jwt) {
      set({company, jwt, apiKey, 
           tier: company.tier || "free"})
      if (!localStorage.getItem("careersphere_user")) {
        localStorage.setItem("careersphere_user", JSON.stringify({
          id: company.id || company.company_id,
          user_id: company.id || company.company_id,
          email: company.email,
          name: company.name || company.email?.split("@")[0] || "User",
          tier: company.tier || "free",
          role: "recruiter"
        }));
      }
    }
  }
}))

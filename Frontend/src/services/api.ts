import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/users/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================= AUTH APIs =================
export const signupApi = (data: any) => API.post("register/", data);
export const loginApi = (data: any) => API.post("login/", data);
export const verifyEmailApi = (uid: string, token: string) =>
  API.post("verify-email/", { uid, token });

// ================= KYC API =================
export const getKYCStatus = async () => {
  try {
    const response = await API.get("kyc-status/");
    return response.data;
  } catch (error) {
    console.error("KYC fetch error:", error);
    return null;
  }
};

export default API;

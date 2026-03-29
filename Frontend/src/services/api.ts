import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/users/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
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
export const getProfile = async () => {
  try {
    const response = await API.get("profile/");
    return response.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};

// ================= KYC API =================
export const getKYCStatus = async () => {
  try {
    const response = await API.get("kyc/status/");
    return response.data;
  } catch (error) {
    console.error("KYC fetch error:", error);
    return null;
  }
};

export const submitKYC = async (formData: FormData) => {
  try {
    const response = await API.post("kyc/submit/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("KYC submit error:", error);
    throw error;
  }
};

// ================= ADMIN KYC API =================
export const adminGetAllKYC = async (status?: string) => {
  try {
    const url = status ? `admin/kyc/?status=${status}` : "admin/kyc/";
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error("Admin KYC fetch error:", error);
    throw error;
  }
};

export const adminGetKYCDetail = async (id: number) => {
  try {
    const response = await API.get(`admin/kyc/${id}/`);
    return response.data;
  } catch (error) {
    console.error("KYC detail fetch error:", error);
    throw error;
  }
};

export const adminUpdateKYCStatus = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
  try {
    const response = await API.patch(`admin/kyc/${id}/update-status/`, { status });
    return response.data;
  } catch (error) {
    console.error("KYC status update error:", error);
    throw error;
  }
};

export const adminGetKYCStats = async () => {
  try {
    const response = await API.get("admin/kyc/stats/");
    return response.data;
  } catch (error) {
    console.error("KYC stats fetch error:", error);
    throw error;
  }
};

// ================= PROPERTY APIs =================
export const getProperties = async (propertyType?: string) => {
  try {
    const url = propertyType ? `properties/?type=${propertyType}` : "properties/";
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error("Properties fetch error:", error);
    throw error;
  }
};

export const getPropertyDetail = async (id: number) => {
  try {
    const response = await API.get(`properties/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Property detail fetch error:", error);
    throw error;
  }
};

export const createProperty = async (formData: FormData) => {
  try {
    const response = await API.post("property/add/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Property create error:", error);
    throw error;
  }
};

// ================= LANDLORD APIs =================
export const getLandlordProperties = async () => {
  try {
    const response = await API.get("landlord/properties/");
    return response.data;
  } catch (error) {
    console.error("Landlord properties fetch error:", error);
    throw error;
  }
};

export const getLandlordDashboard = async () => {
  try {
    const response = await API.get("landlord/dashboard/");
    return response.data;
  } catch (error) {
    console.error("Landlord dashboard fetch error:", error);
    throw error;
  }
};

// ================= ADMIN PROPERTY APIs =================
export const adminGetAllProperties = async (propertyType?: string, availableOnly?: boolean) => {
  try {
    let url = "admin/properties/";
    const params = new URLSearchParams();
    if (propertyType) params.append("type", propertyType);
    if (availableOnly) params.append("available", "true");
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error("Admin properties fetch error:", error);
    throw error;
  }
};

// ================= BOOKING APIs =================
export const createBooking = async (propertyId: number, checkIn: string, checkOut: string, totalPrice: number) => {
  try {
    const response = await API.post("bookings/create/", {
      property: propertyId,
      check_in: checkIn,
      check_out: checkOut,
      total_price: totalPrice,
    });
    return response.data;
  } catch (error) {
    console.error("Booking create error:", error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const response = await API.get("bookings/");
    return response.data;
  } catch (error) {
    console.error("User bookings fetch error:", error);
    throw error;
  }
};

export const getLandlordBookings = async () => {
  try {
    const response = await API.get("landlord/bookings/");
    return response.data;
  } catch (error) {
    console.error("Landlord bookings fetch error:", error);
    throw error;
  }
};

export const getBookingDetail = async (id: number) => {
  try {
    const response = await API.get(`bookings/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Booking detail fetch error:", error);
    throw error;
  }
};

export const updateBooking = async (id: number, data: any) => {
  try {
    const response = await API.patch(`bookings/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Booking update error:", error);
    throw error;
  }
};

export const cancelBooking = async (id: number) => {
  try {
    const response = await API.delete(`bookings/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Booking cancel error:", error);
    throw error;
  }
};

export default API;
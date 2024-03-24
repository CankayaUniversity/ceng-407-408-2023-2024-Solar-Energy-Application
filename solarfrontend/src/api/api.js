import { Token } from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "https://solar-energy-app.azurewebsites.net";
// const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

const handleRequest = async (requestFunction) => {
  try {
    const response = await requestFunction();
    return [response.data, null];
  } catch (error) {
    return [null, error.response ? error.response.data : error];
  }
};

export const CUSTOMERS = {
  getAll: async (queryParams) => {
    console.log("query", queryParams);
    return handleRequest(() => api.get("/customers", { params: queryParams }));
  },
  byId: async (id) => {
    return handleRequest(() => api.get(`/customers/${id}`));
  },
  postCustomer: async (customer) => {
    return handleRequest(() => api.post("/customers", customer));
  },
  putCustomer: async (customer) => {
    return handleRequest(() => api.put(`/customers/${customer.id}`, customer));
  },
  patchCustomer: async (id, customerData) => {
    return handleRequest(() => api.patch(`/customers/${id}`, customerData));
  },
};

export const ADDRESS = {
  byId: async (id) => {
    return handleRequest(() => api.get(`/addresses/${id}`));
  },
  postAddress: async (address) => {
    return handleRequest(() => api.post("/addresses", address));
  },
  putAddress: async (address) => {
    return handleRequest(() => api.put(`/addresses/${address.id}`, address));
  },
};

export const COMPANY = {
  postCompany: async (company) => {
    return handleRequest(() => api.post("/companies/create-company", company));
  },
};

export const USER = {
  login: async (email, password) => {
    const userInformation = {
      email: email,
      password: password,
    };
    return handleRequest(() => api.post("/users/login", userInformation));
  },

   register: async (user, company) => {
    try {
      const companyResponse = await COMPANY.postCompany(company);
      if (!companyResponse || !companyResponse[0]) {
        throw new Error('Failed to create company');
      }
      const companyId = companyResponse[0]._id;
      user.company_id = companyId;
      user.role = "company_admin";
      const userResponse = await handleRequest(() => api.post("/users/register", user));
      if (!userResponse || !userResponse[0]) {
        throw new Error('Failed to register user');
      }
      return [userResponse[0], null]; 
    } catch (error) {
      return [null, error]; 
    }
  },


  getProfile: async () => {
    return handleRequest(() => api.get("/users/profile"));
  },

  updateProfile: async (userId, userData) => {
    return handleRequest(() => api.patch(`/users/${userId}`, userData));
  },

  byId: async (id) => {
    return handleRequest(() => api.get(`/customers/${id}`));
  },
  // postCustomer: async (customer) => {
  //     return handleRequest(() => api.post('/customers', customer));
  // },
  putCustomer: async (customer) => {
    return handleRequest(() => api.put(`/customers/${customer.id}`, customer));
  },
};

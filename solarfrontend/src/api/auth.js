// import { USER } from "../api/api";

// export const auth = {
//   login: async (email, password) => {
//     try {
//       const response = await USER.login(email, password);
//       if (!response || response.length === 0 || !response[0].token) {
//         throw new Error('Invalid login credentials');
//       }
//       const token = response[0].token;
//       localStorage.setItem('accessToken', token);
//       localStorage.setItem('userProfile', JSON.stringify(response[0].user));
//       return token;
//     } catch (error) {
//       // Burada API'dan dönen hata mesajını kullanmak daha uygun olabilir.
//       return error
//     }
//   },
//   logout: () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('userProfile');
//   },
// };

import { USER } from "../api/api";

export const auth = {
  login: async (email, password) => {
    try {
      const [response, error] = await USER.login(email, password);
      if (error) throw new Error(error);

      const token = response.token;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userProfile', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userProfile');
  },
};

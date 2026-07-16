 import api from "../api"

 export const userProfileUsers = async (acc) => {
     try {
         const response = await api.post("/user/profileUsers", {
             account: acc,
         });
        return response.data
     } catch (error) {
         console.error("Profiles Xeta:", error)
        throw error
     }
 }

 export const updateProfileUser = async ({ account, login, publicMode }) => {
     try {
         const response = await api.post("/user/updateProfileUser", {
             account,
             login,
             publicMode,
         });
         return response;
     } catch (error) {
         console.error("updateProfileUser Xeta:", error);
         throw error;
     }
 };
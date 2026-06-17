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
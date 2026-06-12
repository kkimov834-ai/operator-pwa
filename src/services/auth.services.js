import api from '../api';

/**
 * Получить информацию о текущем пользователе
 * @returns {Promise<{id: string, role: string}>} Данные пользователя
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user/me');
    console.log('Current user response:', response);
    // Response structure: {status: "success", data: {identifier, role, partnerPin}}
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

export default {
  getCurrentUser,
};
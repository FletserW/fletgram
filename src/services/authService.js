import { BASE_URL } from "../constants/config";

export const API_URL = `${BASE_URL}/users`;

export const registerUser = async (userData) => {
    try {
       console.log("Enviando dados:", JSON.stringify(userData)); // Verifique os dados que está enviando
       const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
       });
       const data = await response.json();
       console.log("Resposta do servidor:", data); // Verifique a resposta
       return data;
    } catch (error) {
       console.error("Erro ao registrar usuário:", error);
       throw error;
    }
 };
 
  

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    console.log("Status da resposta:", response.status);

    return await response.json();
  } catch (error) {
    console.error("Erro ao conectar ao backend:", error);
    return { message: "Erro ao conectar ao servidor" };
  }
};

import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Para o AsyncStorage
import { style } from "./style"; // Assumindo que o estilo está aqui

export default function ReelsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado para controlar o modo escuro

  // Carregar o tema escuro da AsyncStorage ao iniciar o aplicativo
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      // Se não houver valor salvo, o tema é claro por padrão
      setIsDarkMode(storedTheme === "true"); 
    };
    loadTheme();
  }, []);

  // Alternar entre o modo claro e escuro
  const toggleDarkMode = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem("darkMode", newTheme.toString()); // Salva a preferência no AsyncStorage
  };

  // Definir fundo e cor do texto baseado no modo escuro
  const backgroundColor = isDarkMode ? "black" : "white";
  const textColor = isDarkMode ? "white" : "black";

  return (
    <View style={[style.container, { backgroundColor }]}>
      <Text style={{ color: textColor }}>Reels em breve</Text>
    </View>
  );
}

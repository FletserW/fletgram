import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SecurityScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar o tema escuro da AsyncStorage ao iniciar o aplicativo
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#181818" : "white" }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
          <ArrowLeft size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? "white" : "black" }]}>Senha e segurança</Text>
      </View>

      <View style={styles.separatorContainer}>
        <View style={styles.separator} />
      </View>

      {/* Seção de Login e Recuperação */}
      <Text style={[styles.sectionTitle, { color: isDarkMode ? "white" : "black" }]}>Login e recuperação</Text>
      <Text style={[styles.sectionDescription, { color: isDarkMode ? "#d1d1d1" : "#6b7280" }]}>
        Gerencie suas senhas, preferências de login e métodos de recuperação.
      </Text>
      <View style={[styles.card, { backgroundColor: isDarkMode ? "#333333" : "#e8e8e8" }]}>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Alterar senha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Autenticação de dois fatores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Login salvo</Text>
        </TouchableOpacity>
      </View>

      {/* Seção de Verificações de Segurança */}
      <Text style={[styles.sectionTitle, { color: isDarkMode ? "white" : "black" }]}>Verificações de segurança</Text>
      <Text style={[styles.sectionDescription, { color: isDarkMode ? "#d1d1d1" : "#6b7280" }]}>
        Execute verificações em apps, dispositivos e emails enviados para analisar os problemas de segurança.
      </Text>
      <View style={[styles.card, { backgroundColor: isDarkMode ? "#333333" : "#e8e8e8" }]}>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Onde você fez login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Alertas de login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Validar emails</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemText, { color: isDarkMode ? "white" : "black" }]}>Validar telefone</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 20,
  },
  sectionDescription: {
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  cardItemText: {
    fontSize: 16,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "gray",
  },
});

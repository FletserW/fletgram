import React, { useState, useEffect } from "react"; 
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from "react-native";
import { Shield, FileUser, Bookmark, Clock, Lock, Users, Layers, Bell, EyeOff, MessageSquare, AtSign, Archive, UserX, ChevronLeft } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";

const handleLogout = async (navigation: any) => {
  try {
    console.log("Sair");
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("id");
    navigation.navigate("Home"); // Navegar para a tela "Home"
  } catch (error) {
    console.error("Erro ao fazer logout", error);
  }
};

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem("darkMode", newTheme.toString());
  };

  const options = [
    { title: "Salvo", icon: Bookmark },
    { title: "Arquivar", icon: Archive },
    { title: "Sua atividade", icon: Layers },
    { title: "Notificações", icon: Bell },
    { title: "Gerenciamento de tempo", icon: Clock },
  ];

  const privacyOptions = [
    { title: "Privacidade da conta", icon: Lock, rightText: "Público" },
    { title: "Amigos Próximos", icon: Users, rightText: "0" },
    { title: "Publicação cruzada", icon: Layers },
    { title: "Bloqueados", icon: UserX, rightText: "0" },
    { title: "Ocultar story e transmissão ao vivo", icon: EyeOff },
  ];

  const personalDataOptions = [
    { title: "Senha e segurança", icon: Shield, onPress: () => navigation.navigate("SecurityScreen") },
    { title: "Dados pessoais", icon: FileUser, onPress: () => navigation.navigate("PersonalDataScreen") },
  ];

  const interactionOptions = [
    { title: "Mensagens e respostas ao story", icon: MessageSquare },
    { title: "Marcações e menções", icon: AtSign },
  ];

  const authOptions = [
    { title: "Adicionar conta" },
    { title: "Sair", onPress: () => handleLogout(navigation) },  
    { title: "Desconectar todas as contas" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
        <TouchableOpacity onPress={() => navigation.navigate("tabs")}>
          <ChevronLeft size={28} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Configurações e atividade</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Toggle de Modo Escuro */}
        <View style={[styles.toggleContainer, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
          <Text style={[styles.toggleText, { color: isDarkMode ? '#fff' : '#000' }]}>Modo Escuro</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
          />
        </View>

        {/* Como você usa o Instagram */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#6b7280' }]}>Como você usa o Instagram</Text>
        {options.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.optionItem, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
            <item.icon size={20} color={isDarkMode ? '#fff' : '#000'} style={styles.icon} />
            <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        {/* Quem pode ver seu conteúdo */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#6b7280' }]}>Quem pode ver seu conteúdo</Text>
        {privacyOptions.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.optionItem, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
            <item.icon size={20} color={isDarkMode ? '#fff' : '#000'} style={styles.icon} />
            <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.title}</Text>
            {item.rightText && <Text style={[styles.rightText, { color: isDarkMode ? '#fff' : '#6b7280' }]}>{item.rightText}</Text>}
          </TouchableOpacity>
        ))}

        {/* Segurança */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#6b7280' }]}>Controle de informação</Text>
        {personalDataOptions.map((item, index) => (
          <TouchableOpacity key={index} onPress={item.onPress} style={[styles.optionItem, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
            <item.icon size={20} color={isDarkMode ? '#fff' : '#000'} style={styles.icon} />
            <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        {/* Como outras pessoas podem interagir */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#6b7280' }]}>Como outras pessoas podem interagir com você</Text>
        {interactionOptions.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.optionItem, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
            <item.icon size={20} color={isDarkMode ? '#fff' : '#000'} style={styles.icon} />
            <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        {/* Entrar */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#6b7280' }]}>Entrar</Text>
        {authOptions.map((item, index) => (
          <TouchableOpacity key={index} onPress={item.onPress} style={[styles.optionItem, { borderBottomColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
            <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 24,
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  rightText: {
    fontSize: 14,
  },
});
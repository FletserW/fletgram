import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config"; 
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
export default function PersonalDataScreen() {

  const [userData, setUserData] = useState({
    email: "",
    phone: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado para o modo escuro
  const navigation = useNavigation<NavigationProps>();

  // Carregar preferências de tema
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
  }, []);

  // Função para buscar dados do usuário usando fetch
  const fetchUserData = async () => {
    try {
      const id = await AsyncStorage.getItem("id");

      if (id) {
        const response = await fetch(`${BASE_URL}/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData({
            email: data.email,
            phone: data.phone,
            date_of_birth: data.date_of_birth,
          });
        } else {
          console.error('Erro ao buscar dados do usuário:', response.status);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar os dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar os dados no banco de dados
  const saveUserData = async () => {
    setIsSaving(true);
    try {
      const id = await AsyncStorage.getItem("id");

      if (id) {
        const response = await fetch(`${BASE_URL}/users/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          console.error('Erro ao salvar dados do usuário:', response.status);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar os dados do usuário:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Monitorar as mudanças nos dados e salvar automaticamente
  useEffect(() => {
    if (userData.email || userData.phone || userData.date_of_birth) {
      saveUserData();
    }
  }, [userData]);

  // Carregar os dados ao montar o componente
  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
        <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
          <ArrowLeft size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Dados pessoais</Text>
      </View>

      <View style={[styles.separatorContainer, { backgroundColor: isDarkMode ? "#fff" : "#ccc" }]}>
        <View style={[styles.separator, { backgroundColor: isDarkMode ? "#fff" : "#ccc" }]} />
      </View>

      {/* Descrição */}
      <Text style={[styles.description, { color: isDarkMode ? "#bbb" : "#4B5563" }]}>
        A FletserTech usa estas informações para verificar sua identidade e manter nossa comunidade segura. Você decide quais dados pessoais ficarão visíveis para os outros.
      </Text>

      {/* Seção de Informações */}
      <View style={[styles.card, { backgroundColor: isDarkMode ? "#333" : "#F9FAFB" }]}>
        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemLabel, { color: isDarkMode ? "#bbb" : "#6B7280" }]}>Email</Text>
          <TextInput
            style={[styles.inputField, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#444" : "#E5E7EB" }]}
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemLabel, { color: isDarkMode ? "#bbb" : "#6B7280" }]}>Telefone</Text>
          <TextInput
            style={[styles.inputField, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#444" : "#E5E7EB" }]}
            value={userData.phone}
            onChangeText={(text) => setUserData({ ...userData, phone: text })}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemLabel, { color: isDarkMode ? "#bbb" : "#6B7280" }]}>Data de nascimento</Text>
          <TextInput
            style={[styles.inputField, { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#444" : "#E5E7EB" }]}
            value={userData.date_of_birth}
            onChangeText={(text) => setUserData({ ...userData, date_of_birth: text })}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardItem}>
          <Text style={[styles.cardItemLabel, { color: isDarkMode ? "#bbb" : "#6B7280" }]}>Propriedade e controle da conta</Text>
          <Text style={[styles.cardItemValue, { color: isDarkMode ? "#bbb" : "#000" }]}>
            Gerencie seus dados, modifique o contato herdeiro, desative ou exclua suas contas e perfis.
          </Text>
        </TouchableOpacity>
      </View>

      {isSaving && <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>Salvando...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 8,
  },
  cardItemLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardItemValue: {
    fontSize: 14,
    color: "black",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separator: {
    flex: 1,
    height: 1,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
});

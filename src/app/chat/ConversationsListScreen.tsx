import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Button,
} from "react-native";
import { BASE_URL } from "../../constants/config";
import { ChevronLeft, User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // Para usar o navigate

const ConversationsListScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [conversations, setConversations] = useState([]);
  const [userProfilePictures, setUserProfilePictures] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [following, setFollowing] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchFollowing, setSearchFollowing] = useState("");

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchFollowing();
  }, [userId]);

  useEffect(() => {
    conversations.forEach((item) => {
      const otherUsername = item.name;
      if (
        otherUsername &&
        !userProfilePictures[item.id] &&
        !loadingImages[item.id]
      ) {
        fetchProfilePicture(otherUsername, item.id); // Passa o ID para o controle de loading
      }
    });
  }, [conversations]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/conversations/user/${userId}`);
      const data = await response.json();

      // Buscar a quantidade de participantes para cada conversa
      for (const conversation of data) {
        const participantCountResponse = await fetch(
          `${BASE_URL}/conversations/${conversation.id}/participantCount`
        );
        const participantCount = await participantCountResponse.json();

        // Atualiza o campo participantCount na conversa
        conversation.participantCount = participantCount;
      }

      setConversations(data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as conversas.");
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${BASE_URL}/followers/${userId}/following`);
      const data = await response.json();

      console.log("Following data:", data); // Verifique a estrutura dos dados

      // Agora, precisamos buscar os usernames e as imagens de perfil de cada pessoa que o usuário segue
      const followingWithUsernamesAndProfilePics = await Promise.all(
        data.map(async (follow) => {
          const userResponse = await fetch(
            `${BASE_URL}/users/${follow.userId}`
          );
          const userData = await userResponse.json();

          // Buscar a imagem de perfil
          const profilePictureResponse = await fetch(
            `${BASE_URL}/users/${follow.userId}/profilePicture`
          );
          const profilePictureData = await profilePictureResponse.json();

          // Adiciona o username e a imagem de perfil ao objeto
          return {
            ...follow,
            username: userData.username, // Adiciona o username
            profile_picture:
              profilePictureData.profile_picture ||
              "https://via.placeholder.com/50", // Adiciona a foto do perfil, com uma imagem padrão se não houver
          };
        })
      );

      // Armazenar os detalhes completos das pessoas seguidas
      setFollowing(followingWithUsernamesAndProfilePics);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os usuários seguidos.");
    }
  };

  const fetchProfilePicture = async (otherUsername, conversationId) => {
    if (!userProfilePictures[conversationId]) {
      setLoadingImages((prev) => ({ ...prev, [conversationId]: true }));
      const userIdResponse = await fetch(
        `${BASE_URL}/users/username/${otherUsername}/id`
      );
      const userIdData = await userIdResponse.json();
      const otherUserId = userIdData.id;

      const profileResponse = await fetch(
        `${BASE_URL}/users/${otherUserId}/profilePicture`
      );
      const profileData = await profileResponse.json();

      if (profileData && profileData.profile_picture) {
        let profilePictureUrl = profileData.profile_picture;
        const cacheBusterUrl = `${profilePictureUrl}?t=${new Date().getTime()}`;

        setUserProfilePictures((prevState) => ({
          ...prevState,
          [conversationId]: cacheBusterUrl,
        }));
        setLoadingImages((prev) => ({ ...prev, [conversationId]: false }));
      }
    }
  };

  const openConversation = (conversationId) => {
    navigation.navigate("ChatScreen", { conversationId, userId });
  };

  // Função para voltar para a tela anterior
  const goBack = () => {
    navigation.goBack();
  };

  // Filtra as conversas com base na pesquisa
  const filteredConversations = conversations.filter((item) => {
    const name = item.username || ""; // Se name for null ou undefined, substitui por uma string vazia
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`);
      const userData = await response.json();

      // Acessando o username
      const username = userData.username;
      console.log("Username:", username);

      // Faça o que precisar com o username, como salvar em um estado ou exibir
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Barra de título */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={goBack}>
          <ChevronLeft size={28} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}
        >
          Mensagens
        </Text>
      </View>

      {/* Campo de pesquisa com o ícone ao lado */}
      <View
        style={[
          styles.searchContainer,
          isDarkMode && styles.darkSearchContainer,
        ]}
      >
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Buscar usuário"
          placeholderTextColor={isDarkMode ? "#bbb" : "#888"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Ícone de Lucide ao lado do campo de pesquisa */}
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <User size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      {/* Modal com a lista de pessoas que o usuário segue */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContainer,
              isDarkMode && styles.darkModalContainer,
            ]}
          >
            <Text
              style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}
            >
              Pessoas que sigo
            </Text>
            <View
              style={[
                styles.searchContainer,
                isDarkMode && styles.darkSearchContainer,
              ]}
            >
              <TextInput
                style={[
                  styles.searchInput,
                  isDarkMode && styles.darkSearchInput,
                ]}
                placeholder="Buscar usuário seguido"
                placeholderTextColor={isDarkMode ? "#bbb" : "#888"}
                value={searchFollowing}
                onChangeText={setSearchFollowing} // Atualiza o estado conforme o usuário digita
              />
            </View>

            <ScrollView style={styles.modalList}>
              {following
                .filter((user) =>
                  user.username
                    .toLowerCase()
                    .includes(searchFollowing.toLowerCase())
                )
                .map((user) => (
                  <View key={user.userId} style={styles.modalItem}>
                    <Image
                      source={{
                        uri: user.profile_picture,
                      }}
                      style={styles.modalProfilePicture}
                    />
                    <Text
                      style={[
                        styles.modalItemName,
                        isDarkMode && styles.darkModalItemName,
                      ]}
                    >
                      {user.username || "Sem Nome"}
                    </Text>
                  </View>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: "#9d3520" }, // Cor de fundo
              ]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView>
        {isLoading ? (
          <Text
            style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}
          >
            Carregando...
          </Text>
        ) : (
          filteredConversations.map((item) => {
            const profilePictureUrl = userProfilePictures[item.id] || "";

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.conversationItem,
                  isDarkMode && styles.darkConversationItem,
                ]}
                onPress={() => openConversation(item.id)}
              >
                <View
                  style={[
                    styles.conversationHeader,
                    isDarkMode && styles.darkConversationHeader,
                  ]}
                >
                  {loadingImages[item.id] ? (
                    <View style={styles.profilePicturePlaceholder} />
                  ) : (
                    <Image
                      key={item.id}
                      source={{
                        uri:
                          profilePictureUrl || "https://via.placeholder.com/50",
                      }}
                      style={styles.profilePicture}
                      resizeMode="cover"
                    />
                  )}
                  <Text
                    style={[
                      styles.conversationName,
                      isDarkMode && styles.darkConversationName,
                    ]}
                  >
                    {item.name || "Sem Nome"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.conversationDetails,
                    isDarkMode && styles.darkConversationDetails,
                  ]}
                >
                  Participantes: {item.participantCount} pessoas
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Cor do fundo no modo claro
  },
  darkContainer: {
    backgroundColor: "#121212", // Cor do fundo no modo escuro
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40, // Ajuste para o status bar
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff", // Cor do fundo no modo claro
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  darkHeader: {
    backgroundColor: "#333", // Cor do fundo no modo escuro
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#000", // Cor do texto no modo claro
  },
  darkHeaderTitle: {
    color: "#fff", // Cor do texto no modo escuro
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row", // Alinha os elementos na horizontal
    alignItems: "center", // Alinha os itens verticalmente
    backgroundColor: "#f8f8f8", // Cor de fundo da barra de pesquisa no modo claro
  },
  darkSearchContainer: {
    backgroundColor: "#333", // Cor de fundo da barra de pesquisa no modo escuro
  },
  searchInput: {
    flex: 1, // Faz o campo de pesquisa ocupar o espaço disponível
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff", // Cor de fundo do campo de input no modo claro
  },
  darkSearchInput: {
    backgroundColor: "#444", // Cor de fundo do campo de input no modo escuro
    color: "#fff", // Cor do texto no input no modo escuro
  },
  openModalButton: {
    padding: 10,
    backgroundColor: "#007bff", // Cor do botão no modo claro
    borderRadius: 5,
    marginVertical: 10,
  },
  darkOpenModalButton: {
    backgroundColor: "#6200ea", // Cor do botão no modo escuro
  },
  openModalButtonText: {
    color: "#fff", // Cor do texto no botão no modo claro
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff", // Cor de fundo do modal no modo claro
    borderRadius: 10,
  },
  darkModalContainer: {
    backgroundColor: "#444", // Cor de fundo do modal no modo escuro
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000", // Cor do título do modal no modo claro
  },
  darkModalTitle: {
    color: "#fff", // Cor do título do modal no modo escuro
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalProfilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  modalItemName: {
    fontSize: 16,
    color: "#000", // Cor do nome no modo claro
  },
  darkModalItemName: {
    color: "#fff", // Cor do nome no modo escuro
  },
  conversationItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  darkConversationItem: {
    borderColor: "#444", // Cor da borda no modo escuro
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  darkConversationHeader: {
    backgroundColor: "#333", // Cor do cabeçalho da conversa no modo escuro
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  conversationName: {
    fontSize: 18,
    color: "#000", // Cor do nome da conversa no modo claro
  },
  darkConversationName: {
    color: "#fff", // Cor do nome da conversa no modo escuro
  },
  conversationDetails: {
    fontSize: 14,
    color: "#777", // Cor do texto dos detalhes da conversa no modo claro
  },
  darkConversationDetails: {
    color: "#bbb", // Cor do texto dos detalhes da conversa no modo escuro
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
  darkLoadingText: {
    color: "#fff", // Cor do texto de "Carregando..." no modo escuro
  },
  closeButton: {
    backgroundColor: "#9d3520", // Cor do botão
    borderRadius: 5, // Bordas arredondadas
    paddingVertical: 10, // Espaçamento vertical
    paddingHorizontal: 15, // Espaçamento horizontal
    alignItems: "center", // Alinha o texto no centro
    justifyContent: "center", // Garante que o texto fique centralizado
    marginTop: 20, // Espaço superior
  },
  closeButtonText: {
    color: "#fff", // Cor do texto
    fontSize: 16, // Tamanho da fonte
    fontWeight: "bold", // Peso da fonte
  },
});

export default ConversationsListScreen;

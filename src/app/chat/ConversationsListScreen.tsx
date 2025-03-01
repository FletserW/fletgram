import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { BASE_URL } from "../../constants/config";
import { ChevronLeft, User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // Para usar o navigate
import Header from "../../components/ui/conversations/Header";
import SearchBar from "../../components/ui/conversations/SearchBar";
import ModalComponent from "../../components/ui/conversations/ModelComponent";
import ConversationsList from "../../components/ui/conversations/ConversationsList";

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
  const [otherUserId, setOtherUserId] = useState("");

  useEffect(() => {
    loadTheme();
    fetchConversations();
    fetchFollowing();
  }, [userId]);

  useEffect(() => {
    fetchProfilePictures();
  }, [conversations]);

  const loadTheme = async () => {
    const storedTheme = await AsyncStorage.getItem("darkMode");
    setIsDarkMode(storedTheme === "true");
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/conversations/user/${userId}`);
      const data = await response.json();
      await updateParticipantCount(data);

      // Atualizando as conversas para nome e foto de perfil do outro usuário
      for (let conversation of data) {
        // Se não for grupo, renomear com o nome do outro usuário
        if (!conversation.group) {
          const otherUserId = await fetchOtherUser(conversation.id, userId);
          const otherUserDetails = await fetchUserDetails(otherUserId);
          conversation.name = otherUserDetails.username;
          conversation.profilePicture = await fetchProfilePicture(otherUserId);
        }
      }

      setConversations(data);
      setIsLoading(false);
    } catch (error) {
      handleFetchError("Não foi possível carregar as conversas.");
    }
  };

  // Função para atualizar o número de participantes de cada conversa
  const updateParticipantCount = async (data) => {
    for (const conversation of data) {
      const participantCountResponse = await fetch(
        `${BASE_URL}/conversations/${conversation.id}/participantCount`
      ); // Busca a quantidade de participantes da conversa
      const participantCount = await participantCountResponse.json(); // Converte a resposta em JSON
      conversation.participantCount = participantCount; // Atualiza a conversa com o número de participantes

      // Obtém o 'otherUser' da conversa (não o usuário atual)
      await fetchOtherUser(conversation, userId); // Chama a função para buscar o outro usuário
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${BASE_URL}/followers/${userId}/following`);
      const data = await response.json();
      const followingWithDetails = await getFollowingDetails(data);
      setFollowing(followingWithDetails);
    } catch (error) {
      handleFetchError("Não foi possível carregar os usuários seguidos.");
    }
  };

  const getFollowingDetails = async (data) => {
    return Promise.all(
      data.map(async (follow) => {
        const user = await fetchUserDetails(follow.userId);
        const profilePicture = await fetchProfilePicture(follow.userId);
        return { ...follow, ...user, profile_picture: profilePicture };
      })
    );
  };

  const fetchUserDetails = async (userId) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    const data = await response.json();
    return { username: data.username };
  };

  const fetchProfilePicture = async (userId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${userId}/profilePicture`
      );

      if (!response.ok) {
        throw new Error(
          `Erro na resposta: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return (
        data.profile_picture || "https://fletgram.loca.lt/uploads/profile.png"
      );
    } catch (error) {
      console.error("Erro ao buscar foto de perfil:", error);
      return "https://fletgram.loca.lt/uploads/profile.png"; // Foto padrão
    }
  };

  const fetchProfilePictures = () => {
    conversations.forEach((item) => {
      const otherUsername = item.name;
      //console.log("otherUsername: ", otherUsername);
      if (
        otherUsername &&
        !userProfilePictures[item.id] &&
        !loadingImages[item.id]
      ) {
        fetchProfilePictureByUsername(otherUsername, item.id);
      }
    });
  };

  const fetchProfilePictureByUsername = async (
    otherUsername,
    conversationId
  ) => {
    if (!userProfilePictures[conversationId]) {
      setLoadingImages((prev) => ({ ...prev, [conversationId]: true }));
      const userId = await getUserIdByUsername(otherUsername);
      const profilePictureUrl = await getProfilePictureUrl(userId);

      updateProfilePictures(conversationId, profilePictureUrl);
    }
  };

  const getUserIdByUsername = async (otherUsername) => {
    const response = await fetch(
      `${BASE_URL}/users/username/${otherUsername}/id`
    );
    const data = await response.json();
    return data.id;
  };

  const getProfilePictureUrl = async (userId) => {
    const response = await fetch(`${BASE_URL}/users/${userId}/profilePicture`);
    const data = await response.json();
    return data.profile_picture;
  };

  const updateProfilePictures = (conversationId, profilePictureUrl) => {
    setUserProfilePictures((prevState) => ({
      ...prevState,
      [conversationId]: profilePictureUrl,
    }));
    setLoadingImages((prev) => ({ ...prev, [conversationId]: false }));
  };

  const handleFetchError = (message) => {
    console.error(message);
    Alert.alert("Erro", message);
  };

  const openConversation = (conversationId) => {
    navigation.navigate("ChatScreen", { conversationId, userId });
  };

  const goBack = () => {
    navigation.goBack();
  };

  const filteredConversations = conversations.filter((item) =>
    (item.name?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
  );

  const fetchOtherUser = async (conversationId, userId) => {
    try {
      // Exibe a URL e os dados enviados
      console.log(
        `Buscando participantes na conversa com ID: ${conversationId}`
      );

      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/participantIds`
      );

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(
          `Erro ao buscar participantes. Status: ${response.status}`
        );
      }

      // Tenta parsear a resposta como texto
      const text = await response.text();
      console.log("Resposta de participantes:", text); // Veja a resposta raw

      let participantIds;
      try {
        // Se a resposta for válida, converta-a em JSON
        participantIds = JSON.parse(text);
      } catch (jsonError) {
        throw new Error(
          "Erro ao parsear a resposta JSON: " + jsonError.message
        );
      }

      console.log("IDs dos participantes:", participantIds);

      // Filtra o ID do usuário atual
      const filteredParticipants = participantIds.filter(
        (id) => Number(id) !== Number(userId)
      );

      console.log("IDs dos participantes filtrados:", filteredParticipants);

      if (filteredParticipants.length > 0) {
        const otherUserId = filteredParticipants[0];
        console.log("ID do outro usuário encontrado:", otherUserId);
        setOtherUserId(otherUserId);
        return otherUserId;
      } else {
        console.log("Não foi possível encontrar o outro usuário.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar o outro usuário:", error);
      return null;
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header goBack={goBack} isDarkMode={isDarkMode} />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        setIsModalVisible={setIsModalVisible}
      />
      <ModalComponent
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        following={following}
        searchFollowing={searchFollowing}
        setSearchFollowing={setSearchFollowing}
        isDarkMode={isDarkMode}
        userId={userId}
      />
      <ConversationsList
        isLoading={isLoading}
        filteredConversations={filteredConversations}
        openConversation={openConversation}
        isDarkMode={isDarkMode}
        userProfilePictures={userProfilePictures}
        loadingImages={loadingImages}
      />
    </View>
  );
};

export const styles = StyleSheet.create({
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
  selectedItem: {
    backgroundColor: "#d3f4d7", // Cor de fundo para itens selecionados
  },
  createButton: {
    backgroundColor: "#4CAF50", // Cor de fundo verde
    paddingVertical: 12, // Padding vertical para aumentar a altura do botão
    paddingHorizontal: 20, // Padding horizontal para aumentar a largura do botão
    borderRadius: 8, // Bordas arredondadas
    marginTop: 15, // Distância do topo para dar espaçamento
    alignItems: "center", // Alinha o conteúdo (texto) no centro
    justifyContent: "center", // Alinha o conteúdo verticalmente no centro
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 0.2, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Sombra para dispositivos Android
  },

  // Estilo do texto dentro do botão
  createButtonText: {
    color: "#fff", // Cor do texto (branco)
    fontSize: 16, // Tamanho da fonte
    fontWeight: "bold", // Deixa o texto em negrito
    textTransform: "uppercase", // Transforma o texto em maiúsculas
  },
});

export default ConversationsListScreen;

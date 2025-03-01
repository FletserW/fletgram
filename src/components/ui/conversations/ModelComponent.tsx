import React, { FC, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { styles } from "../../../app/chat/ConversationsListScreen";
import { BASE_URL } from "../../../constants/config";

interface ModalComponentProps {
  isDarkMode: boolean;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  following: any[];
  searchFollowing: string;
  setSearchFollowing: (query: string) => void;
  userId: string;
}

const ModalComponent: FC<ModalComponentProps> = ({
  isModalVisible,
  setIsModalVisible,
  following,
  searchFollowing,
  setSearchFollowing,
  isDarkMode,
  userId,
}) => {
  // Estado para armazenar os IDs dos usuários selecionados
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set()
  );

  // Função chamada quando um usuário é selecionado ou desmarcado
  const handleUserSelection = (selectedUserId: number) => {
    const newSelectedUserIds = new Set(selectedUserIds);
    if (newSelectedUserIds.has(selectedUserId)) {
      newSelectedUserIds.delete(selectedUserId); // Remove o usuário se já estiver selecionado
    } else {
      newSelectedUserIds.add(selectedUserId); // Adiciona o usuário se não estiver selecionado
    }
    setSelectedUserIds(newSelectedUserIds);
  };

  // Função para criar a conversa
  const handleCreateConversation = async () => {
    // Verifica se ao menos um usuário foi selecionado
    if (selectedUserIds.size < 1) {
      alert("Selecione ao menos um usuário.");
      return;
    }

    // Prepara os IDs dos usuários para enviar para a API
    const userIdsArray = Array.from(selectedUserIds);
    userIdsArray.push(parseInt(userId)); // Inclui o ID do usuário atual

    try {
      // Chama o endpoint para criar a conversa usando fetch
      const response = await fetch(`${BASE_URL}/conversations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userIdsArray), // Envia os IDs como um array no corpo da requisição
      });

      if (!response.ok) {
        throw new Error("Erro ao criar a conversa.");
      }

      const data = await response.json();
      console.log("Conversa criada com sucesso:", data);
      setIsModalVisible(false); // Fecha o modal após criar a conversa
    } catch (error) {
      console.error("Erro ao criar a conversa:", error);
      alert("Houve um erro ao criar a conversa.");
    }
  };

  return (
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
              style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
              placeholder="Buscar usuário seguido"
              placeholderTextColor={isDarkMode ? "#bbb" : "#888"}
              value={searchFollowing}
              onChangeText={setSearchFollowing}
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
                <TouchableOpacity
                  key={user.userId} // Usar user.userId como key
                  onPress={() => handleUserSelection(user.userId)}
                  style={[
                    styles.modalItem,
                    selectedUserIds.has(user.userId)
                      ? styles.selectedItem // Altera o estilo se o item estiver selecionado
                      : null,
                  ]}
                >
                  <Image
                    source={{ uri: user.profile_picture }}
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
                </TouchableOpacity>
              ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: "#4CAF50" }]}
            onPress={handleCreateConversation}
          >
            <Text style={styles.createButtonText}>Criar Conversa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: "#9d3520" }]}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalComponent;

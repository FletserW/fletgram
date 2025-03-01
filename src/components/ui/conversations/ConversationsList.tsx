import React, { FC } from "react";
import { ScrollView, TouchableOpacity, View, Image, Text } from "react-native";
import { styles } from "../../../app/chat/ConversationsListScreen";

interface ConversationsListProps {
  isLoading: boolean; // Booleano que indica se as conversas estão carregando
  filteredConversations: Array<{
    // Array de objetos representando as conversas filtradas
    id: string; // ID da conversa
    name: string; // Nome da conversa
    participantCount: number; // Número de participantes
    username: string; // Nome de usuário associado à conversa
  }>;
  openConversation: (conversationId: string) => void; // Função para abrir uma conversa
  isDarkMode: boolean; // Booleano que indica se o modo escuro está ativado
  userProfilePictures: Record<string, string>; // Mapeamento de IDs de conversa para URLs de imagens de perfil
  loadingImages: Record<string, boolean>; // Mapeamento de IDs de conversa para estado de carregamento de imagens
}

const ConversationsList: FC<ConversationsListProps> = ({
  isLoading,
  filteredConversations,
  openConversation,
  isDarkMode,
  userProfilePictures,
  loadingImages,
}) => (
  <ScrollView>
    {isLoading ? (
      <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
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
                    uri: profilePictureUrl || "https://via.placeholder.com/50",
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
);
export default ConversationsList;

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { BASE_URL } from "../../constants/config";

const ConversationsListScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [conversations, setConversations] = useState([]);
  const [userProfilePictures, setUserProfilePictures] = useState({});

  useEffect(() => {
    fetchConversations();
    console.log("UserID: ", userId); // Verificar se o userId está correto
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/conversations/user/${userId}`);
      const data = await response.json();
      console.log("Conversations Data: ", data);

      setConversations(data);

      // Processar cada conversa
      data.forEach(async (item) => {
        if (!item.isGroup) {
          // Passo 1: Obter o userId a partir do username (item.name)
          const username = item.name;
          const userResponse = await fetch(`${BASE_URL}/users/${username}/id`);
          const userData = await userResponse.json();
          
          if (userData && userData.userId) {
            const otherUserId = userData.userId;
            console.log("ID do outro usuário: ", otherUserId);

            // Passo 2: Requisição para pegar a imagem de perfil do outro usuário
            const profileResponse = await fetch(`${BASE_URL}/users/${otherUserId}/profilePicture`);
            const profileData = await profileResponse.json();

            if (profileData && profileData.profile_picture) {
              const profilePictureUrl = `${profileData.profile_picture}?cache_bust=${new Date().getTime()}`;

              // Atualizando o estado com a imagem de perfil do usuário
              setUserProfilePictures((prev) => ({
                ...prev,
                [otherUserId]: profilePictureUrl, // Usando o userId do outro usuário
              }));
            } else {
              console.log(`Imagem de perfil não encontrada para o usuário ${otherUserId}`);
            }
          } else {
            console.log(`Não foi possível encontrar o userId para o username: ${username}`);
          }
        }
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar as conversas.');
    }
  };

  const openConversation = (conversationId) => {
    navigation.navigate('ChatScreen', {
      conversationId,
      userId,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversas</Text>
      <ScrollView>
        {conversations.map((item) => {
          // Obter a URL da imagem de perfil usando o userId
          const profilePictureUrl = userProfilePictures[item.name] || ''; // Usar o nome (username) para o userId

          console.log("userProfilePictures[item.name]: ", userProfilePictures[item.name]); // Verificar a URL da imagem

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.conversationItem}
              onPress={() => openConversation(item.id)}
            >
              <View style={styles.conversationHeader}>
              <Image
                    source={{ uri: profilePictureUrl }}
                    style={styles.profilePicture}
                  />
                <Text style={styles.conversationName}>{item.name || 'Sem Nome'}</Text>
              </View>
              <Text style={styles.conversationDetails}>Participantes: {item.participantCount} pessoas</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  conversationItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  conversationName: {
    fontSize: 18,
  },
  conversationDetails: {
    fontSize: 14,
    color: '#777',
  },
});

export default ConversationsListScreen;

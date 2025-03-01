import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/config";

const ChatScreen = ({ route }) => {
  const { conversationId, userId, userName } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [username, setUsername] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [media, setMedia] = useState(null);

  useEffect(() => {
    fetchMessages();
    console.log("conversation: ", conversationId);
    fetchUser();
    fetchImageUrl();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/messages/conversation/${conversationId}`
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/participantIds`
      );
      const participantIds = await response.json();
      console.log("usersId: ", participantIds); // Mostra a lista de IDs

      // Converter userId para número (caso ele seja uma string)
      const userIdAsNumber = Number(userId);

      // Aqui, garantimos que o 'otherUserId' não seja o 'userId'
      const otherUserId = participantIds.find((id) => id !== userIdAsNumber);

      if (otherUserId) {
        console.log("O outro usuário da conversa é:", otherUserId);
        // Aqui você pode setar o otherUserId no estado, se necessário
        setOtherUserId(otherUserId);
      } else {
        console.log("Não foi possível encontrar o outro usuário.");
      }
      try {
        const response = await fetch(`${BASE_URL}/users/${otherUserId}`);
        const data = await response.json();
        console.log("data: ", data.username);
        setUsername(data.username);
        setOtherUserId(data.id);
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
      }
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
    }
  };

  // Enviar nova mensagem
  const sendMessage = async () => {
    if (!messageText) return; // Não enviar mensagem vazia

    const messageData = {
      conversationId,
      senderId: userId,
      messageText,
      mediaUrl: media ? media.url : null,
      mediaType: media ? media.type : null,
    };

    try {
      const response = await fetch(`${BASE_URL}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      const message = await response.json();
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessageText("");
      setMedia(null); // Limpar media após o envio
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    }
  };

  const fetchImageUrl = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${otherUserId}/profilePicture`
      );
      const data = await response.json();
      // Acessando a URL da imagem
      setImageUrl(data.profile_picture);
      console.log("imageUrl: ", imageUrl);
    } catch (error) {
      console.error(error);
    }
  };

  // Função para fazer o upload de mídia
  const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/messages/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setMedia({
        url: data.url,
        type: file.type,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao enviar o arquivo.");
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image
          source={{
            uri: imageUrl,
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 15,
            marginLeft: 10,
          }}
        />
        <Text style={styles.username}>{username}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === userId
                ? styles.userMessage
                : styles.otherMessage,
            ]}
          >
            {item.senderId !== userId && (
              <Image
                source={{
                  uri: `${BASE_URL}/uploads/${item.sender.profilePicture}`,
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  marginRight: 5,
                }}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                item.senderId === userId
                  ? styles.userBubble
                  : styles.otherBubble,
              ]}
            >
              <Text style={styles.messageText}>{item.messageText}</Text>
            </View>
          </View>
        )}
      />

      {/* Campo de mensagem */}
      <View style={styles.inputContainer}>
        <TouchableOpacity>
          <FontAwesome name="camera" size={24} color="red" />
        </TouchableOpacity>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Mensagem..."
          style={styles.input}
        />
        <TouchableOpacity>
          <MaterialIcons name="photo" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="mic" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="emoji-emotions" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    padding: 10,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },
  username: {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
  },
  headerIcons: { flexDirection: "row", marginLeft: "auto" },
  messageContainer: { flexDirection: "row", alignItems: "center", margin: 10 },
  messageProfile: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  messageBubble: { padding: 10, borderRadius: 10 },
  userMessage: { flexDirection: "row-reverse" },
  otherMessage: { flexDirection: "row" },
  userBubble: { backgroundColor: "red", borderTopRightRadius: 0 },
  otherBubble: { backgroundColor: "gray", borderTopLeftRadius: 0 },
  messageText: { color: "white" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eee",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 20,
  },
});

export default ChatScreen;

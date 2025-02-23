import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { BASE_URL } from "../../constants/config";

const ChatScreen = ({ route }) => {
  const { conversationId, userId } = route.params; // Os parâmetros são passados pela navegação
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [media, setMedia] = useState(null);

  // Fetch das mensagens ao carregar a tela
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Função para buscar mensagens
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/messages/conversation/${conversationId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      const message = await response.json();
      setMessages(prevMessages => [...prevMessages, message]);
      setMessageText('');
      setMedia(null);  // Limpar media após o envio
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
    }
  };

  // Função para fazer o upload de mídia
  const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BASE_URL}/messages/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMedia({
        url: data.url,
        type: file.type,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao enviar o arquivo.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Lista de mensagens */}
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.sender.name}</Text>
            <Text>{item.messageText}</Text>
            {item.mediaUrl && <Image source={{ uri: item.mediaUrl }} style={{ width: 100, height: 100 }} />}
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />

      {/* Campo de texto para a mensagem */}
      <TextInput
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Digite uma mensagem..."
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      />

      {/* Botão de enviar mensagem */}
      <Button title="Enviar" onPress={sendMessage} />

      {/* Aqui você pode adicionar a funcionalidade de upload de imagem */}
      <TouchableOpacity >
        <Text>Upload de Mídia</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatScreen;

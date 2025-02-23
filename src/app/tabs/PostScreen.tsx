import React, { useState, useEffect } from "react";
import { View, Image, Alert, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { launchImageLibrary, MediaType, ImageLibraryOptions } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../../components/ui/Button";
import { ChevronLeft } from "lucide-react-native";
import { BASE_URL } from "../../constants/config";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
import ImagePicker from 'react-native-image-crop-picker'; 

const PostScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [images, setImages] = useState<string[]>([]);  // Armazena as imagens selecionadas
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
  }, []);

  // Função para selecionar múltiplas imagens
  const pickImages = async () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo" as MediaType,
      selectionLimit: 5, // Limite de 5 imagens
    };

    launchImageLibrary(options, (response) => {
      if (!response.didCancel && !response.errorMessage && response.assets) {
        // Verifique se há imagens e atualize o estado com as novas imagens
        const selectedImages = response.assets.map((asset) => asset.uri);
        setImages((prevImages) => [...prevImages, ...selectedImages]);  // Adiciona as novas imagens às anteriores
      }
    });
  }
  
  // Função para salvar as imagens no servidor
  const saveImagesToServer = async () => {
    if (images.length === 0) {
      Alert.alert("Erro", "Escolha pelo menos uma imagem.");
      return;
    }
  
    try {
      let userId = await AsyncStorage.getItem("id");
      if (!userId) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }
  
      let formData = new FormData();
  
      // Adicionar o userId como um campo do FormData
      formData.append("userId", userId);
  
      // Adicionar as imagens ao FormData
      images.forEach((imageUri, index) => {
        let filename = imageUri.split("/").pop();
        let type = `image/${filename.split(".").pop()}`;
  
        formData.append("files", {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      });
  
      const postResponse = await fetch(`${BASE_URL}/posts/`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error("Erro na criação do post: ", errorText);
        throw new Error("Erro ao criar o post.");
      }
  
      Alert.alert("Sucesso", "Post criado!");
      setImages([]); // Limpa as imagens após o envio
      navigation.dispatch(CommonActions.goBack()); // Retorna para a tela anterior
    } catch (error) {
      Alert.alert("Erro", "Algo deu errado.");
      console.error("Erro detalhado:", error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#f3f4f6' }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <ChevronLeft size={28} color={isDarkMode ? '#fff' : '#000'} />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
          Novo Post
        </Text>
      </View>

      {/* Exibição das imagens selecionadas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedImagesContainer}>
        {images.length > 0 && images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.selectedImage} />
        ))}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <Button
          buttonText="Escolher da galeria"
          onPress={pickImages}
          style={[styles.button, { backgroundColor: '#9d3520' }]}
        />
        <Button
          buttonText="Postar imagem"
          onPress={saveImagesToServer}
          disabled={images.length === 0}
          style={[styles.button, { backgroundColor: images.length > 0 ? '#dc2626' : '#9d3520' }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectedImagesContainer: {
    marginTop: 20,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default PostScreen;

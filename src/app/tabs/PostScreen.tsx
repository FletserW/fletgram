import React, { useState, useEffect } from "react";
import { View, Image, Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import { launchImageLibrary, MediaType, ImageLibraryOptions } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../../components/ui/Button";
import { ChevronLeft } from "lucide-react-native";
import { BASE_URL } from "../../constants/config";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";

const PostScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
  }, []);

  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo" as MediaType,
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 1,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("Usuário cancelou a seleção de imagem");
      } else if (response.errorMessage) {
        console.log("Erro ao selecionar imagem:", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setImage(uri);
      }
    });
  };

  const saveImageToServer = async () => {
    if (!image) {
      Alert.alert("Erro", "Escolha uma imagem antes de enviar.");
      return;
    }

    try {
      let userId = await AsyncStorage.getItem("id");
      if (!userId) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      let localUri = image;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename ?? "");
      let type = match ? `image/${match[1]}` : `image`;

      let formData = new FormData();
      formData.append("file", {
        uri: localUri,
        name: filename,
        type,
      } as any);

      const uploadResponse = await fetch(`${BASE_URL}/uploads/`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar a imagem.");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      console.log("Imagem salva:", imageUrl);

      const postResponse = await fetch(`${BASE_URL}/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `userId=${userId}&content=${encodeURIComponent(imageUrl)}`,
      });

      if (!postResponse.ok) {
        throw new Error("Erro ao criar o post.");
      }

      Alert.alert("Sucesso", "Post criado com sucesso!");
      setImage(null);

    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Algo deu errado.");
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

      {image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <Button
          buttonText="Escolher da galeria"
          onPress={pickImage}
          style={[styles.button, { backgroundColor: '#dc2626' }]}

        />
        <Button
          buttonText="Postar imagem"
          onPress={saveImageToServer}
          disabled={!image}
          style={[styles.button, { backgroundColor: image ? '#dc2626' : '#d1d5db' }]}

        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PostScreen;
import React, { useState, useEffect } from "react";
import { View, Image, Alert, Text, TouchableOpacity } from "react-native";
import { launchImageLibrary, MediaType, ImageLibraryOptions } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { Button } from "../../components/ui/Button";
import { ChevronLeft } from "lucide-react-native";
import { BASE_URL } from "../../constants/config";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";

const UploadPostScreen = () => {
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
      mediaType: "photo" as MediaType, // Converte explicitamente para o tipo correto
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
    <View className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-gray-100'} p-4`}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <ChevronLeft size={28} color={isDarkMode ? 'white' : 'black'} />
      </TouchableOpacity>
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Novo Post
        </Text>
      </View>

      {image && (
        <View className="mb-6">
          <Image
            source={{ uri: image }}
            className="w-full h-80 rounded-lg border-2 border-gray-200 shadow-lg"
          />
        </View>
      )}

      <View className="space-y-4">
        <Button
          buttonText="Escolher da galeria"
          onPress={pickImage}
          className="bg-red-600 text-white rounded-lg py-2 px-6 font-semibold"
        />
        <Button
          buttonText="Postar imagem"
          onPress={saveImageToServer}
          disabled={!image}
          className={`${
            image ? "bg-red-600" : "bg-gray-300"
          } text-white rounded-lg py-2 px-6 font-semibold`}
        />
      </View>
    </View>
  );
};

export default UploadPostScreen;

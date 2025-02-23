import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { Button } from "../../components/ui/Button";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
import { launchImageLibrary, MediaType, PhotoQuality } from "react-native-image-picker";
import ImagePicker from 'react-native-image-crop-picker';  // Importando a biblioteca

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showThreadsBadge, setShowThreadsBadge] = useState(false);
  const [image, setImage] = useState("https://via.placeholder.com/100");
  const [id, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    pronouns: "",
    bio: "",
    gender: "",
    links: "",
    currentProfilePicture: "",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };

    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("id");
      if (storedUserId) {
        setUserId(storedUserId);
        fetchProfileData(storedUserId);
        fetchProfilePicture(storedUserId);
      }
    };

    loadTheme();
    loadUserId();
  }, []);

  const toggleDarkMode = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem("darkMode", newTheme.toString());
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (id) {
      await fetchProfileData(id);
      await fetchProfilePicture(id);
    }
    setIsRefreshing(false);
  };

  const fetchProfileData = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          fullName: data.fullName || "",
          username: data.username || "",
          pronouns: data.pronouns || "",
          bio: data.bio || "",
          gender: data.gender || "",
          links: data.links || "",
          currentProfilePicture: data.profile_picture || "",
        });

        if (data.profile_picture) {
          setImage(data.profile_picture);
        }
      } else {
        console.error("Erro ao buscar perfil:", await response.text());
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const fetchProfilePicture = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}/profilePicture`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile_picture) {
          // Garantir que a URL seja atualizada com o parâmetro de timestamp
          setImage(`${data.profile_picture}?t=${new Date().getTime()}`);
        }
      } else {
        console.error("Erro ao buscar imagem de perfil");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  // Função para selecionar e recortar a imagem
  const pickImage = () => {
    ImagePicker.openPicker({
      cropping: true, // Permite o recorte da imagem
      width: 300,  // Largura máxima da imagem recortada
      height: 300,  // Altura máxima da imagem recortada
      cropperCircleOverlay: true,  // Opção para recorte circular
    }).then((image) => {
      const selectedUri = image.path;
      setImage(selectedUri);  // Atualiza a imagem na tela
      uploadImage(selectedUri);  // Envia a imagem selecionada
    }).catch(error => {
      console.error("Erro ao selecionar imagem", error);
    });
  };
  
  {isLoading ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <TouchableOpacity onPress={pickImage}>
      <Image
        source={{ uri: image }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
    </TouchableOpacity>
  )}
  

  const uploadImage = async (uri: string) => {
    if (!id) return;
  
    setIsLoading(true);  // Inicia o carregamento
  
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: `profile_${id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);
  
      const uploadResponse = await fetch(`${BASE_URL}/users/${id}/uploadProfilePicture`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (uploadResponse.ok) {
        // Aqui, depois do upload, chama novamente a função para atualizar a imagem
        fetchProfilePicture(id);  // Chama para garantir que o estado da imagem seja atualizado
      } else {
        console.error("Erro ao enviar imagem:", await uploadResponse.text());
      }
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
    } finally {
      setIsLoading(false);  // Finaliza o carregamento
    }
  };

  const saveProfile = async () => {
    if (!id) return;
  
    // Validação simples
    if (!profileData.fullName || !profileData.username) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }
  
    try {
      const response = await fetch(`${BASE_URL}/users/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
  
      if (response.ok) {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "ProfileScreen" }],
          })
        );
      } else {
        console.error("Erro ao atualizar o perfil:", await response.text());
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? "#333" : "#fff" }}>
      <ScrollView
        style={{ padding: 16 }}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 16, color: isDarkMode ? "#fff" : "#000" }}>
            Editar perfil
          </Text>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Text style={{ color: isDarkMode ? "#fff" : "#000", marginTop: 10 }}>Editar foto ou avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <TextInput
          placeholder="Nome"
          value={profileData.fullName}
          onChangeText={(text) => setProfileData({ ...profileData, fullName: text })}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#fff" : "#000",
            padding: 10,
            marginTop: 20,
            color: isDarkMode ? "#fff" : "#000",
          }}
        />
        <TextInput
          placeholder="Nome de usuário"
          value={profileData.username}
          onChangeText={(text) => setProfileData({ ...profileData, username: text })}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#fff" : "#000",
            padding: 10,
            marginTop: 20,
            color: isDarkMode ? "#fff" : "#000",
          }}
        />
        <TextInput
          placeholder="Pronomes"
          value={profileData.pronouns}
          onChangeText={(text) => setProfileData({ ...profileData, pronouns: text })}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#fff" : "#000",
            padding: 10,
            marginTop: 20,
            color: isDarkMode ? "#fff" : "#000",
          }}
        />
        <TextInput
          placeholder="Bio"
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#fff" : "#000",
            padding: 10,
            marginTop: 20,
            color: isDarkMode ? "#fff" : "#000",
          }}
          multiline
        />

        {/* Links and Gender */}
        <Text style={{ color: isDarkMode ? "#fff" : "#000", marginTop: 20 }}>Links</Text>
        <TextInput
          placeholder="Adicionar links"
          value={profileData.links}
          onChangeText={(text) => setProfileData({ ...profileData, links: text })}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#fff" : "#000",
            padding: 10,
            marginTop: 10,
            color: isDarkMode ? "#fff" : "#000",
          }}
        />

        <Text style={{ color: isDarkMode ? "#fff" : "#000", marginTop: 20 }}>Adicionar Gênero</Text>
        <TextInput
          placeholder="Gênero"
          value={profileData.gender}
          onChangeText={(text) => setProfileData({ ...profileData, gender: text })}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#fff" : "#000",
            padding: 10,
            marginTop: 10,
            color: isDarkMode ? "#fff" : "#000",
          }}
        />

        {/* Music Section */}
        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>Música</Text>
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>Adicionar música ao seu perfil</Text>
        </TouchableOpacity>

        {/* Switch for Threads Badge */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>Mostrar selo do Threads</Text>
            <Text style={{ color: isDarkMode ? "#aaa" : "#666" }}>
              Quando essa opção é desativada, o selo do Instagram também desaparece do seu perfil do Threads.
            </Text>
          </View>
          <Switch value={showThreadsBadge} onValueChange={setShowThreadsBadge} />
        </View>

        {/* Save Button */}
        <Button buttonText="Salvar alterações" onPress={saveProfile} />
      </ScrollView>
    </View>
  );
}


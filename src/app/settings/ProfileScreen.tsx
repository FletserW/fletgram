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
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { Button } from "../../components/ui/Button";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
import { launchImageLibrary, MediaType, PhotoQuality } from "react-native-image-picker";

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showThreadsBadge, setShowThreadsBadge] = useState(false);
  const [image, setImage] = useState("https://via.placeholder.com/100");
  const [id, setUserId] = useState<string | null>(null);
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
          setImage(`${data.profile_picture}?t=${new Date().getTime()}`);
        }
      } else {
        console.error("Erro ao buscar imagem de perfil");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const pickImage = () => {
    const options: any = {
      mediaType: "photo", // Usa string diretamente
      quality: 1, // Define a qualidade da imagem
      selectionLimit: 1, // Apenas uma imagem pode ser selecionada
    };
  
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("Usuário cancelou a seleção de imagem");
      } else if (response.errorMessage) {
        console.error("Erro ao selecionar imagem:", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0].uri || "");
      }
    });
  };
  

  const uploadImage = async (uri: string) => {
    if (!id) return;

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
        fetchProfilePicture(id);
      } else {
        console.error("Erro ao enviar imagem:", await uploadResponse.text());
      }
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
    }
  };

  const saveProfile = async () => {
    if (!id) return;

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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 16, color: isDarkMode ? "#fff" : "#000" }}>
            Editar perfil
          </Text>
        </View>

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Text style={{ color: isDarkMode ? "#fff" : "#000", marginTop: 10 }}>Editar foto ou avatar</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Nome"
          value={profileData.fullName}
          onChangeText={(text) => setProfileData({ ...profileData, fullName: text })}
          style={{ borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#fff" : "#000", padding: 10, marginTop: 20, color: isDarkMode ? "#fff" : "#000" }}
        />

        <Button buttonText="Salvar alterações" onPress={saveProfile} />
      </ScrollView>
    </View>
  );
}

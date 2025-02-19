import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView, Modal, TouchableWithoutFeedback, RefreshControl, StyleSheet } from "react-native";
import { Plus, Menu, UserPlus } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";

interface User {
  username: string;
  fullName: string;
  profilePicture: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  bio: string;
  links: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [image, setImage] = useState<string>("https://via.placeholder.com/100");
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [posts, setPosts] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProps>();

  const fetchProfileDataPicture = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}/profilePicture`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile_picture && typeof data.profile_picture === 'string') {
          setImage(`${data.profile_picture}?t=${new Date().getTime()}`);
        } else {
          setImage("https://via.placeholder.com/100");
        }
      } else {
        console.error("Erro ao buscar a imagem do perfil");
        setImage("https://via.placeholder.com/100");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setImage("https://via.placeholder.com/100");
    }
  };

  const fetchPosts = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const validPosts = data.filter((post: any) => post.content);
        setPosts(validPosts.map((post: any) => post.content));
        setUser((prevUser) => prevUser ? { ...prevUser, postsCount: validPosts.length } : null);
      } else {
        console.error("Erro ao buscar as postagens.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const fetchFollowersCount = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/followers/${id}/followers`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.length);
      } else {
        console.error("Erro ao buscar a lista de seguidores");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const fetchFollowingCount = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/followers/${id}/following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.length);
      } else {
        console.error("Erro ao buscar a lista de pessoas que o usuário está seguindo");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const loadUserData = async () => {
    const storedUserId = await AsyncStorage.getItem("id");
    if (storedUserId) {
      try {
        const response = await fetch(`${BASE_URL}/users/${storedUserId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          fetchProfileDataPicture(storedUserId);
          fetchFollowersCount(storedUserId);
          fetchFollowingCount(storedUserId);
          fetchPosts(storedUserId);
        } else {
          console.error("Erro ao buscar dados do usuário.");
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      setUser((prevUser) => prevUser ? { ...prevUser, postsCount: posts.length } : null);
    }
    const loadThemePreference = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === "true");
      }
    };
    loadThemePreference();
  }, [posts]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadUserData();
    setIsRefreshing(false);
  };

  const handleImagePress = (image: string) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {/* Cabeçalho */}
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          {user?.username || "Carregando..."}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("UpLoadPostScreen")}>
            <Plus size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
            <Menu size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Perfil */}
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: image }} style={styles.profileImage} />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDarkMode ? '#fff' : '#000' }]}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDarkMode ? '#fff' : '#000' }]}>{followers}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDarkMode ? '#fff' : '#000' }]}>{following}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Seguindo</Text>
            </View>
          </View>
        </View>

        {/* Nome e Bio */}
        <Text style={[styles.fullName, { color: isDarkMode ? '#fff' : '#000' }]}>{user?.fullName}</Text>
        <Text style={[styles.bio, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{user?.bio}</Text>
        {user?.links && (
          <Text style={styles.links}>{user.links}</Text>
        )}
      </View>

      {/* Botões */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ProfileScreen2")}>
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Compartilhar perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("FindPeopleScreen")}>
          <UserPlus size={15} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Grid de Posts */}
      <View style={styles.postsGrid}>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <TouchableOpacity key={index} style={styles.postItem} onPress={() => handleImagePress(post)}>
              <Image source={{ uri: post }} style={styles.postImage} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.noPostsText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Ainda não há postagens.</Text>
        )}
      </View>

      {/* Modal para imagem em tela cheia */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalBackground}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  profileContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bio: {
    fontSize: 14,
    marginTop: 4,
  },
  links: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  iconButton: {
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 40,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  postItem: {
    width: '33.33%',
    padding: 1,
  },
  postImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  noPostsText: {
    textAlign: 'center',
    width: '100%',
    marginTop: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
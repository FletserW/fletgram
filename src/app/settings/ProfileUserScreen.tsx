import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, StyleSheet, RefreshControl, Dimensions } from "react-native";
import { Heart, MessageCircle } from "lucide-react-native";
import { Plus, Menu, UserPlus } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import type { NavigationProps, RootStackParamList } from "../../constants/types";


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

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileUserScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProfileUserScreen">>(); // Tipando o route corretamente
  const { userId } = route.params; // Acessando o parâmetro userId
  const [user, setUser] = useState<User | null>(null);
  const [image, setImage] = useState<string>("https://via.placeholder.com/100");
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [posts, setPosts] = useState<any[]>([]); // Alterado para armazenar postagens completas
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProps>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  

  const fetchProfileDataPicture = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${id}/profilePicture`);
      if (response.ok) {
        const data = await response.json();
        // Adiciona o timestamp ao URL para evitar cache
        const imageUrl = data.profile_picture || "https://via.placeholder.com/100";
        setImage(`${imageUrl}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      console.error("Erro ao buscar imagem de perfil", error);
    }
  };
  

  const fetchPosts = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/user/${userId}`);
      if (response.ok) {
        const data = await response.json();

        // Mapear os posts e extrair a primeira imagem de cada post, se disponível
        const formattedPosts = data.map((post: any) => {
          // Acessando a primeira imagem do array 'image_url' (caso exista)
          const imageUrl = post.image_url && post.image_url[0];
          return { ...post, imageUrl };
        });

        setPosts(formattedPosts);
        setUser((prevUser) =>
          prevUser ? { ...prevUser, postsCount: formattedPosts.length } : null
        );
      } else {
        console.error("Erro ao buscar postagens", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar postagens", error);
    }
  };

  const fetchFollowersCount = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/followers/${id}/followers`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar seguidores", error);
    }
  };

  const fetchFollowingCount = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/followers/${id}/following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar pessoas que o usuário segue", error);
    }
  };

  const loadUserData = async (userId) => {
    if (userId) {
      try {
        const response = await fetch(`${BASE_URL}/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          fetchProfileDataPicture(userId);
          fetchFollowersCount(userId);
          fetchFollowingCount(userId);
          fetchPosts(userId);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário", error);
      }
    }
  };

  useEffect(() => {
    // Carregar dados do usuário quando o componente for montado
    loadUserData(userId);
    const loadThemePreference = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadThemePreference();
    onRefresh();
  }, [userId]);  // Recarrega os dados quando o userId mudar

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadUserData(userId);  // Passando userId para a função
    setIsRefreshing(false);
  };

   // Função para abrir o modal e carregar as imagens do post
   const handleImagePress = (post: any, index: number) => {
    setSelectedPost(post);
    setCurrentIndex(index);
    setIsModalVisible(true);
  };

  /*const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl); // Armazena a imagem clicada
    setIsModalVisible(true); // Abre o modal
  };*/

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const formatPostTime = (createdAt: string) => {
      const now = new Date();
      const postDate = new Date(createdAt);
      return formatDistanceToNow(postDate, { addSuffix: true });
    };

    const formatTimeAgo = (createdAt: string | undefined) => {
      if (!createdAt) return "Data inválida";
    
      const createdDate = new Date(createdAt);
      if (isNaN(createdDate.getTime())) return "Data inválida";
    
      const now = new Date();
      const diffInSeconds = Math.floor(
        (now.getTime() - createdDate.getTime()) / 1000
      );
    
      if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h atrás`;
      return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000" : "#fff" },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Cabeçalho */}
      <View
        style={[
          styles.header,
          { borderBottomColor: isDarkMode ? "#374151" : "#e5e7eb" },
        ]}
      >
        <Text
          style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}
        >
          {user?.username || "Carregando..."}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("UpLoadPostScreen")}
          >
            <Plus size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("SettingsScreen")}
          >
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
              <Text
                style={[
                  styles.statValue,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                {posts.length}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? "#9ca3af" : "#6b7280" },
                ]}
              >
                Posts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                {followers}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? "#9ca3af" : "#6b7280" },
                ]}
              >
                Seguidores
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                {following}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? "#9ca3af" : "#6b7280" },
                ]}
              >
                Seguindo
              </Text>
            </View>
          </View>
        </View>

        {/* Nome e Bio */}
        <Text
          style={[styles.fullName, { color: isDarkMode ? "#fff" : "#000" }]}
        >
          {user?.fullName}
        </Text>
        <Text
          style={[styles.bio, { color: isDarkMode ? "#9ca3af" : "#6b7280" }]}
        >
          {user?.bio}
        </Text>
        {user?.links && <Text style={styles.links}>{user.links}</Text>}
      </View>

      {/* Grid de Posts */}
      <View style={styles.container}>
      <View style={styles.postsGrid}>
        {posts.length > 0 ? (
          posts.map((post, index) => {
            const imageUrl = post.image_url[0]; // Pegando apenas a primeira imagem

            return (
              <TouchableOpacity
                key={index}
                style={styles.postItem}
                onPress={() => handleImagePress(post, 0)} // Ao clicar, abre o modal com as imagens do post
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.postImage} />
                ) : (
                  <Text>Imagem não disponível</Text>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noPostsText}>Ainda não há postagens.</Text>
        )}
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
  <TouchableWithoutFeedback onPress={closeModal}>
    <View style={styles.modalBackground}>
      <TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          {/* Cabeçalho do Modal */}
          <View style={styles.postHeader}>
            <Image
              source={{ uri: selectedPost?.profilePicture }}
              style={styles.postProfilePicture}
            />
            <View style={styles.postInfo}>
              <Text style={[styles.postUsername, { color: isDarkMode ? "#fff" : "#000" }]}>
                {selectedPost?.username}
              </Text>
              <Text style={[styles.postTime, { color: isDarkMode ? "#ccc" : "#111" }]}>
                {formatTimeAgo(selectedPost?.createdAt)}
              </Text>
            </View>
          </View>

          {/* Exibição das imagens em carrossel */}
          <View style={styles.imageContainer}>
            {Array.isArray(selectedPost?.image_url) && selectedPost?.image_url.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const contentOffsetX = e.nativeEvent.contentOffset.x;
                  const index = Math.floor(contentOffsetX / screenWidth); // Calcular o índice da imagem
                  setCurrentIndex(index); // Atualiza o índice da imagem principal
                }}
                contentContainerStyle={styles.imageScrollContentContainer}
              >
                {selectedPost?.image_url.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    //onPress={() => openImageModal(imageUrl)} // Ação para abrir o modal
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.modalImage}
                      resizeMode="contain" // Ajuste a imagem para não distorcer
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text>Imagem não disponível</Text>
            )}
          </View>

          {/* Ações (Curtir e Comentar) */}
          <View style={[styles.postActions, { backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb" }]}>
            <TouchableOpacity style={styles.actionButton}>
              <Heart color={isDarkMode ? "#fff" : "#000"} size={24} />
              <Text style={styles.actionCount}>{selectedPost?.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle color={isDarkMode ? "#fff" : "#000"} size={24} />
              <Text>{selectedPost?.commentsCount ?? "0"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>






    </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  profileContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  bio: {
    fontSize: 14,
    marginTop: 4,
  },
  links: {
    fontSize: 14,
    color: "#dc2626",
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
  },
  iconButton: {
    backgroundColor: "#e5e7eb",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    maxWidth: 40,
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    justifyContent: "space-between",
  },
  postItem: {
    width: "33.33%",
    padding: 1,
  },
  postImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  noPostsText: {
    textAlign: "center",
    width: "100%",
    marginTop: 16,
  },



  
  // Estilos gerais
  modalImage: {
    width: screenWidth,  // 100% da largura da tela
    height: 300,  // Ajuste de altura conforme necessário
    borderRadius: 8,  // Bordas arredondadas (opcional)
  
  },
  // Estilo para o ScrollView horizontal
  imageScrollContentContainer: {
    flexDirection: "row",      // Exibe as imagens em linha
    justifyContent: "flex-start", // Alinha as imagens à esquerda
    alignItems: "center",     // Alinha as imagens verticalmente
    paddingLeft: 0,           // Certifique-se de não ter um padding desnecessário à esquerda
    marginLeft: -40, 
               // Certifique-se de não ter margens que movam as imagens para a direita
  },

  // Estilo para a área de ações
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionCount: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#000',
  },

  // Cabeçalho do Post
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  postProfilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  postInfo: {
    marginLeft: 10,
    alignItems: "flex-end",
  },

  postUsername: {
    fontWeight: 'bold',
  },

  postTime: {
    fontSize: 12,
    color: 'white',
    textAlign: 'right',
  },

  // Modal Background
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#5e5d5d',
    borderRadius: 10,
    padding: 20,
    width: screenWidth * 0.9,  // Modal ocupa 90% da largura da tela
  },
  imageContainer: {
    width: screenWidth,  // Carrossel ocupa toda a largura da tela
    height: 300,         // Definindo uma altura para as imagens do carrossel
    overflow: 'hidden',  // Esconde qualquer conteúdo que ultrapasse os limites
   
  },
});

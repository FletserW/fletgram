import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, Image, TouchableOpacity, Modal, SafeAreaView, 
  FlatList, useColorScheme, RefreshControl, TextInput, KeyboardAvoidingView,
  TouchableWithoutFeedback, Platform, StyleSheet, PanResponder
} from "react-native";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { toggleLikePost } from "../../services/likeUtils"; 
import { Post } from "../../constants/types";

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [data, setData] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Inicializa com a primeira imagem

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    const loadThemePreference = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true" || (storedTheme === null && colorScheme === "dark"));
    };
    loadThemePreference();
  }, [colorScheme]);

  useEffect(() => {
    const imagesWithUrl = data.filter(item => item.imageUrl || item.image_url.length > 0);
    setSelectedImages(imagesWithUrl);
  }, [data]);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("id");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        console.log("Erro: userId não encontrado no AsyncStorage");
      }
    };
    fetchUserId();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/posts/all`);
      if (!response.ok) throw new Error("Erro ao obter os posts");

      const data = await response.json();

      const postsWithImages = data.map((post) => ({
        ...post,
        imageUrl: Array.isArray(post.image_url) && post.image_url.length > 0
          ? post.image_url[0]
          : null,
      }));

      const sortedPosts = postsWithImages.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: number) => {
    if (!userId) {
      console.error("Usuário não encontrado");
      return;
    }

    try {
      await toggleLikePost(postId, userId, setPosts);

      if (selectedPost && selectedPost.id === postId) {
        const updatedPost = posts.find(post => post.id === postId);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        }
      }
    } catch (error) {
      console.error("Erro ao alternar curtida:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostId || !userId) return;

    try {
      const response = await fetch(`${BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          postId: selectedPostId,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment(""); // Limpa o campo de texto
        fetchComments(selectedPostId); 
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  const fetchComments = useCallback(async (postId: number) => {
    if (!postId) return;

    try {
      const url = `${BASE_URL}/comments/post/${postId}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();

      const commentsWithUserDetails = await Promise.all(
        data.map(async (comment: { id: number; content: string; userId: number }) => {
          const userResponse = await fetch(`${BASE_URL}/users/${comment.userId}`);
          const userData = await userResponse.json();

          const profileResponse = await fetch(`${BASE_URL}/users/${comment.userId}/profilePicture`);
          const profileData = await profileResponse.json();

          return {
            ...comment,
            username: userData.username,
            profilePicture: profileData.profile_picture,
          };
        })
      );

      setComments(commentsWithUserDetails);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  }, []);

  // Função para ir para a próxima imagem
  const goToNextImage = () => {
    if (selectedImageIndex < selectedImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1); // Vai para a próxima imagem
    }
  };

  // Função para ir para a imagem anterior
  const goToPreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1); // Vai para a imagem anterior
    }
  };

  // Criando o PanResponder para detectar os gestos
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      // Detectando o gesto de deslizar
      if (gestureState.dx > 100) {
        // Deslizar para a direita
        goToPreviousImage();
      } else if (gestureState.dx < -100) {
        // Deslizar para a esquerda
        goToNextImage();
      }
    },
    onPanResponderRelease: () => {},
  });

  const openImageModal = (post: Post) => {
    setSelectedImages(post.image_url || []); // Atualiza as imagens do post
    setSelectedPost(post); // Atualiza o post selecionado
    setSelectedImageIndex(0); // Inicia o modal com a primeira imagem
    setModalVisible(true); // Abre o modal
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImages([]); // Limpa o array de imagens
    setSelectedPost(null); // Limpa o post selecionado
  };

  const renderItem = ({ item }) => {
    if (!item.imageUrl) return null;

    return (
      <View style={styles.postContainer}>
        <TouchableOpacity onPress={() => openImageModal(item)}>
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? "#000" : "#e5e7eb" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={isDarkMode ? "#fff" : "#000"} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Explorar</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={closeImageModal}>
        <View style={[styles.modalBackground, { backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)" }]}>
          <TouchableOpacity style={styles.modalTouchable} onPress={closeImageModal} />
          <View 
            style={[styles.modalContent, { backgroundColor: isDarkMode ? "#1f2937" : "#fff" }]}
            {...panResponder.panHandlers} // Associando o PanResponder com o modal
          >
            {selectedImages.length > 0 ? (
              <Image source={{ uri: selectedImages[selectedImageIndex] }} style={styles.modalImage} resizeMode="contain" />
            ) : (
              <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Nenhuma imagem disponível.</Text>
            )}

            <View style={[styles.modalActions, { borderTopColor: isDarkMode ? "#374151" : "#d1d5db" }]}>
              <TouchableOpacity style={styles.actionButton}>
                <Heart color={isDarkMode ? "#fff" : "#000"} size={24} />
                <Text style={[styles.actionText, { color: isDarkMode ? "#fff" : "#000" }]}>0</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContainer: {
    marginBottom: 16,
    flex: 1,
  },
  postImage: {
    width: '95%',
    height: 150,
    borderRadius: 8,
    
  },
  flatListContent: {
    padding: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTouchable: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalProfilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  modalUsername: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalTime: {
    marginLeft: 'auto',
    fontSize: 14,
  },
  modalImage: {
    width: '100%',
    height: 384,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
});

export default ExploreScreen;
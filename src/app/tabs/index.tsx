import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  RefreshControl,
  TextInput,
  SafeAreaView,
  TouchableWithoutFeedback,
  PanResponder
} from "react-native";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalErrorBoundary } from "../../components/ErrorFallback";
import { Heart, MessageCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { toggleLikePost } from "../../services/likeUtils";
import { PostDisplay } from "../../components/PostDisplay";
import { Post } from "../../constants/types";
import { ptBR } from "date-fns/locale"; 


// Definindo o tipo para os stories
interface Story {
  id: number;
  username: string;
  image: string;
}
interface Comment {
  id: number;
  content: string;
  username: string;
}

const FletgramFeed = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsCount, setCommentsCount] = useState<{ [key: number]: number }>({});
  


  const getUserId = async () => {
    const userIdFromStorage = await AsyncStorage.getItem("id");
    setUserId(userIdFromStorage);
  };

  const getDarkModePreference = async () => {
    const darkMode = await AsyncStorage.getItem("darkMode");
    if (darkMode === "true") {
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    getUserId();
    getDarkModePreference();
    fetchStoriesAndPosts();
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/posts/${selectedPostId}`
        );
        const data = await response.json();
    
        // Certifique-se de que os dados de 'createdAt' sejam recuperados corretamente
        setComments(
          Array.isArray(data)
            ? data.map((comment) => ({
                ...comment, // Adiciona todos os dados do comentário
                createdAt: comment.createdAt, // Certifique-se de que 'createdAt' esteja presente
              }))
            : []
        );
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        setComments([]); // Evita erro ao mapear
      }
    };
    

    if (selectedPostId) {
      fetchComments();
    }
  }, [selectedPostId]); 
  
  

  const fetchStoriesAndPosts = async () => {
    if (!userId) {
      console.log("UserId is null, aborting fetch.");
      return;
    }

    try {
      const followingResponse = await fetch(
        `${BASE_URL}/followers/${userId}/following`
      );
      const followingData = await followingResponse.json();

      const storyData = await Promise.all(
        followingData.map(async (follow: { userId: number }) => {
          const profileResponse = await fetch(
            `${BASE_URL}/users/${follow.userId}/profilePicture`
          );
          const profileData = await profileResponse.json();

          const userResponse = await fetch(
            `${BASE_URL}/users/${follow.userId}`
          );
          const userData = await userResponse.json();

          const postsResponse = await fetch(
            `${BASE_URL}/posts/user/${follow.userId}`
          );
          const postsData = await postsResponse.json();

          const postsWithLikes = await Promise.all(
            postsData.map(
              async (post: {
                id: number;
                content: string;
                createdAt: string;
              }) => {
                try {
                  const likesResponse = await fetch(
                    `${BASE_URL}/likes/count/${post.id}`
                  );
                  const likesText = await likesResponse.text(); // Pega o texto da resposta
                  let likesCount = 0;

                  try {
                    const likesJson = JSON.parse(likesText);
                    likesCount = likesJson ?? 0; // Se o JSON tiver "count", pegamos ele
                  } catch (error) {
                    likesCount = parseInt(likesText, 10) || 0; // Se for um número direto, tentamos converter
                  }

                  console.log(
                    `Post ID: ${post.id}, Likes Count: ${likesCount}`
                  );

                  return {
                    id: post.id,
                    userId: follow.userId,
                    content: post.content,
                    username: userData.username,
                    profilePicture: profileData.profile_picture,
                    createdAt: post.createdAt,
                    likes: likesCount, // Usa o número de curtidas correto
                  };
                } catch (error) {
                  console.error(
                    `Erro ao buscar curtidas para post ${post.id}:`,
                    error
                  );
                  return {
                    id: post.id,
                    userId: follow.userId,
                    content: post.content,
                    username: userData.username,
                    profilePicture: profileData.profile_picture,
                    createdAt: post.createdAt,
                    likes: 0, // Se houver erro, assume 0 curtidas
                  };
                }
              }
            )
          );

          return {
            id: follow.userId,
            username: userData.username,
            image: profileData.profile_picture,
            posts: postsWithLikes,
          };
        })
      );

      const allPosts = storyData.flatMap((story) => story.posts);
      const sortedPosts = allPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setStories(storyData);
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Erro ao buscar stories e postagens:", error);
    }
  };

  const fetchPosts = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${BASE_URL}/posts`);
      const data = await response.json();

      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          const likesResponse = await fetch(
            `${BASE_URL}/likes/count/${post.id}`
          );
          const likesData = await likesResponse.json();

          // Verifica se o usuário já curtiu o post
          const checkLikeResponse = await fetch(
            `${BASE_URL}/likes/${userId}/check/${post.id}`
          );
          const checkLikeData = await checkLikeResponse.json();

          return { ...post, likes: likesData, liked: checkLikeData.liked };
        })
      );

      setPosts(postsWithLikes);
    } catch (error) {
      console.error("Erro ao buscar postagens:", error);
    }
  };

  const formatPostTime = (createdAt: string) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    return formatDistanceToNow(postDate, { addSuffix: true });
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null); // Opcional: limpar o post selecionado
    setComments([]); // Opcional: limpar os comentários ao fechar
  };
  

  const openCommentModal = async (postId: number) => {
    if (!postId) return;
    setSelectedPostId(postId);
    setCommentModalVisible(true);
    await fetchComments(postId); 
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
      console.log('Comentários carregados:', data); // Verifique se os comentários estão sendo retornados
  
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
        setNewComment("");
      
        // Buscar os comentários novamente para contar quantos existem
        const commentsResponse = await fetch(`${BASE_URL}/comments/post/${selectedPostId}`);
        const commentsData = await commentsResponse.json();
      
        // Atualiza a contagem de comentários no estado dos posts
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === selectedPostId
              ? { ...post, commentsCount: Array.isArray(commentsData) ? commentsData.length : 0 }
              : post
          )
        );
      
        fetchComments(selectedPostId); // Atualiza os comentários no modal
      }
      
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };
  

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchStoriesAndPosts();
    setIsRefreshing(false);
  }, [userId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? 'black' : 'white' }}>
      <ScrollView style={{ flex: 1,  backgroundColor: isDarkMode ? 'black' : 'white' }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#444' : '#ddd' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDarkMode ? 'white' : 'black' }}>Fletgram</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Heart color={isDarkMode ? "white" : "black"} size={24} />
            </TouchableOpacity>
            <TouchableOpacity>
              <MessageCircle color={isDarkMode ? "white" : "black"} size={24} />
            </TouchableOpacity>
          </View>
        </View>   
      
        <GlobalErrorBoundary>
          <PostDisplay
            posts={posts}
            isDarkMode={isDarkMode}
            toggleLikePost={toggleLikePost}
            openCommentModal={openCommentModal}
            openImageModal={openImageModal}
            isModalVisible={isModalVisible}
            closeImageModal={closeImageModal}
            selectedImage={selectedImage}
            isCommentModalVisible={isCommentModalVisible}
            closeCommentModal={closeCommentModal}
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            handleAddComment={handleAddComment}
            onRefresh={onRefresh}
            stories={stories}
            userId={userId}
            setPosts={setPosts}
            isRefreshing={isRefreshing}
            commentsCount={commentsCount}
          />
        </GlobalErrorBoundary>
      </ScrollView>
    </SafeAreaView>

  );
};

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 16,
    marginLeft: "auto", // Isso move os ícones para a direita
  },

  storiesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 12,
  },
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#ec4899",
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 4,
  },
  noStoriesText: {
    textAlign: "center",
    color: "#6b7280",
  },
});

export default FletgramFeed;

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
  TouchableWithoutFeedback,
} from "react-native";
import { Heart, MessageCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { toggleLikePost } from "../../services/likeUtils";
import { PostDisplay } from "../../components/PostDisplay";
import { Post } from "../../constants/types";

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
          `https://sua-api.com/posts/${selectedPostId}/comments`
        );
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []); // Garante que é um array
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        setComments([]); // Evita erro ao mapear
      }
    };

    if (selectedPostId) {
      fetchComments();
    }
  }, [selectedPostId]);

  useEffect(() => {
    const fetchPostsAndCommentsCount = async () => {
      if (!userId) return;
  
      try {
        const postsResponse = await fetch(`${BASE_URL}/posts`);
        const postsData = await postsResponse.json();
  
        const postsWithLikes = await Promise.all(
          postsData.map(async (post) => {
            const likesResponse = await fetch(`${BASE_URL}/likes/count/${post.id}`);
            const likesData = await likesResponse.json();
  
            // Verifica se o usuário já curtiu o post
            const checkLikeResponse = await fetch(`${BASE_URL}/likes/${userId}/check/${post.id}`);
            const checkLikeData = await checkLikeResponse.json();
  
            return { ...post, likes: likesData, liked: checkLikeData.liked };
          })
        );
  
        setPosts(postsWithLikes);
  
        // Agora, vamos buscar a contagem de comentários de cada post
        const countPromises = postsWithLikes.map(async (post) => {
          const response = await fetch(`${BASE_URL}/comments/count/${post.id}`);
          const countData = await response.json();
          return { postId: post.id, count: countData.count };
        });
  
        const countResults = await Promise.all(countPromises);
        const newCommentsCount: { [key: number]: number } = {};
  
        countResults.forEach(({ postId, count }) => {
          newCommentsCount[postId] = count;
        });
  
        setCommentsCount(newCommentsCount); // Atualiza o estado de commentsCount
      } catch (error) {
        console.error('Erro ao buscar posts e contagem de comentários:', error);
      }
    };
  
    fetchPostsAndCommentsCount();
  }, []);
  
  

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
    if (!postId) return; // Evita abrir modal sem um post válido
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
        console.error(
          `Erro na requisição: ${response.status} - ${response.statusText}`
        );
        return;
      }
  
      const data = await response.json();
      setComments(data);
      setCommentsCount((prev) => ({
        ...prev,
        [postId]: data.length, // Armazena a quantidade de comentários
      }));
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
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
        fetchComments(selectedPostId);
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
    <ScrollView style={{ flex: 1, marginTop: 30, backgroundColor: isDarkMode ? 'black' : 'white' }}
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
    </ScrollView>

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

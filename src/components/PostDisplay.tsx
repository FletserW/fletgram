import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { Heart, MessageCircle } from "lucide-react-native";
import { toggleLikePost } from "../services/likeUtils";
import { Post } from "../constants/types";

interface Story {
  id: number;
  username: string;
  image: string;
}

interface Props {
  posts: Post[];
  stories: Story[];
  isDarkMode: boolean;
  toggleLikePost: (postId: number, userId: string, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => Promise<void>;
  openCommentModal: (postId: number) => void;
  openImageModal: (imageUrl: string) => void;
  isModalVisible: boolean;
  closeImageModal: () => void;
  selectedImage: string | null;
  isCommentModalVisible: boolean;
  closeCommentModal: () => void;
  comments: any[];
  newComment: string;
  setNewComment: (text: string) => void;
  handleAddComment: () => Promise<void>;
  onRefresh: () => void;
  isRefreshing: boolean;
  userId: string;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  commentsCount: { [key: number]: number };
}

const formatTimeAgo = (createdAt: string | undefined) => {
  if (!createdAt) return "Data inválida";

  const createdDate = new Date(createdAt);
  if (isNaN(createdDate.getTime())) return "Data inválida";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  return `${Math.floor(diffInSeconds / 86400)}d atrás`;
};

const SafeText = ({ children, style }: { children: any; style?: any }) => {
  if (typeof children !== "string" && typeof children !== "number") {
    return <Text style={style}>[Texto inválido]</Text>;
  }
  return <Text style={style}>{children}</Text>;
};

export const PostDisplay: React.FC<Props> = ({
  isDarkMode,
  stories,
  posts,
  isModalVisible,
  selectedImage,
  closeImageModal,
  openImageModal,
  isCommentModalVisible,
  openCommentModal,
  closeCommentModal,
  comments,
  newComment,
  setNewComment,
  handleAddComment,
  toggleLikePost,
  userId,
  setPosts,
  commentsCount
}) => {
  return (
    <ScrollView>
      {/* Stories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
        {stories.length > 0 ? (
          stories.map((story) => (
            <View key={story.id} style={styles.storyItem}>
              <Image source={{ uri: story.image }} style={styles.storyImage} />
              <SafeText style={[styles.storyUsername, { color: isDarkMode ? "#fff" : "#000" }]}>
                {String(story.username ?? "Usuário")}
              </SafeText>
            </View>
          ))
        ) : (
          <SafeText style={styles.noStoriesText}>Ainda não há stories.</SafeText>
        )}
      </ScrollView>

      {/* Posts */}
      <ScrollView style={styles.postsContainer}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <View key={post.id} style={styles.post}>
              {/* Cabeçalho do Post */}
              <View style={[styles.postHeader, { backgroundColor: isDarkMode ? "#374151" : "#d1d5db" }]}>
                <Image source={{ uri: post.profilePicture }} style={styles.postProfilePicture} />
                <SafeText style={[styles.postUsername, { color: isDarkMode ? "#fff" : "#000" }]}>
                  {String(post.username)}
                </SafeText>
              </View>

              {/* Imagem do Post */}
              <TouchableOpacity onPress={() => openImageModal(post.content)}>
                <Image source={{ uri: post.content }} style={styles.postImage} />
              </TouchableOpacity>

              {/* Ações (Curtir e Comentar) */}
              <View style={[styles.postActions, { backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb" }]}>
                <TouchableOpacity style={styles.actionButton} onPress={() => toggleLikePost(post.id, userId, setPosts)}>
                  <Heart color={post.liked ? "red" : isDarkMode ? "#fff" : "#000"} size={24} />
                  <SafeText style={styles.actionCount}>{post.likes}</SafeText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => openCommentModal(post.id)}>
                  <MessageCircle color={isDarkMode ? "#fff" : "#000"} size={24} />
                  <SafeText>{String(commentsCount[post.id] ?? "0")}</SafeText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <SafeText style={styles.noPostsText}>Ainda não há postagens.</SafeText>
        )}
      </ScrollView>

      {/* Modal de Imagem */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeImageModal}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
            <SafeText style={styles.closeButtonText}>X</SafeText>
          </TouchableOpacity>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          ) : (
            <SafeText>Imagem não disponível</SafeText>
          )}
        </View>
      </Modal>

      {/* Modal de Comentários */}
      <Modal visible={isCommentModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={closeCommentModal}>
          <View style={styles.modalBackground}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
              <FlatList
                data={comments}
                keyExtractor={(comment) => String(comment.id)}
                renderItem={({ item: comment }) => (
                  <View style={styles.comment}>
                    <View style={styles.commentHeader}>
                      <Image source={{ uri: comment.profilePicture }} style={styles.profilePicture} />
                      <SafeText style={styles.username}>{comment.username}</SafeText>
                      <SafeText style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</SafeText>
                    </View>
                    <SafeText>{comment.content}</SafeText>
                  </View>
                )}
              />
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity onPress={handleAddComment}>
                  <SafeText style={styles.sendButton}>Enviar</SafeText>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
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
  postsContainer: {
    paddingVertical: 17,
    paddingHorizontal: 16,
  },
  post: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  postProfilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postUsername: {
    fontWeight: "bold",
  },
  postTime: {
    marginLeft: "auto",
  },
  postImage: {
    width: "100%",
    height: 256,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 16,
  },
  actionCount: {
    fontSize: 12,
  },
  noPostsText: {
    textAlign: "center",
    color: "#6b7280",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  commentList: {
    flex: 1, // Permite que a lista ocupe todo o espaço disponível
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: "100%",
    maxHeight: "80%", // Impede que os comentários ultrapassem a tela
  },
  comment: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  commentProfile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentText: {
    fontSize: 14,
    color: "#000",
    flexWrap: "wrap", // Permite que o texto quebre a linha
    alignSelf: "flex-start", // Evita que o texto estique
  },
  username: {
    fontWeight: "bold",
    color: "#333",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  commentInput: {
    flex: 1,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    minHeight: 40,
    maxHeight: 120, // Impede que o input fique gigante
  },
  sendButton: {
    color: "#0095f6",
    fontWeight: "bold",
  },
  noCommentsText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1, // Ocupa toda a tela verticalmente
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    width: "100%", // Largura total
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Empurra a data para a direita
    marginBottom: 5,
  },
  commentInfo: {
    flex: 1, // Permite que o nome ocupe o espaço disponível
  },
  commentTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15, // Torna a imagem redonda
    marginRight: 10,  // Espaço entre a imagem e o nome
  },

});

export default PostDisplay;

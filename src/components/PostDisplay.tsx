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
  RefreshControl,
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
  userId: string;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  isRefreshing: boolean;
  commentsCount: { [key: number]: number };
}

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
  isRefreshing,
  onRefresh,
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
              <Text style={[styles.storyUsername, { color: isDarkMode ? "#fff" : "#000" }]}>{story.username}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noStoriesText}>Ainda não há stories.</Text>
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
                <Text style={[styles.postUsername, { color: isDarkMode ? "#fff" : "#000" }]}>{post.username}</Text>
              </View>

              {/* Imagem do Post */}
              <TouchableOpacity onPress={() => openImageModal(post.content)}>
                <Image source={{ uri: post.content }} style={styles.postImage} />
              </TouchableOpacity>

              {/* Ações (Curtir e Comentar) */}
              <View style={[styles.postActions, { backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb" }]}>
                <TouchableOpacity style={styles.actionButton} onPress={() => toggleLikePost(post.id, userId, setPosts)}>
                  <Heart color={post.liked ? "red" : isDarkMode ? "#fff" : "#000"} size={24} />
                  <Text style={styles.actionCount}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => openCommentModal(post.id)}>
  <MessageCircle color={isDarkMode ? "#fff" : "#000"} size={24} />
  <Text style={styles.actionCount}>
    {commentsCount[post.id] || 0} 
  </Text>
</TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noPostsText}>Ainda não há postagens.</Text>
        )}
      </ScrollView>

      {/* Modal de Imagem */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeImageModal}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          ) : (
            <Text style={styles.fullScreenImage}>Imagem não disponível</Text>
          )}
        </View>
      </Modal>

      {/* Modal de Comentários */}
      <Modal visible={isCommentModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={closeCommentModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <ScrollView style={styles.commentList}>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <View key={comment.id} style={styles.comment}>
                      <Text style={styles.commentText}>
                        <Text style={styles.username}>{comment.username}:</Text> {comment.content}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCommentsText}>Nenhum comentário ainda.</Text>
                )}
              </ScrollView>

              {/* Input para adicionar comentário */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity onPress={handleAddComment}>
                  <Text style={styles.sendButton}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    paddingVertical: 12,
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
    maxHeight: "80%",
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
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
  },
  username: {
    fontWeight: "bold",
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
  
});

export default PostDisplay;

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import React from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Image,
} from "react-native";

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

    const SafeText = ({ children, style }: { children: any; style?: any }) => {
      if (typeof children !== "string" && typeof children !== "number") {
        return <Text style={style}>[Texto inválido]</Text>;
      }
      return <Text style={style}>{children}</Text>;
    };

interface Comment {
  id: number;
  username: string;
  profilePicture: string;
  created_at: string;
  content: string;
}

interface CommentSectionProps {
  isCommentModalVisible: boolean;
  closeCommentModal: () => void;
  comments: Comment[];
  newComment: string;
  setNewComment: (text: string) => void;
  handleAddComment: () => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  isCommentModalVisible,
  closeCommentModal,
  comments,
  newComment,
  setNewComment,
  handleAddComment,
}) => {
  return (
    <Modal visible={isCommentModalVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={closeCommentModal}>
        <View style={styles.modalBackground}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            {/* Lista de Comentários */}
            <FlatList
              data={comments}
              keyExtractor={(comment) => String(comment.id)}
              renderItem={({ item: comment }) => (
                <View style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <Image
                      source={{ uri: comment.profilePicture }}
                      style={styles.profilePicture}
                    />
                    <SafeText style={styles.username}>{comment.username}</SafeText>
                    <SafeText style={styles.commentTime}>
                      {formatTimeAgo(comment.created_at)}
                    </SafeText>
                  </View>
                  <SafeText>{comment.content}</SafeText>
                </View>
              )}
            />

            {/* Campo para adicionar um novo comentário */}
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
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  comment: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
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
    maxHeight: 120,
  },
  sendButton: {
    color: "#0095f6",
    fontWeight: "bold",
  },
});

export default CommentSection;

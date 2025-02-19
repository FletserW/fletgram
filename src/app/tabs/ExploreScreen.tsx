import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Modal, SafeAreaView, FlatList, useColorScheme, RefreshControl, StyleSheet } from "react-native";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../constants/config";

type Post = {
  id: string;
  content: string;
  profilePicture: string;
  username: string;
  createdAt: string;
};

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadThemePreference = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === "true");
      } else {
        setIsDarkMode(colorScheme === "dark");
      }
    };
    loadThemePreference();
  }, [colorScheme]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/posts/all`);
        if (!response.ok) throw new Error("Erro ao obter os posts");
        const data = await response.json();
        const sortedPosts = data.sort((a: Post, b: Post) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
      } 
    };

    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${BASE_URL}/posts/all`);
      if (!response.ok) throw new Error("Erro ao obter os posts");
      const data = await response.json();
      const sortedPosts = data.sort((a: Post, b: Post) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Erro ao atualizar os posts:", error);
    }
    setRefreshing(false);
  };

  const openImageModal = (post: Post) => {
    setSelectedPost(post);
    setSelectedImage(post.content);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setSelectedPost(null);
  };

  const formatPostTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity onPress={() => openImageModal(item)}>
        <Image
          source={{ uri: item.content }}
          style={styles.postImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={isDarkMode ? "#fff" : "#000"} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Explorar</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={[styles.modalBackground, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }]}>
          <TouchableOpacity style={styles.modalTouchable} onPress={closeImageModal} />
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
            {selectedPost && (
              <View style={styles.modalHeader}>
                <Image
                  source={{ uri: selectedPost.profilePicture }}
                  style={styles.modalProfilePicture}
                />
                <Text style={[styles.modalUsername, { color: isDarkMode ? '#fff' : '#000' }]}>{selectedPost.username}</Text>
                <Text style={[styles.modalTime, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{formatPostTime(selectedPost.createdAt)}</Text>
              </View>
            )}

            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}

            <View style={[styles.modalActions, { borderTopColor: isDarkMode ? '#374151' : '#d1d5db' }]}>
              <TouchableOpacity style={styles.actionButton}>
                <Heart color={isDarkMode ? '#fff' : '#000'} size={24} />
                <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#000' }]}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle color={isDarkMode ? '#fff' : '#000'} size={24} />
                <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#000' }]}>0</Text>
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
    width: '100%',
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
});

export default ExploreScreen;
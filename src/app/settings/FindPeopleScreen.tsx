import { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { BASE_URL } from "../../constants/config";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  username: string;
  profilePicture: string;
}

export default function FindPeopleScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        const usersWithImages = await Promise.all(
          data.map(async (user: User) => {
            const profilePictureResponse = await fetch(
              `${BASE_URL}/users/${user.id}/profilePicture`
            );
            if (profilePictureResponse.ok) {
              const profileData = await profilePictureResponse.json();
  
              // Remover cache da imagem adicionando o timestamp
              const imageUrl = profileData.profile_picture || "https://via.placeholder.com/150";
              const imageWithCacheBuster = `${imageUrl}?t=${new Date().getTime()}`;
  
              return {
                ...user,
                profilePicture: imageWithCacheBuster,
              };
            }
  
            // Caso a resposta não tenha imagem de perfil, fornecemos um placeholder com cachebuster
            return {
              ...user,
              profilePicture: "https://via.placeholder.com/150?t=" + new Date().getTime(),
            };
          })
        );
        setUsers(usersWithImages);
        setFilteredUsers(usersWithImages);
      } else {
        console.error("Erro ao buscar usuários.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const UserCard = ({
    user,
    onFollow,
  }: {
    user: User;
    onFollow: (userId: string) => void;
  }) => {
    return (
      <View
        style={[styles.userCard, isDarkMode ? styles.userCardDark : styles.userCardLight]}
      >
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profileImage}
        />
        <Text
          style={[styles.username, isDarkMode ? styles.textWhite : styles.textBlack]}
        >
          {user.username}
        </Text>
        <TouchableOpacity
          onPress={() => {
            // Navegar para o ProfileUserScreen passando o userId
            navigation.navigate("ProfileUserScreen", { userId: user.id });
          }}
          
        >
          <Text style={styles.textWhite}>Ver perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onFollow(user.id)}
          style={styles.followButton}
        >
          <Text style={styles.textWhite}>Seguir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const followUser = async (userId: string) => {
    try {
      const followerId = await AsyncStorage.getItem("id");
      if (followerId) {
        const response = await fetch(`${BASE_URL}/followers/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId, userId }),
        });
        if (response.ok) {
          console.log(`Agora você está seguindo o usuário com ID: ${userId}`);
        } else {
          console.error("Erro ao seguir o usuário.");
        }
      } else {
        console.error("Usuário não autenticado.");
      }
    } catch (error) {
      console.error("Erro ao tentar seguir o usuário:", error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("darkMode");
      setIsDarkMode(storedTheme === "true");
    };
    loadTheme();
    fetchUsers();
  }, []);

  return (
    <View style={[styles.container, isDarkMode ? styles.bgBlack : styles.bgWhite]}>
      <View
        style={[styles.header, isDarkMode ? styles.borderDark : styles.borderLight]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerText, isDarkMode ? styles.textWhite : styles.textBlack]}>
          Encontrar pessoas
        </Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Pesquisar por usuário"
          style={[
            styles.searchInput,
            isDarkMode ? styles.borderDark : styles.borderLight,
            isDarkMode ? styles.textWhite : styles.textBlack,
          ]}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.userList}>
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} onFollow={followUser} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  bgBlack: { backgroundColor: "black" },
  bgWhite: { backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  borderDark: { borderColor: "#4B5563" },
  borderLight: { borderColor: "#E5E7EB" },
  headerText: { fontSize: 18, fontWeight: "bold" },
  textWhite: { color: "white" },
  textBlack: { color: "black" },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: { borderWidth: 1, padding: 8, borderRadius: 8 },
  scrollView: { paddingHorizontal: 16, paddingVertical: 8 },
  userList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  userCard: {
    width: 180,
    height: 180,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  userCardDark: { backgroundColor: "#1F2937" },
  userCardLight: { backgroundColor: "#E5E7EB" },
  profileImage: { width: 64, height: 64, borderRadius: 32 },
  username: { fontWeight: "bold", marginTop: 4 },
  followButton: {
    backgroundColor: "#9d3520",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 32,
    marginTop: 4,
  },
});

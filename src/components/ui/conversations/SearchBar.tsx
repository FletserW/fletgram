import React, { FC } from "react";
import { User } from "lucide-react-native";
import { TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../../../app/chat/ConversationsListScreen";

interface SearchBarProps {
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsModalVisible: (visible: boolean) => void;
}
const SearchBar: FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isDarkMode,
  setIsModalVisible,
}) => (
  <View
    style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}
  >
    <TextInput
      style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
      placeholder="Buscar usuário"
      placeholderTextColor={isDarkMode ? "#bbb" : "#888"}
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
      <User size={24} color={isDarkMode ? "#fff" : "#000"} />
    </TouchableOpacity>
  </View>
);

export default SearchBar;

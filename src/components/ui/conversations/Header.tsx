import React, { FC } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { styles } from "../../../app/chat/ConversationsListScreen";

// Definindo que o componente é do tipo FC (Functional Component)
interface HeaderProps {
  goBack: () => void;
  isDarkMode: boolean;
}

const Header: FC<HeaderProps> = ({ goBack, isDarkMode }) => (
  <View style={[styles.header, isDarkMode && styles.darkHeader]}>
    <TouchableOpacity onPress={goBack}>
      <ChevronLeft size={28} color={isDarkMode ? "#fff" : "#000"} />
    </TouchableOpacity>
    <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
      Mensagens
    </Text>
  </View>
);

export default Header;

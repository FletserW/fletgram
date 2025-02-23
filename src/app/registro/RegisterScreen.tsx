import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { LucideInstagram, Facebook } from "lucide-react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../../constants/types";
import { Button } from "../../components/ui/Button";
import { InputField } from "../../components/ui/InputField";
import { SelectText } from "../../components/ui/SelectText";
import { style } from "./style";
import { registerUser } from "../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const userData = { full_name: fullName, username, email, password };
    console.log("Dados do formulário enviados:", JSON.stringify(userData, null, 2));

    try {
      const response = await registerUser(userData);
      console.log("Resposta do servidor:", response);

      if (response?.status === 400) {
        Alert.alert("Erro de validação", JSON.stringify(response?.data || {}));
      }

      if (response.id) {
        // Salvando o ID do usuário no AsyncStorage
        await AsyncStorage.setItem("id", String(response.id)); 

        Alert.alert("Sucesso", "Conta criada com sucesso!");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "tabs" }],
          })
        );
      } else {
        Alert.alert("Erro", response?.message || "Erro ao registrar usuário.");
      }
    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Erro", "Erro ao registrar. Tente novamente.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={style.container}>
            <View style={style.logo}>
              <LucideInstagram size={48} color="black" />
              <Text style={{ fontSize: 50 }}>Fletgram</Text>
            </View>
            <Text style={style.subtitle}>
              Cadastre-se para ver fotos e vídeos dos seus amigos
            </Text>
            <View style={style.form}>
              <Button
                buttonText="Entrar com Facebook"
                onPress={() => {
                  Alert.alert("Em breve");
                }}
                icon={<Facebook size={24} color="white" />}
              />
              <View style={style.separatorContainer}>
                <View style={style.separator} />
                <Text style={style.separatorText}>ou</Text>
                <View style={style.separator} />
              </View>
              <InputField
                placeholder="Nome Completo"
                onChangeText={setFullName}
              />
              <InputField
                placeholder="Nome de usuário"
                onChangeText={setUsername}
              />
              <InputField placeholder="Email" onChangeText={setEmail} />
              <InputField
                secureText={true}
                placeholder="Senha"
                onChangeText={setPassword}
              />
              <Button buttonText="Cadastrar-se" onPress={handleRegister} />
            </View>
            <Text style={style.terms}>
              Ao se cadastrar, você concorda com os nossos termos, políticas de
              dados e política de cookies.
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

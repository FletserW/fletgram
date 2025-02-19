import {
  View,
  Text,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NavigationProps } from "../constants/types";
import { useState, useEffect } from "react";
import { LucideInstagram } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { SelectText } from "../components/ui/SelectText";
import { loginUser } from "../services/authService";
import { style } from "./registro/style";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const isWeb = width > 800;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "tabs" }],
          })
        );
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    const credentials = { email, password };
    try {
      const response = await loginUser(credentials);
      if (response.token && response.id) {
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("id", response.id.toString());

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "tabs" }],
          })
        );
      } else {
        Alert.alert("Erro", response.message || "Credenciais inválidas.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={style.container}>
            {/* Logo */}
            <View style={style.logo}>
              <LucideInstagram size={isWeb ? 36 : 48} color="black" />
              <Text style={[style.logoText, { fontSize: isWeb ? 40 : 50 }]}>Fletgram</Text>
            </View>

            {/* Formulário */}
            <View style={style.form}>
              <InputField placeholder="Email" onChangeText={setEmail} />
              <InputField secureText={true} placeholder="Senha" onChangeText={setPassword} />
              <SelectText text="Esqueceu a senha?" onPress={() => {}} style={[style.text, { alignSelf: "flex-end" }]} />
              <Button buttonText="Login" onPress={handleLogin} />

              <View style={style.separatorContainer}>
                <View style={style.separator} />
                <Text style={style.separatorText}>ou</Text>
                <View style={style.separator} />
              </View>

              <SelectText text="Entrar com Facebook" onPress={() => {Alert.alert("Em breve");}} />
            </View>

            {/* Footer */}
            <View style={style.footer}>
              <View style={style.separatorContainer}>
                <View style={style.separator} />
                <View style={style.separator} />
              </View>
              <View style={style.flex}>
                <Text>Não tem uma conta?</Text>
                <SelectText text="Cadastre-se" onPress={() => navigation.navigate("RegisterScreen")} />
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from "react";
import { TextInput, TextInputProps, View, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native"; // Ícones para visibilidade
import { style } from "./style";

type Props = TextInputProps & {
  secureText?: boolean; // Propriedade opcional para saber se é um campo de senha
};

export function InputField({ secureText, ...rest }: Props) {
  // Estado para controlar se a senha está visível ou não
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState);
  };

  return (
    <View style={style.inputContainer}>
      <TextInput
        secureTextEntry={secureText && !isPasswordVisible} // Se secureText for true, usa o estado para alternar
        style={style.input}
        {...rest} // Passa todas as props recebidas
      />
      
      {secureText && (
        // Se for um campo de senha, exibe o ícone para alternar a visibilidade
        <TouchableOpacity onPress={togglePasswordVisibility} style={style.icon}>
          {isPasswordVisible ? <Eye size={24} color="black" /> : <EyeOff size={24} color="black" />}
        </TouchableOpacity>
      )}
    </View>
  );
}


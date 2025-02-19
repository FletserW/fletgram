import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps, TextProps, View } from "react-native";
import { Facebook } from "lucide-react-native"; 
import { style } from "./style";

// Definindo o tipo de Props corretamente
type Props = TouchableOpacityProps & {
  buttonText: string;  // Texto do botão
  icon?: React.ReactNode; // Ícone opcional
};

export function Button({ buttonText, icon, ...rest }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={style.button} {...rest}>
      <View style={style.button}>
        {/* Exibindo o ícone, se fornecido */}
        {icon && <View style={style.icon}>{icon}</View>}
        <Text style={style.buttonText}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
}

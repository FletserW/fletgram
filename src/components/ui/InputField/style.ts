import { StyleSheet } from "react-native";

export const style = StyleSheet.create({

      inputContainer: {
        flexDirection: "row", // Alinha o ícone e o campo de texto horizontalmente
        alignItems: "center", // Alinha verticalmente os elementos
        borderColor: 'gray',
        borderRadius: 8,
        padding: 5,
        width: '100%',
        marginBottom: 10,

      },
      input: {
        flex: 1, // O campo de texto ocupa todo o espaço disponível
        padding: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
      },
      icon: {
        marginLeft: 10, // Espaçamento entre o campo de texto e o ícone
      },
})
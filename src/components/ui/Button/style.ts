import { StyleSheet } from "react-native";

export const style = StyleSheet.create({

  button: {
    flexDirection: "row", // Alinha o ícone e o texto lado a lado
    backgroundColor: "#9d3520", // Cor do botão
    paddingVertical: 5, // Ajuste o padding conforme necessário
    borderRadius: 8, // Borda arredondada
    alignItems: "center", // Alinha verticalmente o conteúdo do botão
    width: "100%", // Faz o botão ocupar toda a largura disponível
    justifyContent: "center",
    textAlign: "center",
    marginBottom: 10, // Espaçamento inferior
    marginTop: 20,
    },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10, // Espaçamento entre o ícone e o texto
    fontWeight: 'bold',
  },
  buttonContent: {
    flexDirection: "row", // Coloca o ícone e o texto em linha
    alignItems: "center", // Alinha verticalmente
  },
  icon: {
    marginRight: 1, // Espaçamento entre o ícone e o texto
  },
  })
      

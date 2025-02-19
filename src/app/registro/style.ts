import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
  },
  logo: {
    marginBottom: 60,
    marginTop: 80,
    alignItems: "center",
    width: "100%",
  },
  logoText: {
    fontSize: 50,
    fontWeight: "bold",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#666", 
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  terms: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  text: {
    color: "#9d3520",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 32,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "gray",
  },
  separatorText: {
    marginHorizontal: 8,
    color: "gray",
  },
  footer: {
    marginTop: 20, // Garante espaço entre o formulário e o rodapé
    alignItems: "center",
    width: "100%",
  },
  flex: {
    flexDirection: "row",
    justifyContent: "center", // Centraliza horizontalmente
    gap: 5, // Espaçamento entre os itens
  },
});

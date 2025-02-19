import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "white",
  },
  logo: {
    position: "absolute",
    top: 30,
    alignItems: "center",
    width: "100%",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  text: {
    color: "#9d3520",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 32,
  },
  subtitle:{
    fontSize: 20,
    color: '#b9b9b9',
    textAlign: "center",
    marginBottom: 20,
    marginTop: 100,
    
  },
  terms:{
    fontSize: 15,
    color: '#b9b9b9',
    textAlign: "center",
    marginBottom: 10,
    marginTop: 20,
    
  },
  flex: {
    flexDirection: "row", // Garante que os elementos fiquem lado a lado
    gap: 5, // Adiciona espaçamento entre os itens (pode ser `marginRight` no primeiro item)
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
    position: "absolute",
    bottom: 10,
    alignItems: "center",
    width: "100%",
  },
});

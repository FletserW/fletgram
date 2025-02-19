import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    base: {
      backgroundColor: "white"
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingTop: 20,
      },
      scrollContent: {
        paddingBottom: 20, // Adiciona padding ao final do conteúdo para evitar corte
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
      },
      headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
        marginLeft: 10,
      },
      avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
      },
      avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ddd",
      },
      editAvatarText: {
        color: '#9d3520',
        marginTop: 5,
      },
      input: {
        backgroundColor: "#f0f0f0",
        color: "black",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
      },
      sectionTitle: {
        color: "gray",
        marginTop: 15,
        marginBottom: 5,
      },
      musicSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      },
      musicText: {
        color: "black",
      },
      musicLink: {
        color: '#9d3520',
      },
      switchContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
      },
      switchTextContainer: {
        flex: 1,
      },
      switchTitle: {
        fontWeight: "bold",
        color: "black",
      },
      switchDescription: {
        color: "gray",
        fontSize: 12,
      },
 

})
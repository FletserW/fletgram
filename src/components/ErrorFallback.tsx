import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: React.ReactNode;
}

// Função que lida com erros (opcional: pode enviar logs para um servidor)
const logErrorToService = (error: Error, info: { componentStack: string }) => {
  console.error("Erro capturado:", error);
  console.error("Stack trace:", info.componentStack);
};

// Componente de fallback para quando ocorrer um erro
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Algo deu errado! 😢</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Button title="Tentar novamente" onPress={resetErrorBoundary} />
    </View>
  );
};

// Componente de Boundary para envolver a aplicação
export const GlobalErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logErrorToService}>
      {children}
    </ErrorBoundary>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8d7da",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#721c24",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#721c24",
    textAlign: "center",
    marginBottom: 20,
  },
});

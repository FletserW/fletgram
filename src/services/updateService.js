import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Share from 'react-native-share';
import DeviceInfo from 'react-native-device-info';
import { BASE_URL } from "../constants/config";

const API_UPDATE_URL = `${BASE_URL}/update/latest`; // URL da API que retorna a versão mais recente

export const checkForUpdate = async () => {
    try {
      const currentVersion = DeviceInfo.getVersion(); // ✅ Obtém a versão do app (sem Hooks)
      console.log("Versão atual do app:", currentVersion);
  
      const response = await fetch(API_UPDATE_URL);
      const data = await response.json();
      const latestVersion = data.version;
      const apkUrl = data.url;
  
      console.log("Última versão disponível:", latestVersion);
      console.log("URL do APK:", apkUrl);
  
      if (latestVersion !== currentVersion) {
        Alert.alert(
          "Atualização Disponível",
          `Nova versão ${latestVersion} disponível. Deseja atualizar agora?`,
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Atualizar", onPress: () => downloadAndInstallAPK(apkUrl) },
          ]
        );
      } else {
        Alert.alert("Seu app já está atualizado!");
      }
    } catch (error) {
      console.error("Erro ao verificar atualização:", error);
      Alert.alert("Erro", "Não foi possível verificar atualizações.");
    }
  };
  
  const downloadAndInstallAPK = async (apkUrl) => {
    try {
      if (Platform.OS !== 'android') {
        Alert.alert("Atualização automática só funciona no Android.");
        return;
      }
  
      const apkPath = `${FileSystem.cacheDirectory}update.apk`;
      console.log("Baixando APK para:", apkPath);
  
      const downloadResumable = FileSystem.createDownloadResumable(apkUrl, apkPath);
      const { uri } = await downloadResumable.downloadAsync();
      console.log("Download concluído:", uri);
  
      await Share.open({
        url: uri,
        type: "application/vnd.android.package-archive",
      });
  
    } catch (error) {
      console.error("Erro ao baixar e instalar APK:", error);
      Alert.alert("Erro", "Não foi possível baixar a atualização.");
    }
  };
  
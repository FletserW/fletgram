import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Home: undefined;
  RegisterScreen: undefined;
  tabs: undefined;
  FindPeopleScreen: undefined;
  SettingsScreen: undefined;
  ProfileScreen: undefined;
  SecurityScreen: undefined;q
  PersonalDataScreen: undefined;
  UpLoadPostScreen: undefined;
  TempTabs: undefined;
  ProfileScreen2: undefined;
  Temps: undefined;
};

// types.ts
export interface Post {
  id: number;
  userId: number;
  content: string;
  image_url: string[];
  imageUrl: string;
  username: string;
  profilePicture: string;
  createdAt: string;
  likes: number;
  liked?: boolean;
}


// Tipo para a navegação
export type NavigationProps = StackNavigationProp<RootStackParamList>;

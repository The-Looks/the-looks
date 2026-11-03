import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, content, fonts } from '../services/shared/theme';
import { fontAssets } from '../services/shared/assets';
import * as auth from '../pages/guest/auth/screens';
import * as wardrobe from '../pages/user/wardrobe/screens';
import * as outfit from '../pages/user/outfit/screens';
import * as vote from '../pages/user/voting/screens';
import * as profile from '../pages/user/profile/screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = { Wardrobe: '👗', Home: '🏠', Outfit: '✨', Vote: '🗳️', Profile: '👤' };

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.purple,
      tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 11 },
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.line, height: 70, paddingBottom: 12, paddingTop: 8 },
      tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{tabIcon[route.name]}</Text>,
    })}>
      <Tab.Screen name="Home" component={wardrobe.Home} options={{ title: content.home }} />
      <Tab.Screen name="Wardrobe" component={wardrobe.Wardrobe} options={{ title: content.wardrobe }} />
      <Tab.Screen name="Outfit" component={outfit.AIOutfit} options={{ title: content.outfit }} />
      <Tab.Screen name="Vote" component={vote.Vote} options={{ title: content.voting }} />
      <Tab.Screen name="Profile" component={profile.Profile} options={{ title: content.profile }} />
    </Tab.Navigator>
  );
}

// Registry of every stack screen (Tabs host Home / Wardrobe / AIOutfit / Vote / Profile)
const stackScreens = {
  Onboarding: auth.Onboarding, Login: auth.Login, Register: auth.Register,
  ChooseStyle: auth.ChooseStyle, ChooseColor: auth.ChooseColor, StartWardrobe: auth.StartWardrobe,
  AddItem: wardrobe.AddItem, ItemDetail: wardrobe.ItemDetail, Search: wardrobe.Search,
  Filter: wardrobe.Filter, WardrobeStats: wardrobe.WardrobeStats,
  AIOutfit: outfit.AIOutfit, Tryon3D: outfit.Tryon3D, AdjustSize: outfit.AdjustSize,
  SavedOutfits: outfit.SavedOutfits, CreateOutfit: outfit.CreateOutfit, SwapItem: outfit.SwapItem,
  OutfitDetail: outfit.OutfitDetail, Calendar: outfit.Calendar, CalendarDetail: outfit.CalendarDetail,
  Shopping: outfit.Shopping, AISettings: outfit.AISettings, PhotoGuide: outfit.PhotoGuide,
  CreateVote: vote.CreateVote, ShareResult: vote.ShareResult, Voters: vote.Voters,
  VoteDetail: vote.VoteDetail, Comments: vote.Comments,
  Notifications: profile.Notifications, Premium: profile.Premium, Settings: profile.Settings,
  About: profile.About, EditProfile: profile.EditProfile,
};

export default function App() {
  const [loaded] = useFonts({
    [fonts.headSemi]: fontAssets.head600,
    [fonts.head]: fontAssets.head700,
    [fonts.body]: fontAssets.body400,
    [fonts.bodySemi]: fontAssets.body600,
    [fonts.bodyBold]: fontAssets.body700,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            {Object.entries(stackScreens).map(([name, comp]) => <Stack.Screen key={name} name={name} component={comp} />)}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import './src/i18n';

import SplashScreen from './src/screens/auth/SplashScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import PhoneScreen from './src/screens/auth/PhoneScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import StoreSetupScreen from './src/screens/auth/StoreSetupScreen';

import DashboardScreen from './src/screens/owner/DashboardScreen';
import OrdersScreen from './src/screens/owner/OrdersScreen';
import OrderDetailScreen from './src/screens/owner/OrderDetailScreen';
import CreateOrderScreen from './src/screens/owner/CreateOrderScreen';
import DriversScreen from './src/screens/owner/DriversScreen';
import DriverDetailScreen from './src/screens/owner/DriverDetailScreen';
import RouteOptimizerScreen from './src/screens/owner/RouteOptimizerScreen';
import InventoryScreen from './src/screens/owner/InventoryScreen';
import InventoryDetailScreen from './src/screens/owner/InventoryDetailScreen';
import ForecastScreen from './src/screens/owner/ForecastScreen';
import InsightsScreen from './src/screens/owner/InsightsScreen';
import AnalyticsScreen from './src/screens/owner/AnalyticsScreen';
import SettingsScreen from './src/screens/owner/SettingsScreen';

import DriverHomeScreen from './src/screens/driver/HomeScreen';
import DriverOrdersScreen from './src/screens/driver/OrdersScreen';
import DeliveryScreen from './src/screens/driver/DeliveryScreen';
import BatchMapScreen from './src/screens/driver/BatchMapScreen';
import DriverHistoryScreen from './src/screens/driver/HistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3b82f6',
    primaryContainer: '#dbeafe',
    secondary: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    error: '#ef4444',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60a5fa',
    primaryContainer: '#1e3a5f',
    secondary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    error: '#f87171',
  },
};

function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => ( <Text style={{ fontSize: 22 }}>🏠</Text> ) }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarLabel: 'Orders', tabBarIcon: ({ color }) => ( <Text style={{ fontSize: 22 }}>📋</Text> ) }}
      />
      <Tab.Screen
        name="Drivers"
        component={DriversScreen}
        options={{ tabBarLabel: 'Drivers', tabBarIcon: ({ color }) => ( <Text style={{ fontSize: 22 }}>👥</Text> ) }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ tabBarLabel: 'Stock', tabBarIcon: ({ color }) => ( <Text style={{ fontSize: 22 }}>📦</Text> ) }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings', tabBarIcon: ({ color }) => ( <Text style={{ fontSize: 22 }}>⚙️</Text> ) }}
      />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DriverHomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="MyOrders"
        component={DriverOrdersScreen}
        options={{ tabBarLabel: 'Orders', tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text> }}
      />
      <Tab.Screen
        name="BatchMap"
        component={BatchMapScreen}
        options={{ tabBarLabel: 'Map', tabBarIcon: () => <Text style={{ fontSize: 22 }}>🗺️</Text> }}
      />
      <Tab.Screen
        name="History"
        component={DriverHistoryScreen}
        options={{ tabBarLabel: 'History', tabBarIcon: () => <Text style={{ fontSize: 22 }}>📊</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { theme } = useAuthStore();
  const paperTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer
          theme={theme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#f8fafc' },
              animation: 'slide_from_right',
            }}
          >
            {/* Auth Flow */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="StoreSetup" component={StoreSetupScreen} />

            {/* Owner Flow */}
            <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="CreateOrder" component={CreateOrderScreen} />
            <Stack.Screen name="DriverDetail" component={DriverDetailScreen} />
            <Stack.Screen name="RouteOptimizer" component={RouteOptimizerScreen} />
            <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
            <Stack.Screen name="Forecast" component={ForecastScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />

            {/* Driver Flow */}
            <Stack.Screen name="DriverTabs" component={DriverTabs} />
            <Stack.Screen name="DeliveryScreen" component={DeliveryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}



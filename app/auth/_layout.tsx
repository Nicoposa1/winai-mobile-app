import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Register',
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          title: 'Authenticating',
        }}
      />
      <Stack.Screen
        name="complete-profile"
        options={{
          title: 'Complete Profile',
        }}
      />
      <Stack.Screen
        name="update-password"
        options={{
          title: 'Update Password',
        }}
      />
    </Stack>
  );
} 
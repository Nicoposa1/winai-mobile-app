import { Persistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: typeof ReactNativeAsyncStorage): Persistence;
} 
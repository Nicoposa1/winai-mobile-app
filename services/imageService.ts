import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

const apiKey = 'AIzaSyDPihgsrDMPUlPHD1RTssF1erIUaWJiZjQ'
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://generativelanguage.googleapis.com';

export interface WineAnalysisResponse {
  name: string;
  winery: string;
  year: string;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  country: string;
  region: string;
  flavorProfile: string;
  foodPairings: string[];
  fullDescription: string;
}

export interface ImagePickerResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Convertir imagen a base64
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const base64String = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64String;
  } catch (error) {
    console.error('Error al convertir imagen a base64:', error);
    throw error;
  }
};

export const analyzeWineImage = async (imageUri: string): Promise<WineAnalysisResponse | null> => {
  if (!imageUri) {
    return null;
  }

  try {
    // Convertir imagen a base64
    const base64Image = await imageToBase64(imageUri);
    
    // Crear la petición basada en la documentación oficial
    const endpoint = `${apiUrl}/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    console.log('Haciendo petición a:', endpoint.replace(apiKey || '', 'API_KEY_HIDDEN'));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { 
                text: `Analyze the provided image. If it shows a wine, provide two things:
                
                1. First, a JSON object with the following structure:
                {
                  "name": "Wine Name",
                  "winery": "Winery Name",
                  "year": "YYYY",
                  "type": "one of: red, white, rose, sparkling, other",
                  "country": "Country of Origin",
                  "region": "Wine Region",
                  "flavorProfile": "Brief description of flavors",
                  "foodPairings": ["Pairing 1", "Pairing 2", "Pairing 3"]
                }
                
                2. After the JSON object, provide a complete paragraph with a detailed description of the wine.
                
                If the image does not show a wine, simply return: {"error": "No wine detected in the image"}`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ]
      }),
    });

    console.log('Estado de la respuesta:', response.status);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += `, message: ${JSON.stringify(errorData)}`;
      } catch (e) {
        // Si no se puede parsear la respuesta como JSON, usar el texto
        const errorText = await response.text();
        errorMessage += `, message: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Respuesta recibida:', JSON.stringify(data).substring(0, 200) + '...');

    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content?.parts[0]?.text || '';
      
      if (responseText) {
        // Buscar el objeto JSON en la respuesta
        const jsonMatch = responseText.match(/{[\s\S]*?}/);
        
        if (jsonMatch && jsonMatch.index !== undefined) {
          try {
            const jsonData = JSON.parse(jsonMatch[0]);
            
            // Verificar si hay un error
            if (jsonData.error) {
              console.log('No se detectó un vino en la imagen:', jsonData.error);
              return null;
            }
            
            // Extraer la descripción completa (todo lo que está después del JSON)
            const fullDescription = responseText.substring(jsonMatch.index + jsonMatch[0].length).trim();
            
            // Combinar los datos
            return {
              ...jsonData,
              fullDescription
            };
          } catch (parseError) {
            console.error('Error al analizar la respuesta JSON:', parseError);
            return null;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al analizar la imagen:', error);
    throw error;
  }
};

// Request permissions for camera and media library
export async function requestPermissions(): Promise<boolean> {
  try {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}



// Take photo with camera
export async function takePhoto(): Promise<ImagePickerResult> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pics
      quality: 0.8,
    });

    if (result.canceled) {
      return { success: false };
    }

    return {
      success: true,
      imageUri: result.assets[0].uri
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to take photo'
    };
  }
}

// Pick from gallery
export async function pickFromGallery(): Promise<ImagePickerResult> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pics
      quality: 0.8,
    });

    if (result.canceled) {
      return { success: false };
    }

    return {
      success: true,
      imageUri: result.assets[0].uri
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to pick from gallery'
    };
  }
}

// Upload image to Supabase Storage
export async function uploadAvatar(imageUri: string, userId: string): Promise<UploadResult> {
  try {
    // Get file extension
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    // Add timestamp to filename to avoid caching issues
    const timestamp = Date.now();
    const fileName = `${userId}/avatar_${timestamp}.${fileExtension}`;

    // Delete previous avatars for this user to save storage space
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
      }
    } catch (deleteError) {
      console.log('Could not delete previous avatars:', deleteError);
      // Continue with upload even if deletion fails
    }

    // Read file using FileSystem instead of blob.arrayBuffer
    const fileData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Convert base64 to Uint8Array
    const bytes = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, bytes, {
        contentType: `image/${fileExtension}`,
        upsert: false // Don't upsert since we're using unique filenames
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image'
    };
  }
}

// Update user profile with new avatar URL
export async function updateProfileAvatar(userId: string, avatarUrl: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) {
      console.error('Profile update error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Profile update error:', error);
    return false;
  }
} 
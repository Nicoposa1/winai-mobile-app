const apiKey = process.env.EXPO_PUBLIC_API_KEY
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

// Convertir imagen a base64
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Extraer solo la parte base64 sin el prefijo data:image/jpeg;base64,
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
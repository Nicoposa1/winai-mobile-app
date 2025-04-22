import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Definimos los tipos
export interface Wine {
  id: string;
  name: string;
  year: number;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  winery: string;
  region?: string;
  country?: string;
  grapes?: string[];
  notes?: string;
  rating?: number;
  price?: number;
  imageUrl?: string;
  isFavorite: boolean;
}

interface WineState {
  wines: Wine[];
  favorites: string[]; // IDs de los vinos favoritos
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: WineState = {
  wines: [],
  favorites: [],
  loading: false,
  error: null,
};

// Creación del slice
const wineSlice = createSlice({
  name: 'wine',
  initialState,
  reducers: {
    // Añadir un nuevo vino
    addWine: (state, action: PayloadAction<Wine>) => {
      state.wines.push(action.payload);
      if (action.payload.isFavorite) {
        state.favorites.push(action.payload.id);
      }
    },
    
    // Eliminar un vino
    deleteWine: (state, action: PayloadAction<string>) => {
      state.wines = state.wines.filter(wine => wine.id !== action.payload);
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    
    // Actualizar un vino
    updateWine: (state, action: PayloadAction<Wine>) => {
      const index = state.wines.findIndex(wine => wine.id === action.payload.id);
      if (index !== -1) {
        state.wines[index] = action.payload;
        
        // Actualizar favoritos si es necesario
        const favoriteIndex = state.favorites.indexOf(action.payload.id);
        if (action.payload.isFavorite && favoriteIndex === -1) {
          state.favorites.push(action.payload.id);
        } else if (!action.payload.isFavorite && favoriteIndex !== -1) {
          state.favorites.splice(favoriteIndex, 1);
        }
      }
    },
    
    // Añadir a favoritos
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const wineId = action.payload;
      const wine = state.wines.find(w => w.id === wineId);
      
      if (wine) {
        wine.isFavorite = !wine.isFavorite;
        
        const favoriteIndex = state.favorites.indexOf(wineId);
        if (wine.isFavorite && favoriteIndex === -1) {
          state.favorites.push(wineId);
        } else if (!wine.isFavorite && favoriteIndex !== -1) {
          state.favorites.splice(favoriteIndex, 1);
        }
      }
    },
    
    // Establecer estado de carga
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Establecer un error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Cargar todos los vinos
    setWines: (state, action: PayloadAction<Wine[]>) => {
      state.wines = action.payload;
      state.favorites = action.payload
        .filter(wine => wine.isFavorite)
        .map(wine => wine.id);
    },
  },
});

// Exportamos acciones y reducer
export const { 
  addWine, 
  deleteWine, 
  updateWine, 
  toggleFavorite, 
  setLoading, 
  setError, 
  setWines 
} = wineSlice.actions;

export default wineSlice.reducer; 
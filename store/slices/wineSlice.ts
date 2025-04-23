import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tipo para los vinos
export interface Wine {
  id: string;
  name: string;
  winery: string;
  year: number;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  region?: string;
  country?: string;
  imageUrl?: string;
  isFavorite: boolean;
  hasTasted: boolean;
  daysToOptimal?: number;
  notes?: string;
  dateAdded: number; // timestamp
  rating?: number;
}

interface WineState {
  wines: Wine[];
  loading: boolean;
  error: string | null;
  selectedWineId: string | null;
}

// Estado inicial con datos de ejemplo
const initialState: WineState = {
  wines: [
    {
      id: '1',
      name: 'Malbec Reserva',
      winery: 'Bodega Catena Zapata',
      year: 2018,
      type: 'red',
      region: 'Mendoza',
      country: 'Argentina',
      imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe27770513b?q=80&w=500',
      isFavorite: true,
      hasTasted: true,
      daysToOptimal: 0,
      dateAdded: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 días atrás
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Chardonnay',
      winery: 'Bodega Norton',
      year: 2020,
      type: 'white',
      region: 'Valle de Uco',
      country: 'Argentina',
      imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=500',
      isFavorite: false,
      hasTasted: true,
      daysToOptimal: 0,
      dateAdded: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 días atrás
      rating: 4.0,
    },
    {
      id: '3',
      name: 'Cabernet Sauvignon',
      winery: 'Viña Concha y Toro',
      year: 2019,
      type: 'red',
      region: 'Valle del Maipo',
      country: 'Chile',
      imageUrl: 'https://images.unsplash.com/photo-1560148218-1a83060f7b32?q=80&w=500',
      isFavorite: true,
      hasTasted: false,
      daysToOptimal: 365,
      dateAdded: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 días atrás
      rating: 0,
    },
    {
      id: '4',
      name: 'Rosé Grenache',
      winery: 'Château Minuty',
      year: 2021,
      type: 'rose',
      region: 'Provence',
      country: 'France',
      imageUrl: 'https://images.unsplash.com/photo-1558346647-591613e57b73?q=80&w=500',
      isFavorite: false,
      hasTasted: true,
      daysToOptimal: 0,
      dateAdded: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 días atrás
      rating: 4.2,
    },
  ],
  loading: false,
  error: null,
  selectedWineId: null,
};

const wineSlice = createSlice({
  name: 'wine',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    addWine: (state, action: PayloadAction<Wine>) => {
      state.wines.push(action.payload);
    },
    
    updateWine: (state, action: PayloadAction<Wine>) => {
      const index = state.wines.findIndex(wine => wine.id === action.payload.id);
      if (index !== -1) {
        state.wines[index] = action.payload;
      }
    },
    
    deleteWine: (state, action: PayloadAction<string>) => {
      state.wines = state.wines.filter(wine => wine.id !== action.payload);
      // Si se elimina el vino seleccionado, limpiamos la selección
      if (state.selectedWineId === action.payload) {
        state.selectedWineId = null;
      }
    },
    
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.wines.findIndex(wine => wine.id === action.payload);
      if (index !== -1) {
        state.wines[index].isFavorite = !state.wines[index].isFavorite;
      }
    },
    
    toggleTasted: (state, action: PayloadAction<string>) => {
      const index = state.wines.findIndex(wine => wine.id === action.payload);
      if (index !== -1) {
        state.wines[index].hasTasted = !state.wines[index].hasTasted;
        
        // Si se marca como probado y no tiene puntuación, asignamos una por defecto
        if (state.wines[index].hasTasted && !state.wines[index].rating) {
          state.wines[index].rating = 3; // Puntaje por defecto
        }
      }
    },
    
    setRating: (state, action: PayloadAction<{ id: string, rating: number }>) => {
      const index = state.wines.findIndex(wine => wine.id === action.payload.id);
      if (index !== -1) {
        state.wines[index].rating = action.payload.rating;
        // Si se califica, automáticamente se marca como probado
        state.wines[index].hasTasted = true;
      }
    },
    
    selectWine: (state, action: PayloadAction<string>) => {
      state.selectedWineId = action.payload;
    },
    
    clearSelectedWine: (state) => {
      state.selectedWineId = null;
    },
  },
});

export const {
  setLoading,
  setError,
  addWine,
  updateWine,
  deleteWine,
  toggleFavorite,
  toggleTasted,
  setRating,
  selectWine,
  clearSelectedWine,
} = wineSlice.actions;

export default wineSlice.reducer; 
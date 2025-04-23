import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WineInfo {
  id: string;
  name: string;
  vintage: string;
  type: string;
  region: string;
  country: string;
  rating: number;
  notes: string;
  imageUri?: string;
}

interface AIAnalysisResult {
  confidence: number;
  wineInfo: WineInfo;
}

interface WineState {
  wines: WineInfo[];
  favorites: string[];
  recentlyViewed: string[];
  currentWine: WineInfo | null;
  analysisResult: AIAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WineState = {
  wines: [],
  favorites: [],
  recentlyViewed: [],
  currentWine: null,
  analysisResult: null,
  isLoading: false,
  error: null,
};

const wineSlice = createSlice({
  name: 'wine',
  initialState,
  reducers: {
    setWines: (state, action: PayloadAction<WineInfo[]>) => {
      state.wines = action.payload;
    },
    addWine: (state, action: PayloadAction<WineInfo>) => {
      state.wines.push(action.payload);
    },
    updateWine: (state, action: PayloadAction<WineInfo>) => {
      const index = state.wines.findIndex(wine => wine.id === action.payload.id);
      if (index !== -1) {
        state.wines[index] = action.payload;
      }
    },
    deleteWine: (state, action: PayloadAction<string>) => {
      state.wines = state.wines.filter(wine => wine.id !== action.payload);
      state.favorites = state.favorites.filter(id => id !== action.payload);
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== action.payload);
    },
    setCurrentWine: (state, action: PayloadAction<WineInfo | null>) => {
      state.currentWine = action.payload;
      if (action.payload) {
        // Add to recently viewed and ensure no duplicates
        state.recentlyViewed = [
          action.payload.id,
          ...state.recentlyViewed.filter(id => id !== action.payload.id)
        ].slice(0, 10); // Keep only 10 most recent
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const wineId = action.payload;
      const isFavorite = state.favorites.includes(wineId);
      
      if (isFavorite) {
        state.favorites = state.favorites.filter(id => id !== wineId);
      } else {
        state.favorites.push(wineId);
      }
    },
    setAnalysisResult: (state, action: PayloadAction<AIAnalysisResult | null>) => {
      state.analysisResult = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWines,
  addWine,
  updateWine,
  deleteWine,
  setCurrentWine,
  toggleFavorite,
  setAnalysisResult,
  setLoading,
  setError,
} = wineSlice.actions;

export default wineSlice.reducer; 
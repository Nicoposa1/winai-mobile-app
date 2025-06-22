export type WineType = 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Fortified';

export interface Wine {
  id: string;
  created_at: string;
  name: string;
  winery: string;
  region?: string | null;
  country?: string | null;
  year: number;
  grape?: string | null;
  type: WineType;
  rating?: number | null;
  notes?: string | null;
  image_url?: string | null;
  user_id: string;
  isFavorite?: boolean;
  hasTasted?: boolean;
  daysToOptimal?: number;
} 
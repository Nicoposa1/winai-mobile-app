import { supabase } from '../lib/supabase';
import { Wine } from '../types/wine'; // We'll need to create this type in the frontend as well

const API_URL = 'http://192.168.0.3:3000/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

export async function fetchWines(): Promise<Wine[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/wines`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch wines');
  }

  return response.json();
}

export async function createWine(wineData: Omit<Wine, 'id' | 'created_at' | 'user_id'>): Promise<Wine> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/wines`, {
    method: 'POST',
    headers,
    body: JSON.stringify(wineData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create wine');
  }

  return response.json();
} 
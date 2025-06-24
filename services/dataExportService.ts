import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface UserDataExport {
  exportDate: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
    provider: string;
  };
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    birth_date: string | null;
    avatar_url: string | null;
  } | null;
  wines: any[];
  preferences: {
    notifications: any;
    privacy: any;
  };
  statistics: {
    totalWines: number;
    favoriteWines: number;
    tastedWines: number;
    averageRating: number;
    winesByType: Record<string, number>;
    winesByCountry: Record<string, number>;
  };
}

export async function exportUserData(): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    console.log('🚀 Starting data export...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('👤 User found:', user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('⚠️ Profile error:', profileError);
    }

    // Get wines data (from local Redux store since we don't have Supabase wine table yet)
    // In a real app, this would be: 
    // const { data: wines, error: winesError } = await supabase
    //   .from('wines')
    //   .select('*')
    //   .eq('user_id', user.id);
    
    // For now, we'll use empty array or get from Redux store
    const wines: any[] = [];

    // Calculate statistics
    const statistics = {
      totalWines: wines.length,
      favoriteWines: wines.filter((wine: any) => wine.isFavorite).length,
      tastedWines: wines.filter((wine: any) => wine.hasTasted).length,
      averageRating: wines.length > 0 
        ? wines.reduce((sum: number, wine: any) => sum + (wine.rating || 0), 0) / wines.length 
        : 0,
      winesByType: wines.reduce((acc: Record<string, number>, wine: any) => {
        acc[wine.type] = (acc[wine.type] || 0) + 1;
        return acc;
      }, {}),
      winesByCountry: wines.reduce((acc: Record<string, number>, wine: any) => {
        if (wine.country) {
          acc[wine.country] = (acc[wine.country] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    // Prepare export data
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email || '',
        createdAt: user.created_at,
        provider: user.app_metadata?.providers?.[0] || 'email',
      },
      profile: profile || null,
      wines: wines,
      preferences: {
        notifications: {
          // This would come from a preferences table
          pushNotifications: true,
          wineRecommendations: true,
          priceAlerts: false,
        },
        privacy: {
          profileVisibility: 'private',
          dataSharing: false,
        },
      },
      statistics,
    };

    console.log('📊 Export data prepared:', {
      winesCount: exportData.wines.length,
      hasProfile: !!exportData.profile,
      userProvider: exportData.user.provider,
    });

    // Create file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `winai-data-export-${timestamp}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write data to file
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(exportData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    console.log('✅ Data export file created:', filePath);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar Datos de WinAI',
      });
    }

    return { 
      success: true, 
      filePath 
    };

  } catch (error: any) {
    console.error('❌ Data export error:', error);
    return { 
      success: false, 
      error: error.message || 'Error al exportar datos' 
    };
  }
}

export async function exportUserDataWithWines(winesFromRedux: any[]): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    console.log('🚀 Starting data export with Redux wines...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('⚠️ Profile error:', profileError);
    }

    // Use wines from Redux store
    const wines = winesFromRedux || [];

    // Calculate statistics
    const statistics = {
      totalWines: wines.length,
      favoriteWines: wines.filter((wine: any) => wine.isFavorite).length,
      tastedWines: wines.filter((wine: any) => wine.hasTasted).length,
      averageRating: wines.length > 0 
        ? wines.reduce((sum: number, wine: any) => sum + (wine.rating || 0), 0) / wines.length 
        : 0,
      winesByType: wines.reduce((acc: Record<string, number>, wine: any) => {
        acc[wine.type] = (acc[wine.type] || 0) + 1;
        return acc;
      }, {}),
      winesByCountry: wines.reduce((acc: Record<string, number>, wine: any) => {
        if (wine.country) {
          acc[wine.country] = (acc[wine.country] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    // Prepare export data
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email || '',
        createdAt: user.created_at,
        provider: user.app_metadata?.providers?.[0] || 'email',
      },
      profile: profile || null,
      wines: wines,
      preferences: {
        notifications: {
          pushNotifications: true,
          wineRecommendations: true,
          priceAlerts: false,
        },
        privacy: {
          profileVisibility: 'private',
          dataSharing: false,
        },
      },
      statistics,
    };

    // Create file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `winai-data-export-${timestamp}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write data to file
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(exportData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    console.log('✅ Data export file created:', filePath);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar Datos de WinAI',
      });
    }

    return { 
      success: true, 
      filePath 
    };

  } catch (error: any) {
    console.error('❌ Data export error:', error);
    return { 
      success: false, 
      error: error.message || 'Error al exportar datos' 
    };
  }
} 
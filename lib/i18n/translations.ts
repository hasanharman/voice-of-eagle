export const translations = {
  tr: {
    nav: {
      rumours: 'Söylentiler',
      lineup: 'Kadro',
      purpose: 'Amaç',
      notifications: 'Bildirimler',
      markAllAsRead: 'Tümünü okundu olarak işaretle'
    },
    lineup: {
      dropSubstituteHere: 'Yedeği sahaya bırak',
      dropToReplace: 'Oyuncunun üzerine bırakarak değiştir',
      noPlayersFound: 'Oyuncu bulunamadı',
      tryAdjustingSearch: 'Arama kriterlerinizi değiştirmeyi deneyin',
      searchPlayers: 'Oyuncu ara...',
      selectPlayer: 'Oyuncu Seç',
      choosePlayerForPosition: 'Bu pozisyon için bir oyuncu seçin',
      inLineup: 'Kadroda',
    },
    common: {
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı'
    }
  },
  en: {
    nav: {
      rumours: 'Rumours',
      lineup: 'Lineup', 
      purpose: 'Purpose',
      notifications: 'Notifications',
      markAllAsRead: 'Mark all as read'
    },
    lineup: {
      dropSubstituteHere: 'Drop substitute here',
      dropToReplace: 'Drop on player to substitute',
      noPlayersFound: 'No players found',
      tryAdjustingSearch: 'Try adjusting your search',
      searchPlayers: 'Search players...',
      selectPlayer: 'Select Player',
      choosePlayerForPosition: 'Choose a player for this position',
      inLineup: 'In lineup',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  }
} as const

export type TranslationKey = keyof typeof translations.tr

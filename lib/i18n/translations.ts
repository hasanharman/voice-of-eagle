export const translations = {
  tr: {
    nav: {
      rumours: 'Söylentiler',
      lineup: 'Kadro',
      purpose: 'Amaç',
      notifications: 'Bildirimler',
      markAllAsRead: 'Tümünü okundu olarak işaretle'
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
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  }
} as const

export type TranslationKey = keyof typeof translations.tr

export const APP_NAME = 'GuestMind'
export const DEFAULT_LANGUAGE = 'es'
export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt'] as const

// Will be set from Supabase auth or config
export const CURRENT_PROPERTY_ID = '00000000-0000-0000-0000-000000000000' // placeholder

export const CHECK_IN_FORM = {
  MIN_TOUCH_TARGET: 44, // px — Apple HIG minimum
  MAX_FORM_TIME_SECONDS: 180, // 3 minutes target
}

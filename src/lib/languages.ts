export const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'bash',
  'sql'
] as const

export type Language = (typeof LANGUAGES)[number]

/**
 * Reusable Tailwind utility class collections for consistent UI polish.
 * These utilities ensure a cohesive design system across all components.
 */

export const CARD_STYLES = {
  base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  hover: 'hover:shadow-md transition-shadow duration-200',
  interactive: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
} as const;

export const BUTTON_STYLES = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200',
  tertiary: 'text-gray-600 hover:text-gray-900 transition-colors duration-200',
  ghost: 'text-gray-600 hover:bg-gray-50 transition-colors duration-200',
} as const;

export const INPUT_STYLES = {
  base: 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  error: 'px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
  disabled: 'px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed',
} as const;

export const MODAL_STYLES = {
  backdrop: 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300',
  container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  content: 'bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300',
  header: 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between',
  body: 'p-6',
} as const;

export const BADGE_STYLES = {
  primary: 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium',
  success: 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium',
  warning: 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium',
  error: 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium',
  neutral: 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium',
} as const;

export const SPACING_TOKENS = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  base: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
} as const;

export const SHADOW_TOKENS = {
  soft: 'shadow-sm',
  subtle: 'shadow-base',
  medium: 'shadow-md',
  elevated: 'shadow-lg',
  modal: 'shadow-2xl',
} as const;

export const BORDER_TOKENS = {
  subtle: 'border border-gray-100',
  soft: 'border border-gray-200',
  medium: 'border border-gray-300',
  strong: 'border border-gray-400',
} as const;

export const TEXT_STYLES = {
  heading1: 'text-3xl font-bold text-gray-900',
  heading2: 'text-2xl font-bold text-gray-900',
  heading3: 'text-lg font-semibold text-gray-900',
  body: 'text-base text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  bodeTiny: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
} as const;

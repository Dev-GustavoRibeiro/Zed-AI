import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// ========================================
// Background Gradient Types
// ========================================
export interface BackgroundGradientConfig {
  triangleSize?: number;
  bleed?: number;
  noise?: number;
  animationOffset?: number;
  pointVariationX?: number;
  pointVariationY?: number;
  pointAnimationSpeed?: number;
  maxFps?: number;
  colors?: string[];
  particleSettings?: {
    count: number;
  };
}

export interface BackgroundGradientProps {
  children: React.ReactNode;
  themeName?: 'dark' | 'light';
  config?: BackgroundGradientConfig;
}

// ========================================
// User Types
// ========================================
export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

// ========================================
// Header Types
// ========================================
export interface SearchOption {
  label: string;
  link: string;
}

export interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  user?: User;
  title?: string;
}

// ========================================
// Sidebar Types
// ========================================
export interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  pathname?: string;
  router?: AppRouterInstance;
}

// ========================================
// Card Types
// ========================================
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

// ========================================
// Button Types
// ========================================
export type ButtonVariant = 
  | 'default' 
  | 'ghost' 
  | 'outline' 
  | 'primary' 
  | 'secondary' 
  | 'gold' 
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

// ========================================
// Input Types
// ========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

// ========================================
// Typography Types
// ========================================
export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'large' 
  | 'base' 
  | 'small' 
  | 'caption';

export type TypographyColor = 
  | 'default' 
  | 'muted' 
  | 'primary' 
  | 'secondary' 
  | 'white' 
  | 'error' 
  | 'success';

export interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
}

// ========================================
// Avatar Types
// ========================================
export interface AvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ========================================
// Badge Types
// ========================================
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'gold' | 'success' | 'warning' | 'destructive';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}


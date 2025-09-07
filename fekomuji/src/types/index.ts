export interface EventCategory {
  id: number;
  name: string;
  description: string;
  image: string;
  color: string;
  icon: string;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  url?: string;
}

export interface RegistrationStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface NavItem {
  name: string;
  href: string;
  current: boolean;
}

export interface ScrollAnimationHook {
  scrollY: number;
  isVisible: boolean;
  elementRef: React.RefObject<HTMLElement>;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImage: string;
}

export interface AboutContent {
  title: string;
  description: string[];
  stats: {
    value: string;
    label: string;
  }[];
}

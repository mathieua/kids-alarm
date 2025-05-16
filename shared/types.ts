export interface Alarm {
  id: string;
  time: string;
  days: string[];
  enabled: boolean;
  sound: string;
  label?: string;
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'holiday' | 'event';
  description?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
}

export interface MusicFile {
  id: string;
  title: string;
  path: string;
  duration: number;
}

export interface LullabySettings {
  duration: number;
  volume: number;
  fadeOut: boolean;
  selectedMusic: string;
} 
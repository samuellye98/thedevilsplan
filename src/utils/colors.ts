export type Color = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
export const COLORS: Record<Color, string> = {
  RED: '#DB4437',
  GREEN: '#0F9D58',
  BLUE: '#4285F4',
  YELLOW: '#F4B400',
};

export type SelectedColor = 'yellow' | 'white';
export const SELECTED_COLORS: Record<SelectedColor, string> = {
  yellow: '#ff0',
  white: '#fff',
};

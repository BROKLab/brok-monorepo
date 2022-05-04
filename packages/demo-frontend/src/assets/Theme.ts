import { ThemeType } from 'grommet';
import { deepFreeze } from 'grommet/utils';

export const Theme: ThemeType = deepFreeze({
  rounding: 4,
  spacing: 24,
  defaultMode: 'light',
  global: {
    font: {
      family: 'Open Sans, sans-serif',
    },
    colors: {
      green: {
        light: '#00aa79',
        dark: '#00aa79',
      },
      mint: {
        light: '#cdece2',
        dark: '#cdece2',
      },
      yellow: {
        light: '#E8A74A',
        dark: '#E8A74A',
      },
      red: {
        light: '#cd465e',
        dark: '#cd465e',
      },
      white: {
        light: '#ffffff',
        dark: '#ffffff',
      },
      blue: {
        light: '#013551',
        dark: '#0d4fa7',
      },
      grey: {
        light: '#f1f1f1',
        dark: '#f1f1f1',
      },
      black: {
        light: '#333333',
        dark: '#333333',
      },
      background: 'white',
      'background-back': 'white',
      'background-front': 'grey',
      'background-contrast': 'grey',
      brand: 'blue',
      'status-ok': 'green',
      'status-warning': 'yellow',
      'status-error': 'red',
      'status-critical': 'red',
      'status-disabled': 'mint',
      'status-unknown': 'blue',
      focus: 'brand',
      text: {
        light: '#333',
        dark: '#ffffff',
      },
      control: 'brand',
      active: 'brand',
      selected: 'brand',
      icon: 'brand',
    },
    active: {
      color: '#fff',
    },
    control: {
      border: {
        radius: '0px',
      },
    },
    focus: {
      border: {
        color: '#e6ebee',
      },
      shadow: {
        size: '1px',
      },
    },
  },
  button: {
    size: {
      border: {
        radius: '0px',
      },
      small: {
        border: {
          radius: '0px',
        },
      },
      medium: {
        border: {
          radius: '0px',
        },
      },
      large: {
        border: {
          radius: '0px',
        },
      },
    },
  },
});

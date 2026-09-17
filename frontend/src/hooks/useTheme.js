import { useEffect } from 'react';
import { applyTheme } from '../utils/theme';

export function useTheme() {
  useEffect(() => {
    applyTheme();
  }, []);
}

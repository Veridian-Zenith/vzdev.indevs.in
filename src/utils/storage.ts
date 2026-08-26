//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

export const readLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
};

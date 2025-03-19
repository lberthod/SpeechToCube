// utils.js
export function generateUniqueId(prefix = 'id_') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  
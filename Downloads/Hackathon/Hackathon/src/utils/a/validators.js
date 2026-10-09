export function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }
export function isValidPassword(p){ return p.length>=8 && /\d/.test(p) }
export function isValidName(n){ return n.trim().length>=2 }
export function isValidPhone(p){ return /^[6-9]\d{9}$/.test(p) }
export function isValidPincode(p){ return /^\d{6}$/.test(p) }

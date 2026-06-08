// Parse an ingredient amount string into a number for scaling
// Handles: "1", "1.5", "½", "1½", "1/2", "3 cloves", "to taste"
const FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667, '⅛': 0.125 };

export function parseAmount(str) {
  if (!str || str === 'to taste' || str === 'as needed') return null;
  let s = str.trim();

  // Replace unicode fractions
  Object.entries(FRACTIONS).forEach(([f, v]) => { s = s.replace(f, ` ${v}`); });

  // Extract leading number(s) — handles "1 1/2", "2.5", "3"
  const match = s.match(/^([\d\s./]+)/);
  if (!match) return null;

  const parts = match[1].trim().split(/\s+/);
  let total = 0;
  for (const part of parts) {
    if (part.includes('/')) {
      const [n, d] = part.split('/');
      total += parseFloat(n) / parseFloat(d);
    } else {
      total += parseFloat(part) || 0;
    }
  }
  return total || null;
}

// Format a number back to a nice fraction string
export function formatAmount(num) {
  if (num === null) return '';

  const whole = Math.floor(num);
  const decimal = num - whole;

  const fracs = [
    [0, ''],
    [0.125, '⅛'],
    [0.25, '¼'],
    [0.333, '⅓'],
    [0.5, '½'],
    [0.667, '⅔'],
    [0.75, '¾'],
  ];

  // Find closest fraction
  let closest = fracs[0];
  let minDiff = Infinity;
  for (const frac of fracs) {
    const diff = Math.abs(decimal - frac[0]);
    if (diff < minDiff) { minDiff = diff; closest = frac; }
  }

  // If close enough to a whole number
  if (minDiff < 0.06) {
    const roundedWhole = whole + (closest[0] > 0.9 ? 1 : 0);
    const fracStr = closest[0] > 0.9 ? '' : closest[1];
    if (roundedWhole === 0) return fracStr || '0';
    return fracStr ? `${roundedWhole} ${fracStr}` : `${roundedWhole}`;
  }

  // Fallback to 1 decimal
  return whole ? `${whole} ${closest[1]}`.trim() : closest[1] || num.toFixed(1);
}

// Scale an ingredient amount string by a multiplier
export function scaleAmount(amountStr, multiplier) {
  if (!amountStr || multiplier === 1) return amountStr;
  if (amountStr === 'to taste' || amountStr === 'as needed') return amountStr;

  const num = parseAmount(amountStr);
  if (num === null) return amountStr;

  // Keep the unit suffix (everything after the number)
  const unitMatch = amountStr.replace(/[½¼¾⅓⅔⅛]/g, '0').match(/^[\d\s./]+(.*)$/);
  const unit = unitMatch ? unitMatch[1].trim() : '';

  const scaled = num * multiplier;
  return unit ? `${formatAmount(scaled)} ${unit}` : formatAmount(scaled);
}

// Detect if a recipe is high protein based on ingredient names
export function isHighProtein(ingredients = []) {
  const HIGH_PROTEIN = [
    'chicken', 'beef', 'turkey', 'pork', 'salmon', 'tuna', 'shrimp',
    'egg', 'greek yogurt', 'cottage cheese', 'tofu', 'tempeh', 'edamame',
    'black beans', 'lentils', 'chickpeas', 'ground beef', 'steak', 'chuck',
  ];
  const text = ingredients.map(i => i.item.toLowerCase()).join(' ');
  const matches = HIGH_PROTEIN.filter(p => text.includes(p));
  return matches.length >= 1 && (
    matches.some(p => ['chicken', 'beef', 'turkey', 'pork', 'salmon', 'tuna', 'shrimp', 'ground beef', 'steak', 'chuck'].includes(p)) ||
    matches.length >= 2
  );
}

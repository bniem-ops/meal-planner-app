// CORS proxies - try in order, fall back if one fails
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

// Fetch HTML through a CORS proxy
async function fetchHtml(url) {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const data = await res.json();
      // allorigins wraps in { contents: '...' }
      return data.contents || data;
    } catch {
      continue;
    }
  }
  throw new Error('Could not fetch the page. The site may block external requests.');
}

// ── Schema.org JSON-LD parser (works on ~70% of recipe sites) ──────────────
function parseJsonLd(html) {
  const scriptMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scriptMatches) {
    try {
      const json = JSON.parse(match[1].trim());
      const schemas = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
      for (const schema of schemas) {
        if (schema['@type'] === 'Recipe' || schema['@type']?.includes?.('Recipe')) {
          return extractFromSchema(schema);
        }
      }
    } catch { continue; }
  }
  return null;
}

function extractFromSchema(schema) {
  const name = schema.name || '';
  const description = schema.description || '';

  // Cook time - PT30M or PT1H30M format
  const rawTime = schema.totalTime || schema.cookTime || schema.prepTime || '';
  const time = parseDuration(rawTime);

  // Servings
  const yield_ = schema.recipeYield;
  const servings = parseServings(Array.isArray(yield_) ? yield_[0] : yield_);

  // Ingredients
  const rawIngredients = schema.recipeIngredient || [];
  const ingredientText = rawIngredients.join('\n');

  // Steps
  const rawSteps = schema.recipeInstructions || [];
  const steps = flattenSteps(rawSteps);
  const stepText = steps.join('\n');

  // Protein detection
  const protein = detectProtein(name + ' ' + ingredientText);

  return { name, description, time, servings, ingredientText, stepText, protein };
}

// ── Heuristic HTML parser (fallback) ──────────────────────────────────────
function parseHeuristic(html) {
  // Strip scripts and styles
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ');

  // Try to find ingredient-like lines
  const lines = clean.split(/[.!?\n]/).map(l => l.trim()).filter(Boolean);
  
  const ingredientLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return (
      line.length < 100 &&
      /\d/.test(line) &&
      (lower.includes('cup') || lower.includes('tbsp') || lower.includes('tsp') ||
       lower.includes('oz') || lower.includes('lb') || lower.includes('pound') ||
       lower.includes('clove') || lower.includes('slice') || lower.includes('can'))
    );
  }).slice(0, 20);

  const stepLines = lines.filter(line => {
    return (
      line.length > 30 && line.length < 400 &&
      (line.toLowerCase().includes('heat') || line.toLowerCase().includes('cook') ||
       line.toLowerCase().includes('add') || line.toLowerCase().includes('stir') ||
       line.toLowerCase().includes('bake') || line.toLowerCase().includes('mix') ||
       line.toLowerCase().includes('place') || line.toLowerCase().includes('remove') ||
       line.toLowerCase().includes('combine') || line.toLowerCase().includes('season'))
    );
  }).slice(0, 12);

  if (ingredientLines.length < 2 || stepLines.length < 2) return null;

  // Try to grab title from <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const name = titleMatch
    ? titleMatch[1].replace(/\s*[-|].*$/, '').trim()
    : 'Imported Recipe';

  const ingredientText = ingredientLines.join('\n');
  const stepText = stepLines.join('\n');
  const protein = detectProtein(name + ' ' + ingredientText);

  return { name, description: '', time: 30, servings: 4, ingredientText, stepText, protein };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function parseDuration(iso) {
  if (!iso) return 30;
  const hours = iso.match(/(\d+)H/)?.[1] || 0;
  const mins  = iso.match(/(\d+)M/)?.[1] || 0;
  return parseInt(hours) * 60 + parseInt(mins) || 30;
}

function parseServings(raw) {
  if (!raw) return 4;
  const n = parseInt(String(raw).replace(/\D.*/, ''));
  return isNaN(n) ? 4 : n;
}

function flattenSteps(instructions) {
  const steps = [];
  for (const inst of instructions) {
    if (typeof inst === 'string') {
      steps.push(inst.trim());
    } else if (inst['@type'] === 'HowToStep') {
      steps.push((inst.text || inst.name || '').trim());
    } else if (inst['@type'] === 'HowToSection' && inst.itemListElement) {
      for (const sub of inst.itemListElement) {
        steps.push((sub.text || sub.name || '').trim());
      }
    }
  }
  return steps.filter(Boolean);
}

function detectProtein(text) {
  const lower = text.toLowerCase();
  const hasBeef = /ground beef|chuck|beef|steak|brisket|sirloin/.test(lower);
  const hasChicken = /chicken|poultry/.test(lower);
  if (hasBeef && !hasChicken) return 'beef';
  if (hasChicken && !hasBeef) return 'chicken';
  if (hasChicken) return 'chicken';
  return 'other';
}

// ── Main export ────────────────────────────────────────────────────────────
export async function importRecipeFromUrl(url) {
  // Basic URL validation
  if (!url.startsWith('http')) throw new Error('Please enter a valid URL starting with http');

  const html = await fetchHtml(url);

  // Try structured data first
  let result = parseJsonLd(html);
  let method = 'structured data';

  // Fall back to heuristic
  if (!result) {
    result = parseHeuristic(html);
    method = 'page content';
  }

  if (!result) {
    throw new Error("Couldn't extract a recipe from this page. The site may require JavaScript to load content, or uses a format we can't parse yet.");
  }

  return { ...result, method };
}

// ── Fetch ──────────────────────────────────────────────────────────────────
// URL import requires a backend function to bypass browser CORS restrictions.
// This feature is not yet enabled. Users will see a friendly message below.
async function fetchHtml(url) {
  throw new Error('__NOT_ENABLED__');
}

// ── Schema.org JSON-LD parser ──────────────────────────────────────────────
function parseJsonLd(html) {
  const scriptMatches = [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  ];
  for (const match of scriptMatches) {
    try {
      const json = JSON.parse(match[1].trim());
      const schemas = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
      for (const schema of schemas) {
        const type = schema['@type'];
        if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
          return extractFromSchema(schema);
        }
      }
    } catch { continue; }
  }
  return null;
}

function extractFromSchema(schema) {
  const name        = schema.name || '';
  const description = stripHtml(schema.description || '');
  const time        = parseDuration(schema.totalTime || schema.cookTime || schema.prepTime || '');
  const rawYield    = schema.recipeYield;
  const servings    = parseServings(Array.isArray(rawYield) ? rawYield[0] : rawYield);
  const ingredientText = (schema.recipeIngredient || []).join('\n');
  const steps       = flattenSteps(schema.recipeInstructions || []);
  const stepText    = steps.join('\n');
  const protein     = detectProtein(name + ' ' + ingredientText);
  const course      = detectCourse(schema, name + ' ' + ingredientText);
  const cuisine     = detectCuisine(schema, name + ' ' + ingredientText);
  return { name, description, time, servings, ingredientText, stepText, protein, course, cuisine };
}

function parseHeuristic(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ');

  const lines = clean.split(/(?<=[.!?])\s+/).map(l => l.trim()).filter(Boolean);

  const ingredientLines = lines.filter(line => {
    const l = line.toLowerCase();
    return (line.length < 120 && /\d/.test(line) &&
      (l.includes('cup') || l.includes('tbsp') || l.includes('tsp') ||
       l.includes('oz') || l.includes('lb') || l.includes('clove') ||
       l.includes('can') || l.includes('package')));
  }).slice(0, 24);

  const stepLines = lines.filter(line => {
    const l = line.toLowerCase();
    return (line.length > 25 && line.length < 500 &&
      (l.includes('heat') || l.includes('cook') || l.includes('add') ||
       l.includes('stir') || l.includes('bake') || l.includes('mix') ||
       l.includes('simmer') || l.includes('drain') || l.includes('combine')));
  }).slice(0, 14);

  if (ingredientLines.length < 2 || stepLines.length < 2) return null;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const name = titleMatch ? titleMatch[1].replace(/\s*[-|–].*$/, '').trim() : 'Imported Recipe';

  const heuristicText = name + ' ' + ingredientLines.join(' ');
  return {
    name, description: '', time: 30, servings: 4,
    ingredientText: ingredientLines.join('\n'),
    stepText: stepLines.join('\n'),
    protein: detectProtein(heuristicText),
    course: detectCourse({}, heuristicText),
    cuisine: detectCuisine({}, heuristicText),
  };
}

function stripHtml(str) { return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function parseDuration(iso) {
  if (!iso) return 30;
  const hours = parseInt(iso.match(/(\d+)H/)?.[1] || 0);
  const mins  = parseInt(iso.match(/(\d+)M/)?.[1] || 0);
  return hours * 60 + mins || 30;
}

function parseServings(raw) {
  if (!raw) return 4;
  const n = parseInt(String(raw).replace(/\D.*/, ''));
  return isNaN(n) || n < 1 ? 4 : Math.min(n, 24);
}

function flattenSteps(instructions) {
  const steps = [];
  for (const inst of instructions) {
    if (typeof inst === 'string') steps.push(stripHtml(inst).trim());
    else if (inst['@type'] === 'HowToStep') steps.push(stripHtml(inst.text || inst.name || '').trim());
    else if (inst['@type'] === 'HowToSection' && inst.itemListElement) {
      for (const sub of inst.itemListElement) steps.push(stripHtml(sub.text || sub.name || '').trim());
    }
  }
  return steps.filter(Boolean);
}

function detectProtein(text) {
  const l = text.toLowerCase();
  const hasBeef    = /ground beef|chuck|beef|steak|brisket/.test(l);
  const hasChicken = /chicken|poultry/.test(l);
  if (hasBeef && !hasChicken) return 'beef';
  if (hasChicken) return 'chicken';
  return 'other';
}

// Fuzzy-match schema.org's free-text recipeCategory (+ name/ingredients) to our closed course vocab
function detectCourse(schema, text) {
  const raw = (Array.isArray(schema.recipeCategory) ? schema.recipeCategory.join(' ') : schema.recipeCategory || '') + ' ' + text;
  const l = raw.toLowerCase();
  if (/dessert|cake|cookie|pie|brownie|sweet/.test(l)) return 'dessert';
  if (/breakfast|brunch|pancake|waffle|omelet/.test(l)) return 'breakfast';
  if (/appetizer|starter|snack/.test(l)) return 'appetizer';
  if (/soup|stew|chili/.test(l)) return 'soup';
  if (/\bbread\b|baking|\bbake\b/.test(l)) return 'baking';
  if (/side dish|\bside\b/.test(l)) return 'side';
  return 'main';
}

// Fuzzy-match schema.org's free-text recipeCuisine (+ name/ingredients) to our closed cuisine vocab
function detectCuisine(schema, text) {
  const raw = (Array.isArray(schema.recipeCuisine) ? schema.recipeCuisine.join(' ') : schema.recipeCuisine || '') + ' ' + text;
  const l = raw.toLowerCase();
  if (/italian|pasta|pizza/.test(l)) return 'italian';
  if (/mexican|taco|burrito|salsa|tex-mex|quesadilla/.test(l)) return 'mexican';
  if (/asian|chinese|thai|japanese|korean|vietnamese|stir.?fry|soy sauce/.test(l)) return 'asian';
  if (/mediterranean|greek/.test(l)) return 'mediterranean';
  if (/indian|curry/.test(l)) return 'indian';
  if (/american/.test(l)) return 'american';
  return 'other';
}

// ── Main export ────────────────────────────────────────────────────────────
export async function importRecipeFromUrl(url) {
  if (!url.startsWith('http')) {
    throw new Error('Please enter a valid URL starting with http');
  }

  try {
    const html = await fetchHtml(url);
    let result = parseJsonLd(html);
    let method = 'structured data';
    if (!result) { result = parseHeuristic(html); method = 'page content'; }
    if (!result) throw new Error('NO_RECIPE');
    return { ...result, method };
  } catch (err) {
    if (err.message === '__NOT_ENABLED__' || err.message === 'NO_RECIPE') {
      throw new Error('__NOT_ENABLED__');
    }
    throw err;
  }
}

// ── What needs to change to enable this feature ────────────────────────────
// 1. Upgrade Firebase project to Blaze plan (free usage tier still applies)
// 2. Add a functions/ folder with a fetchRecipeHtml Cloud Function
// 3. Replace the fetchHtml() stub above with a real call to that function
// 4. Deploy with: firebase deploy --only functions
// Everything else (parser, UI, form pre-fill) is already built and ready.

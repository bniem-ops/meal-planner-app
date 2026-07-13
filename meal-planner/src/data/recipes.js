export const recipes = [
  {
    id: 'r1',
    name: 'Sheet Pan Chicken & Veggies',
    protein: 'chicken',
    course: 'main',
    cuisine: 'american',
    time: 25,
    servings: 4,
    tags: ['quick', 'one-pan', 'kid-friendly'],
    description: 'Juicy chicken breast with roasted vegetables — toss it in and forget it.',
    ingredients: [
      { item: 'chicken breast', amount: '1.5 lbs', shared: true },
      { item: 'bell peppers', amount: '2', shared: true },
      { item: 'zucchini', amount: '1 medium' },
      { item: 'olive oil', amount: '3 tbsp', shared: true },
      { item: 'garlic', amount: '3 cloves', shared: true },
      { item: 'Italian seasoning', amount: '1 tsp', shared: true },
      { item: 'salt & pepper', amount: 'to taste', shared: true },
    ],
    steps: [
      'Preheat oven to 425°F.',
      'Cube chicken and chop veggies. Toss everything with olive oil, garlic, Italian seasoning, salt & pepper.',
      'Spread on a sheet pan in a single layer.',
      'Roast 20–25 min until chicken is cooked through and edges are golden.',
    ],
  },
  {
    id: 'r2',
    name: 'Easy Beef Tacos',
    protein: 'beef',
    course: 'main',
    cuisine: 'mexican',
    time: 20,
    servings: 4,
    tags: ['quick', 'kid-friendly', 'crowd-pleaser'],
    description: 'Weeknight staple. Season ground beef well, pile on toppings.',
    ingredients: [
      { item: 'ground beef', amount: '1 lb', shared: true },
      { item: 'taco seasoning', amount: '1 packet', shared: true },
      { item: 'flour tortillas', amount: '8 small', shared: true },
      { item: 'shredded cheese', amount: '1 cup', shared: true },
      { item: 'sour cream', amount: '½ cup' },
      { item: 'salsa', amount: '½ cup', shared: true },
      { item: 'romaine lettuce', amount: '1 cup', shared: true },
    ],
    steps: [
      'Brown ground beef over medium-high heat, breaking up as it cooks. Drain fat.',
      'Add taco seasoning and ¼ cup water. Stir and simmer 3 min.',
      'Warm tortillas in a dry skillet or microwave.',
      'Set up a toppings bar — let everyone build their own.',
    ],
  },
  {
    id: 'r3',
    name: 'Chicken Stir-Fry with Rice',
    protein: 'chicken',
    course: 'main',
    cuisine: 'asian',
    time: 25,
    servings: 4,
    tags: ['quick', 'one-pan'],
    description: 'Fast, saucy, and better than takeout. Uses pantry staples.',
    ingredients: [
      { item: 'chicken breast', amount: '1.5 lbs', shared: true },
      { item: 'bell peppers', amount: '2', shared: true },
      { item: 'soy sauce', amount: '3 tbsp', shared: true },
      { item: 'garlic', amount: '3 cloves', shared: true },
      { item: 'ginger', amount: '1 tsp' },
      { item: 'sesame oil', amount: '1 tbsp' },
      { item: 'white rice', amount: '2 cups', shared: true },
      { item: 'broccoli florets', amount: '2 cups' },
      { item: 'cornstarch', amount: '1 tbsp' },
    ],
    steps: [
      'Cook rice per package directions.',
      'Slice chicken thin. Toss with cornstarch, salt & pepper.',
      'Heat oil in a wok or large skillet over high heat. Cook chicken 4–5 min until golden. Remove.',
      'Add veggies, garlic, ginger — stir-fry 3 min.',
      'Return chicken. Add soy sauce and sesame oil. Toss and serve over rice.',
    ],
  },
  {
    id: 'r4',
    name: 'Beef & Veggie Skillet',
    protein: 'beef',
    course: 'main',
    cuisine: 'american',
    time: 20,
    servings: 4,
    tags: ['quick', 'one-pan', 'kid-friendly'],
    description: 'One-pan dinner that cleans up in minutes.',
    ingredients: [
      { item: 'ground beef', amount: '1 lb', shared: true },
      { item: 'zucchini', amount: '2 medium' },
      { item: 'bell peppers', amount: '1', shared: true },
      { item: 'garlic', amount: '2 cloves', shared: true },
      { item: 'Italian seasoning', amount: '1 tsp', shared: true },
      { item: 'diced tomatoes', amount: '1 can (14oz)', shared: true },
      { item: 'shredded cheese', amount: '½ cup', shared: true },
      { item: 'olive oil', amount: '1 tbsp', shared: true },
    ],
    steps: [
      'Brown ground beef in a large skillet. Drain and set aside.',
      'In the same pan, sauté garlic and veggies in olive oil for 3–4 min.',
      'Add beef back, pour in tomatoes, add Italian seasoning.',
      'Simmer 5 min. Top with cheese, cover until melted.',
    ],
  },
  {
    id: 'r5',
    name: 'Lemon Herb Chicken Pasta',
    protein: 'chicken',
    course: 'main',
    cuisine: 'italian',
    time: 30,
    servings: 4,
    tags: ['kid-friendly', 'crowd-pleaser'],
    description: 'Bright, creamy, and satisfying. Great for busy evenings.',
    ingredients: [
      { item: 'chicken breast', amount: '1 lb', shared: true },
      { item: 'penne pasta', amount: '12 oz', shared: true },
      { item: 'garlic', amount: '3 cloves', shared: true },
      { item: 'lemon', amount: '1', shared: true },
      { item: 'heavy cream', amount: '½ cup' },
      { item: 'parmesan cheese', amount: '½ cup' },
      { item: 'spinach', amount: '2 cups' },
      { item: 'olive oil', amount: '2 tbsp', shared: true },
      { item: 'Italian seasoning', amount: '1 tsp', shared: true },
    ],
    steps: [
      'Cook pasta per package directions. Reserve ½ cup pasta water.',
      'Season chicken with salt, pepper, Italian seasoning. Cook in olive oil 6–7 min per side. Slice.',
      'In the same pan, sauté garlic 1 min. Add cream, lemon juice, parmesan. Stir until smooth.',
      'Toss in pasta, spinach, and chicken. Add pasta water to loosen if needed.',
    ],
  },
  {
    id: 'r6',
    name: 'Simple Beef Bolognese',
    protein: 'beef',
    course: 'main',
    cuisine: 'italian',
    time: 30,
    servings: 4,
    tags: ['kid-friendly', 'crowd-pleaser'],
    description: 'A quick bolognese that tastes like it simmered all day.',
    ingredients: [
      { item: 'ground beef', amount: '1 lb', shared: true },
      { item: 'penne pasta', amount: '12 oz', shared: true },
      { item: 'diced tomatoes', amount: '1 can (14oz)', shared: true },
      { item: 'tomato paste', amount: '2 tbsp' },
      { item: 'garlic', amount: '3 cloves', shared: true },
      { item: 'onion', amount: '1 medium', shared: true },
      { item: 'Italian seasoning', amount: '2 tsp', shared: true },
      { item: 'parmesan cheese', amount: '¼ cup' },
      { item: 'olive oil', amount: '1 tbsp', shared: true },
    ],
    steps: [
      'Cook pasta per package directions.',
      'Brown beef with onion and garlic in olive oil. Drain fat.',
      'Add tomatoes, tomato paste, Italian seasoning. Simmer 10 min.',
      'Toss with pasta. Finish with parmesan.',
    ],
  },
  {
    id: 'r7',
    name: 'Chicken Quesadillas',
    protein: 'chicken',
    course: 'main',
    cuisine: 'mexican',
    time: 20,
    servings: 4,
    tags: ['quick', 'kid-friendly'],
    description: 'Crispy, cheesy, and a guaranteed kid win.',
    ingredients: [
      { item: 'chicken breast', amount: '1 lb', shared: true },
      { item: 'flour tortillas', amount: '4 large', shared: true },
      { item: 'shredded cheese', amount: '2 cups', shared: true },
      { item: 'bell peppers', amount: '1', shared: true },
      { item: 'taco seasoning', amount: '1 tsp', shared: true },
      { item: 'salsa', amount: 'for dipping', shared: true },
      { item: 'sour cream', amount: 'for dipping' },
    ],
    steps: [
      'Season and cook chicken in a skillet. Slice thin.',
      'Sauté bell pepper strips until soft.',
      'Layer chicken, peppers, and cheese on half of each tortilla. Fold.',
      'Cook in a dry skillet 2–3 min per side until golden and crisp. Cut into wedges.',
    ],
  },
  {
    id: 'r8',
    name: 'Beef Burrito Bowls',
    protein: 'beef',
    course: 'main',
    cuisine: 'mexican',
    time: 25,
    servings: 4,
    tags: ['quick', 'crowd-pleaser'],
    description: 'Chipotle vibes at home with things already in your pantry.',
    ingredients: [
      { item: 'ground beef', amount: '1 lb', shared: true },
      { item: 'white rice', amount: '2 cups', shared: true },
      { item: 'taco seasoning', amount: '1 packet', shared: true },
      { item: 'black beans', amount: '1 can (15oz)' },
      { item: 'salsa', amount: '½ cup', shared: true },
      { item: 'shredded cheese', amount: '1 cup', shared: true },
      { item: 'romaine lettuce', amount: '2 cups', shared: true },
      { item: 'sour cream', amount: '½ cup' },
      { item: 'lemon', amount: '1 (for rice)', shared: true },
    ],
    steps: [
      'Cook rice. Squeeze lemon and stir in a pinch of salt.',
      'Brown beef with taco seasoning.',
      'Warm black beans in a small pot.',
      'Build bowls: rice base, beef, beans, lettuce, salsa, cheese, sour cream.',
    ],
  },
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const COURSES = ['main', 'side', 'dessert', 'breakfast', 'appetizer', 'soup', 'baking'];
export const CUISINES = ['american', 'italian', 'mexican', 'asian', 'mediterranean', 'indian', 'other'];

export const COURSE_LABELS = {
  main: '🍽️ Main', side: '🥗 Side', dessert: '🍰 Dessert', breakfast: '🍳 Breakfast',
  appetizer: '🥟 Appetizer', soup: '🍲 Soup', baking: '🍞 Baking',
};

export const CUISINE_LABELS = {
  american: '🇺🇸 American', italian: '🇮🇹 Italian', mexican: '🇲🇽 Mexican', asian: '🥢 Asian',
  mediterranean: '🫒 Mediterranean', indian: '🍛 Indian', other: '🌍 Other',
};

export const PROTEIN_LABELS = { chicken: '🐔 Chicken', beef: '🥩 Beef', other: '🍽️ Other' };

// Parse a "YYYY-MM-DD" weekId into a local Date — avoids the UTC-midnight parsing
// that `new Date("YYYY-MM-DD")` does, which can land on the wrong local day.
function parseWeekId(weekId) {
  const [y, m, d] = weekId.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const getWeekId = (date = new Date()) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Shift a weekId by a number of whole weeks (negative = earlier)
export const shiftWeekId = (weekId, deltaWeeks) => {
  const monday = parseWeekId(weekId);
  monday.setDate(monday.getDate() + deltaWeeks * 7);
  return getWeekId(monday);
};

// "Jul 6 – 12" (or "Jun 30 – Jul 6" across a month boundary)
export const getWeekRangeLabel = (weekId) => {
  const monday = parseWeekId(weekId);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const start = `${monday.toLocaleDateString('en-US', { month: 'short' })} ${monday.getDate()}`;
  const end = sameMonth
    ? String(sunday.getDate())
    : `${sunday.toLocaleDateString('en-US', { month: 'short' })} ${sunday.getDate()}`;
  return `${start} – ${end}`;
};

// Which DAYS[] entry a given date falls on (DAYS is Monday-first)
export const getDayNameForDate = (date) => DAYS[(date.getDay() + 6) % 7];

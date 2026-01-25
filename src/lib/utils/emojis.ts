// Auto-emoji mapping for common grocery items
const emojiMap: Record<string, string> = {
  // Fruits
  apple: '🍎',
  apples: '🍎',
  banana: '🍌',
  bananas: '🍌',
  orange: '🍊',
  oranges: '🍊',
  lemon: '🍋',
  lemons: '🍋',
  lime: '🍈',
  limes: '🍈',
  grape: '🍇',
  grapes: '🍇',
  strawberry: '🍓',
  strawberries: '🍓',
  blueberry: '🫐',
  blueberries: '🫐',
  watermelon: '🍉',
  peach: '🍑',
  peaches: '🍑',
  pear: '🍐',
  pears: '🍐',
  cherry: '🍒',
  cherries: '🍒',
  mango: '🥭',
  mangos: '🥭',
  mangoes: '🥭',
  pineapple: '🍍',
  coconut: '🥥',
  kiwi: '🥝',
  avocado: '🥑',
  avocados: '🥑',

  // Vegetables
  carrot: '🥕',
  carrots: '🥕',
  broccoli: '🥦',
  cucumber: '🥒',
  cucumbers: '🥒',
  lettuce: '🥬',
  salad: '🥗',
  tomato: '🍅',
  tomatoes: '🍅',
  potato: '🥔',
  potatoes: '🥔',
  onion: '🧅',
  onions: '🧅',
  garlic: '🧄',
  corn: '🌽',
  pepper: '🫑',
  peppers: '🫑',
  'bell pepper': '🫑',
  'hot pepper': '🌶️',
  jalapeno: '🌶️',
  mushroom: '🍄',
  mushrooms: '🍄',
  eggplant: '🍆',
  spinach: '🥬',
  kale: '🥬',
  celery: '🥬',
  beans: '🫘',
  peas: '🫛',

  // Dairy
  milk: '🥛',
  cheese: '🧀',
  butter: '🧈',
  egg: '🥚',
  eggs: '🥚',
  yogurt: '🫙',
  'ice cream': '🍨',
  icecream: '🍨',

  // Bread & Bakery
  bread: '🍞',
  bagel: '🥯',
  bagels: '🥯',
  croissant: '🥐',
  pretzel: '🥨',
  pretzels: '🥨',
  cookie: '🍪',
  cookies: '🍪',
  cake: '🎂',
  pie: '🥧',
  donut: '🍩',
  donuts: '🍩',
  doughnut: '🍩',
  muffin: '🧁',
  muffins: '🧁',
  cupcake: '🧁',
  pancake: '🥞',
  pancakes: '🥞',
  waffle: '🧇',
  waffles: '🧇',

  // Meat & Protein
  chicken: '🍗',
  beef: '🥩',
  steak: '🥩',
  bacon: '🥓',
  ham: '🍖',
  pork: '🍖',
  meat: '🍖',
  turkey: '🦃',
  fish: '🐟',
  salmon: '🍣',
  shrimp: '🦐',
  lobster: '🦞',
  crab: '🦀',
  sausage: '🌭',
  hotdog: '🌭',
  'hot dog': '🌭',

  // Drinks
  water: '💧',
  juice: '🧃',
  'orange juice': '🍊',
  'apple juice': '🧃',
  soda: '🥤',
  cola: '🥤',
  coke: '🥤',
  pepsi: '🥤',
  coffee: '☕',
  tea: '🍵',
  beer: '🍺',
  wine: '🍷',
  champagne: '🍾',
  cocktail: '🍸',
  smoothie: '🥤',

  // Snacks
  chips: '🍟',
  popcorn: '🍿',
  candy: '🍬',
  chocolate: '🍫',
  nuts: '🥜',
  peanuts: '🥜',
  almonds: '🥜',

  // Condiments & Pantry
  honey: '🍯',
  salt: '🧂',
  ketchup: '🍅',
  oil: '🫒',
  'olive oil': '🫒',
  rice: '🍚',
  pasta: '🍝',
  noodles: '🍜',
  soup: '🍲',
  pizza: '🍕',
  burger: '🍔',
  hamburger: '🍔',
  sandwich: '🥪',
  taco: '🌮',
  tacos: '🌮',
  burrito: '🌯',
  sushi: '🍣',
  ramen: '🍜',

  // Household
  soap: '🧼',
  'toilet paper': '🧻',
  tissues: '🧻',
  'paper towels': '🧻',
  sponge: '🧽',
  detergent: '🧴',
  shampoo: '🧴',
  lotion: '🧴',
  toothpaste: '🪥',
  'trash bags': '🗑️',

  // Baby & Pet
  'baby food': '🍼',
  diapers: '👶',
  'dog food': '🐕',
  'cat food': '🐈',

  // Other
  flowers: '💐',
  candle: '🕯️',
  candles: '🕯️',
  battery: '🔋',
  batteries: '🔋',
};

export function getItemEmoji(itemName: string): string | null {
  const normalized = itemName.toLowerCase().trim();

  // Direct match
  if (emojiMap[normalized]) {
    return emojiMap[normalized];
  }

  // Check if any key is contained in the item name
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return emoji;
    }
  }

  return null;
}

export function addEmojiToItem(itemName: string): string {
  const emoji = getItemEmoji(itemName);
  if (emoji) {
    return `${emoji} ${itemName}`;
  }
  return itemName;
}

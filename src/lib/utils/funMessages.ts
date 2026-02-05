// Witty empty state messages
export const emptyListMessages = [
  { emoji: '🛒', title: "Cart's looking lonely!", subtitle: "Add some items to get this party started" },
  { emoji: '🦗', title: "Nothing but crickets here", subtitle: "Time to stock up!" },
  { emoji: '🎯', title: "Zero items. Perfect aim!", subtitle: "...wait, that's not the goal" },
  { emoji: '🏜️', title: "It's a desert in here", subtitle: "No items as far as the eye can see" },
  { emoji: '👻', title: "Spookily empty", subtitle: "Add items before the ghosts do" },
  { emoji: '🌵', title: "Tumbleweeds rolling by", subtitle: "This list needs some love" },
  { emoji: '🎪', title: "The shelves are bare!", subtitle: "Let's fix that, shall we?" },
  { emoji: '🦔', title: "Even the hedgehog left", subtitle: "Too empty for comfort" },
  { emoji: '🧹', title: "Squeaky clean!", subtitle: "Maybe too clean..." },
  { emoji: '🎭', title: "Plot twist: no items!", subtitle: "The real shopping was the friends we made" },
];

// Completion celebration messages
export const completionMessages = [
  { emoji: '🏆', title: "CHAMPION SHOPPER!", subtitle: "Every item conquered!" },
  { emoji: '🎉', title: "MISSION COMPLETE!", subtitle: "You crushed that list!" },
  { emoji: '🚀', title: "SHOPPING LEGEND!", subtitle: "Nothing can stop you!" },
  { emoji: '⭐', title: "FLAWLESS VICTORY!", subtitle: "Cart: 0, You: ALL THE POINTS" },
  { emoji: '🎯', title: "BULLSEYE!", subtitle: "Every. Single. Item." },
  { emoji: '🦸', title: "SUPERHERO STATUS!", subtitle: "Faster than a speeding cart!" },
  { emoji: '👑', title: "BOW DOWN!", subtitle: "The shopping monarch has arrived" },
  { emoji: '🔥', title: "YOU'RE ON FIRE!", subtitle: "List absolutely demolished" },
  { emoji: '💪', title: "GAINS UNLOCKED!", subtitle: "Grocery gains, that is" },
  { emoji: '🌟', title: "STELLAR PERFORMANCE!", subtitle: "Out of this world shopping" },
];

// Pixel arcade themed completion messages
export const pixelCompletionMessages = [
  { emoji: '🕹️', title: "LEVEL COMPLETE!", subtitle: "Insert coin to continue..." },
  { emoji: '👾', title: "HIGH SCORE!", subtitle: "You beat the final boss!" },
  { emoji: '🎮', title: "GAME OVER... YOU WIN!", subtitle: "+1000 shopping XP" },
  { emoji: '⭐', title: "PERFECT CLEAR!", subtitle: "All items collected!" },
  { emoji: '🏅', title: "NEW RECORD!", subtitle: "Your name on the leaderboard!" },
  { emoji: '💎', title: "BONUS STAGE COMPLETE!", subtitle: "Secret items unlocked!" },
  { emoji: '🎰', title: "JACKPOT!", subtitle: "Triple cherries! All items got!" },
  { emoji: '🚀', title: "WARP ZONE CLEARED!", subtitle: "Teleporting to checkout..." },
  { emoji: '⚡', title: "POWER-UP MAXED!", subtitle: "Shopping skill: LEGENDARY" },
  { emoji: '🏰', title: "DUNGEON CLEARED!", subtitle: "The grocery dragon defeated!" },
  { emoji: '🎯', title: "COMBO x999!", subtitle: "Unbelievable streak!" },
  { emoji: '🌈', title: "RAINBOW ROAD COMPLETE!", subtitle: "You didn't fall off!" },
];

// Random loading messages
export const loadingMessages = [
  "Reticulating splines...",
  "Warming up the cart wheels...",
  "Counting all the avocados...",
  "Organizing the chaos...",
  "Bribing the shopping gremlins...",
  "Polishing the barcodes...",
  "Herding the grocery cats...",
  "Calibrating the cheese radar...",
  "Untangling the shopping bags...",
  "Convincing items to appear...",
  "Negotiating with the freezer section...",
  "Loading deliciousness...",
  "Summoning the shopping spirits...",
  "Alphabetizing the snacks...",
  "Waking up the vegetables...",
];

// Shopping stats fun facts
export const statMessages = [
  (count: number) => `🏃 You've checked off ${count} items! That's Olympic-level shopping.`,
  (count: number) => `📊 ${count} items conquered. The spreadsheet nerds are impressed.`,
  (count: number) => `🎮 Achievement unlocked: ${count} items mastered!`,
  (count: number) => `🧮 Fun fact: ${count} items = ${count * 3} calories burned (probably).`,
  (count: number) => `📈 ${count} items and counting. You're basically a shopping influencer now.`,
];

export function getRandomMessage<T>(messages: T[]): T {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getRandomEmptyMessage() {
  return getRandomMessage(emptyListMessages);
}

export function getRandomCompletionMessage() {
  return getRandomMessage(completionMessages);
}

export function getRandomPixelCompletionMessage() {
  return getRandomMessage(pixelCompletionMessages);
}

export function getRandomLoadingMessage() {
  return getRandomMessage(loadingMessages);
}

export function getRandomStatMessage(count: number) {
  const messageFn = getRandomMessage(statMessages);
  return messageFn(count);
}

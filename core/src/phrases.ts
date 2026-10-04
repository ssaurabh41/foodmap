import type { Bilingual } from "./types";

/** Short phrases to show restaurant staff next to a dish name. */
export const STAFF_PHRASES: (Bilingual & { id: string })[] = [
  { id: "vegan", en: "I eat vegan (no meat, egg, dairy, onion or garlic)", zh: "我吃全素" },
  { id: "vegetarian", en: "I'm vegetarian, no meat or fish", zh: "我吃素，不吃肉和海鮮" },
  { id: "no-meat-sauce", en: "No meat sauce, please", zh: "不要肉燥" },
  { id: "not-spicy", en: "Not spicy, please", zh: "不要辣" },
  { id: "mild", en: "A little spicy", zh: "小辣" },
  { id: "extra-spicy", en: "Extra spicy", zh: "大辣" },
  { id: "no-cilantro", en: "No cilantro", zh: "不要香菜" },
  { id: "no-scallion", en: "No scallions", zh: "不要蔥" },
  { id: "takeaway", en: "Takeaway", zh: "外帶" },
  { id: "eat-in", en: "Eat here", zh: "內用" },
];

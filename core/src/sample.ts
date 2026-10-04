/**
 * FICTIONAL sample data for the mockup. Restaurant names, reviews, ratings and prices are
 * invented; dishes and districts are typical of Hsinchu so the UI can be judged realistically.
 * Replace with pipeline output once real data exists.
 */
import type {
  Dataset,
  DietLabel,
  Dish,
  OpeningPeriod,
  Protein,
  Provenance,
  Restaurant,
  Review,
  SpiceLevel,
} from "./types";

const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6];
const NOT_MON = [0, 2, 3, 4, 5, 6];

const lunchDinner = (days = ALL_WEEK): OpeningPeriod[] => [
  { days, open: "11:00", close: "14:00" },
  { days, open: "17:00", close: "21:00" },
];

const menu: Provenance = { kind: "menu_photo", confidence: "high", detail: "read from a menu photo" };
const reviews = (n: number): Provenance => ({
  kind: "reviews",
  confidence: n >= 3 ? "medium" : "low",
  detail: `mentioned in ${n} review${n === 1 ? "" : "s"}`,
});
const inferred = (detail: string): Provenance => ({ kind: "inferred", confidence: "low", detail });

const mapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

interface DishSpec {
  zh: string;
  en: string;
  price?: number;
  diet: DietLabel;
  proteins?: Protein[];
  spice?: SpiceLevel;
  tags?: string[];
  description?: string;
  popular?: boolean;
  source?: Provenance;
}

interface PlaceSpec extends Omit<Restaurant, "mapsUrl" | "city"> {
  dishes: DishSpec[];
}

const HSINCHU_CITY = { en: "Hsinchu City", zh: "新竹市" };
const HSINCHU_COUNTY = { en: "Hsinchu County", zh: "新竹縣" };
const EAST = { en: "East District", zh: "東區" };
const NORTH = { en: "North District", zh: "北區" };
const XIANGSHAN = { en: "Xiangshan District", zh: "香山區" };
const ZHUBEI = { en: "Zhubei City", zh: "竹北市" };

const r = (text: [string, string], rating: number, when: string): Review => ({
  rating,
  text: { en: text[0], zh: text[1] },
  when,
});

const places: PlaceSpec[] = [
  {
    id: "lotus-heart",
    name: { en: "Lotus Heart Vegetarian Kitchen", zh: "蓮心素食小館" },
    district: EAST,
    address: { en: "Lane 12, Guangfu Rd Sec. 2, East District", zh: "東區光復路二段12巷" },
    location: { lat: 24.7945, lng: 120.993 },
    rating: 4.6,
    reviewCount: 812,
    priceLevel: 1,
    cuisine: ["vegetarian", "taiwanese", "sichuan"],
    summary:
      "Small vegetarian diner near the universities. Regulars praise the vegetarian mapo tofu for real Sichuan numbing heat, and say the portions are generous for the price. The menu marks which dishes are fully vegan (全素) and which use egg or garlic. Gets crowded at lunch.",
    hours: lunchDinner(NOT_MON),
    reviews: [
      r(["The vegetarian mapo tofu is properly numbing, you don't miss the meat at all. Rice refills are free.", "素麻婆豆腐很麻很夠味，完全吃不出是素的。白飯可以續。"], 5, "2 weeks ago"),
      r(["Kung pao mushroom was a bit sweet for me, but the owner is friendly and the menu has vegan markings.", "宮保猴頭菇對我來說偏甜，但老闆很親切，菜單上有標示全素。"], 4, "3 months ago"),
    ],
    dishes: [
      { zh: "素麻婆豆腐", en: "Vegetarian Mapo Tofu", price: 120, diet: "vegan", proteins: ["tofu"], spice: 2, tags: ["mapo tofu", "rice", "sichuan"], description: "Silken tofu in chili-bean sauce with Sichuan pepper; minced mushroom instead of pork.", popular: true, source: menu },
      { zh: "宮保猴頭菇", en: "Kung Pao Lion's Mane Mushroom", price: 150, diet: "vegan", spice: 2, tags: ["mushroom", "kung pao", "peanuts"], description: "Crispy lion's mane mushroom stir-fried with dried chilies and peanuts.", source: menu },
      { zh: "三杯杏鮑菇", en: "Three-Cup King Oyster Mushroom", price: 140, diet: "five_pungent", spice: 1, tags: ["mushroom", "basil", "three cup"], description: "Braised in sesame oil, soy sauce and rice wine with garlic and Thai basil.", source: menu },
      { zh: "菜脯蛋", en: "Preserved Radish Omelette", price: 80, diet: "lacto_ovo", proteins: ["egg"], tags: ["omelette", "egg"], source: menu },
      { zh: "素炸醬麵", en: "Vegetarian Zhajiang Noodles", price: 90, diet: "five_pungent", proteins: ["tofu"], tags: ["noodles"], description: "Noodles with a savory fermented-bean and diced tofu sauce.", source: menu },
    ],
  },
  {
    id: "temple-meatball",
    name: { en: "Temple Square Meatball House", zh: "廟口貢丸湯" },
    district: NORTH,
    address: { en: "Zhongshan Rd, near Hsinchu City God Temple", zh: "北區中山路（城隍廟旁）" },
    location: { lat: 24.8043, lng: 120.9662 },
    rating: 4.3,
    reviewCount: 2104,
    priceLevel: 1,
    cuisine: ["taiwanese", "street food", "hsinchu specialty"],
    summary:
      "Classic stall in the temple food area serving Hsinchu's two signature foods: pork meatball (gongwan) soup and fried rice vermicelli. Fast, cheap and busy; seating is shared stools. Several reviewers warn the blanched greens come topped with meat sauce unless you ask.",
    hours: [{ days: ALL_WEEK, open: "10:00", close: "20:00" }],
    reviews: [
      r(["Bouncy meatballs and the fried bee hoon is exactly how Hsinchu does it. Order both.", "貢丸很Q，炒米粉就是新竹的味道，兩樣都要點。"], 5, "1 month ago"),
      r(["Asked for vegetables without meat sauce and they still poured it on. Careful if vegetarian.", "燙青菜說不要肉燥結果還是淋了，吃素的要注意。"], 3, "5 months ago"),
    ],
    dishes: [
      { zh: "貢丸湯", en: "Pork Meatball Soup (Gongwan)", price: 50, diet: "contains_meat", proteins: ["pork"], tags: ["soup", "meatball", "hsinchu specialty"], description: "Hsinchu's famous springy pork meatballs in clear broth with celery.", popular: true, source: menu },
      { zh: "炒米粉", en: "Fried Rice Vermicelli", price: 60, diet: "contains_meat", proteins: ["pork"], tags: ["noodles", "rice noodles", "hsinchu specialty"], popular: true, source: menu },
      { zh: "肉圓", en: "Ba-wan (Taiwanese Meat Dumpling)", price: 55, diet: "contains_meat", proteins: ["pork"], tags: ["dumpling", "street food"], description: "Translucent sweet-potato starch dumpling filled with pork and bamboo shoots.", source: menu },
      { zh: "綜合湯", en: "Mixed Soup (Meatballs & Fish Balls)", price: 70, diet: "contains_meat", proteins: ["pork", "seafood"], tags: ["soup", "fish balls"], source: menu },
      { zh: "燙青菜", en: "Blanched Greens", price: 40, diet: "pot_side", tags: ["vegetables", "greens"], description: "Served with pork meat sauce by default; ask for 不要肉燥 (no meat sauce).", source: reviews(3) },
    ],
  },
  {
    id: "red-lantern",
    name: { en: "Red Lantern Sichuan", zh: "紅燈籠川菜館" },
    district: EAST,
    address: { en: "Minzu Rd, East District", zh: "東區民族路" },
    location: { lat: 24.8008, lng: 120.979 },
    rating: 4.4,
    reviewCount: 1356,
    priceLevel: 2,
    cuisine: ["sichuan", "chinese"],
    summary:
      "Sit-down Sichuan restaurant that doesn't tone down the heat. The mapo tofu and boiled beef are the most-mentioned dishes. Good for groups; dishes are shared plates. Note the mapo tofu here contains minced pork.",
    hours: lunchDinner(),
    reviews: [
      r(["Mapo tofu is fiery and numbing, real Sichuan level. Boiled beef was huge.", "麻婆豆腐又麻又辣，很道地。水煮牛肉份量超大。"], 5, "3 weeks ago"),
      r(["Too spicy for my kids, but they can make some dishes mild if you ask.", "對小孩來說太辣，但可以請他們做小辣。"], 4, "2 months ago"),
    ],
    dishes: [
      { zh: "麻婆豆腐", en: "Mapo Tofu", price: 180, diet: "contains_meat", proteins: ["pork", "tofu"], spice: 3, tags: ["mapo tofu", "sichuan", "rice"], description: "Tofu in chili-bean sauce with minced pork and Sichuan pepper.", popular: true, source: menu },
      { zh: "水煮牛肉", en: "Sichuan Boiled Beef", price: 320, diet: "contains_meat", proteins: ["beef"], spice: 3, tags: ["beef", "sichuan", "chili oil"], popular: true, source: menu },
      { zh: "口水雞", en: "Mouthwatering Chicken", price: 260, diet: "contains_meat", proteins: ["chicken"], spice: 2, tags: ["chicken", "cold dish", "chili oil"], source: menu },
      { zh: "乾煸四季豆", en: "Dry-Fried Green Beans", price: 200, diet: "contains_meat", proteins: ["pork"], spice: 1, tags: ["green beans", "vegetables"], description: "Usually cooked with minced pork.", source: menu },
      { zh: "擔擔麵", en: "Dan Dan Noodles", price: 120, diet: "contains_meat", proteins: ["pork"], spice: 2, tags: ["noodles", "sesame"], source: menu },
    ],
  },
  {
    id: "old-wang-beef",
    name: { en: "Old Wang's Beef Noodles", zh: "王記牛肉麵" },
    district: EAST,
    address: { en: "Zhongzheng Rd, East District", zh: "東區中正路" },
    location: { lat: 24.7988, lng: 120.9705 },
    rating: 4.5,
    reviewCount: 3021,
    priceLevel: 2,
    cuisine: ["taiwanese", "noodles"],
    summary:
      "Long-running beef noodle shop near the train station. Most reviewers order the braised (red) version and praise the tender shank. There is one vegetarian tomato noodle soup, made with a separate broth according to reviews.",
    hours: lunchDinner(NOT_MON),
    reviews: [
      r(["Beef is fall-apart tender, broth is rich without being salty. Add the pickled mustard greens from the table.", "牛肉很軟嫩，湯頭濃郁不死鹹。桌上的酸菜一定要加。"], 5, "1 week ago"),
      r(["Came with a vegetarian friend, the tomato noodles use a separate broth, she liked it.", "帶吃素的朋友來，番茄麵是另外的湯底，她很喜歡。"], 4, "4 months ago"),
    ],
    dishes: [
      { zh: "紅燒牛肉麵", en: "Braised Beef Noodle Soup", price: 220, diet: "contains_meat", proteins: ["beef"], spice: 1, tags: ["noodles", "soup", "beef noodles"], popular: true, source: menu },
      { zh: "清燉牛肉麵", en: "Clear Broth Beef Noodle Soup", price: 230, diet: "contains_meat", proteins: ["beef"], tags: ["noodles", "soup", "beef noodles"], source: menu },
      { zh: "麻辣牛肉麵", en: "Numbing Spicy Beef Noodles", price: 240, diet: "contains_meat", proteins: ["beef"], spice: 3, tags: ["noodles", "soup", "mala"], source: menu },
      { zh: "牛肚", en: "Beef Tripe (side)", price: 90, diet: "contains_meat", proteins: ["beef", "organ"], spice: 1, tags: ["side", "tripe"], source: menu },
      { zh: "素食番茄麵", en: "Vegetarian Tomato Noodle Soup", price: 150, diet: "lacto_ovo", proteins: ["egg"], tags: ["noodles", "soup", "tomato"], source: reviews(2) },
    ],
  },
  {
    id: "windy-night-bites",
    name: { en: "Windy City Night Bites", zh: "風城夜市小吃" },
    district: NORTH,
    address: { en: "Night market lane, North District", zh: "北區夜市巷內" },
    location: { lat: 24.809, lng: 120.9688 },
    rating: 4.1,
    reviewCount: 967,
    priceLevel: 1,
    cuisine: ["street food", "taiwanese", "night market"],
    summary:
      "Late-night street food stall, open until 1 am. Popcorn chicken is the crowd favorite; stinky tofu divides opinion. Expect a queue after 9 pm and no seating.",
    hours: [{ days: ALL_WEEK, open: "17:00", close: "01:00" }],
    reviews: [
      r(["Popcorn chicken with basil and extra pepper is perfect after work.", "鹹酥雞加九層塔多胡椒，下班後的救贖。"], 5, "2 weeks ago"),
      r(["Stinky tofu smells strong but tastes mild. Pickled cabbage on top is great.", "臭豆腐聞起來很臭吃起來很溫和，泡菜很讚。"], 4, "6 months ago"),
    ],
    dishes: [
      { zh: "鹽酥雞", en: "Taiwanese Popcorn Chicken", price: 80, diet: "contains_meat", proteins: ["chicken"], spice: 1, tags: ["fried chicken", "street food", "snack"], popular: true, source: menu },
      { zh: "臭豆腐", en: "Fried Stinky Tofu", price: 60, diet: "five_pungent", proteins: ["tofu"], spice: 1, tags: ["tofu", "street food", "fried"], description: "Fermented tofu, deep-fried, with garlicky pickled cabbage.", source: inferred("typical recipe; not confirmed on menu") },
      { zh: "蚵仔煎", en: "Oyster Omelette", price: 75, diet: "contains_meat", proteins: ["seafood", "egg"], tags: ["omelette", "oyster", "street food"], popular: true, source: menu },
      { zh: "大腸包小腸", en: "Sausage in Sticky-Rice Sausage", price: 70, diet: "contains_meat", proteins: ["pork", "organ"], tags: ["sausage", "street food"], source: menu },
      { zh: "豬血糕", en: "Pig's Blood Rice Cake", price: 35, diet: "contains_meat", proteins: ["pork", "organ"], tags: ["street food", "peanut powder"], source: menu },
    ],
  },
  {
    id: "bamboo-steamer",
    name: { en: "Bamboo Steamer Dumpling House", zh: "竹籠小籠包" },
    district: ZHUBEI,
    address: { en: "Guangming 6th Rd, Zhubei", zh: "竹北市光明六路" },
    location: { lat: 24.8262, lng: 121.011 },
    rating: 4.6,
    reviewCount: 1780,
    priceLevel: 2,
    cuisine: ["dumplings", "shanghainese", "chinese"],
    summary:
      "Dumpling house popular with families. The xiaolongbao get consistent praise for thin skins and lots of soup. Weekend waits of 20–30 minutes are common. Vegetable dumplings contain egg.",
    hours: [{ days: ALL_WEEK, open: "11:00", close: "21:00" }],
    reviews: [
      r(["Thin-skinned soup dumplings, very juicy. Worth the wait on Sunday.", "小籠包皮薄多汁，週日排隊也值得。"], 5, "1 month ago"),
      r(["Wontons in chili oil are the hidden gem. Not that spicy, more fragrant.", "紅油抄手是隱藏版，不會太辣，很香。"], 5, "2 months ago"),
    ],
    dishes: [
      { zh: "小籠包", en: "Xiaolongbao (Soup Dumplings, 8 pcs)", price: 160, diet: "contains_meat", proteins: ["pork"], tags: ["dumplings", "soup dumplings", "steamed"], popular: true, source: menu },
      { zh: "蝦仁蒸餃", en: "Shrimp Steamed Dumplings", price: 180, diet: "contains_meat", proteins: ["seafood", "pork"], tags: ["dumplings", "shrimp", "steamed"], source: menu },
      { zh: "素蒸餃", en: "Vegetable Steamed Dumplings", price: 140, diet: "lacto_ovo", proteins: ["egg"], tags: ["dumplings", "steamed", "vegetables"], source: menu },
      { zh: "紅油抄手", en: "Wontons in Chili Oil", price: 120, diet: "contains_meat", proteins: ["pork"], spice: 2, tags: ["wontons", "chili oil", "dumplings"], popular: true, source: reviews(5) },
      { zh: "蛋炒飯", en: "Egg Fried Rice", price: 130, diet: "five_pungent", proteins: ["egg"], tags: ["fried rice", "rice"], description: "Fried with scallions; ask for 不要蔥 (no scallions).", source: menu },
    ],
  },
  {
    id: "ember-mala",
    name: { en: "Ember Mala Hot Pot", zh: "炭火麻辣鍋" },
    district: ZHUBEI,
    address: { en: "Zhuangjing N Rd, Zhubei", zh: "竹北市莊敬北路" },
    location: { lat: 24.8301, lng: 121.0165 },
    rating: 4.2,
    reviewCount: 2450,
    priceLevel: 3,
    cuisine: ["hot pot", "mala", "sichuan"],
    summary:
      "Mala hot pot with free-flow duck blood and tofu. The spicy broth is the reason to come; there is also a half-and-half pot. A vegetarian broth exists but reviewers say to tell staff you eat vegan so they skip the bone stock base.",
    hours: [{ days: ALL_WEEK, open: "11:30", close: "23:30" }],
    reviews: [
      r(["Unlimited duck blood and tofu in mala broth. Go for medium spicy, it's already strong.", "鴨血豆腐吃到飽，選中辣就很夠了。"], 4, "3 weeks ago"),
      r(["They have a vegan broth if you ask clearly for 全素.", "跟店員說全素可以換素食湯底。"], 4, "5 months ago"),
    ],
    dishes: [
      { zh: "麻辣鍋套餐", en: "Mala Hot Pot Set", price: 498, diet: "contains_meat", proteins: ["beef", "pork"], spice: 3, tags: ["hot pot", "mala"], popular: true, source: menu },
      { zh: "鴛鴦鍋", en: "Half-Spicy, Half-Mild Pot", price: 528, diet: "contains_meat", proteins: ["beef", "pork"], spice: 2, tags: ["hot pot", "mala"], source: menu },
      { zh: "麻辣鴨血豆腐", en: "Mala Duck Blood & Tofu (refillable)", diet: "contains_meat", proteins: ["organ", "tofu"], spice: 3, tags: ["hot pot", "tofu", "duck blood"], source: reviews(6) },
      { zh: "素食鍋", en: "Vegetarian Hot Pot", price: 420, diet: "vegan", proteins: ["tofu"], tags: ["hot pot", "vegetables", "tofu"], description: "Vegan broth on request (say 全素).", source: reviews(2) },
    ],
  },
  {
    id: "rice-noodle-workshop",
    name: { en: "Hsinchu Rice Noodle Workshop", zh: "米粉工坊" },
    district: XIANGSHAN,
    address: { en: "Zhonghua Rd Sec. 5, Xiangshan District", zh: "香山區中華路五段" },
    location: { lat: 24.776, lng: 120.932 },
    rating: 4.4,
    reviewCount: 540,
    priceLevel: 1,
    cuisine: ["taiwanese", "hsinchu specialty", "noodles"],
    summary:
      "Family shop next to a rice noodle factory in Xiangshan, the area famous for sun-dried rice noodles. Fried rice noodles are the signature. The menu has a fully vegan fried rice noodle option.",
    hours: [{ days: NOT_MON, open: "07:00", close: "14:00" }],
    reviews: [
      r(["The noodles are made next door, you can taste the difference.", "米粉是隔壁工廠做的，吃得出來不一樣。"], 5, "2 months ago"),
      r(["Vegan fried noodles were simple but good. Closes early, come before 1.", "全素炒米粉簡單好吃。很早收，一點前要來。"], 4, "7 months ago"),
    ],
    dishes: [
      { zh: "新竹炒米粉", en: "Hsinchu Fried Rice Noodles", price: 70, diet: "contains_meat", proteins: ["pork"], tags: ["rice noodles", "noodles", "hsinchu specialty"], popular: true, source: menu },
      { zh: "米粉湯", en: "Rice Noodle Soup", price: 60, diet: "contains_meat", proteins: ["pork"], tags: ["rice noodles", "soup"], source: menu },
      { zh: "全素炒米粉", en: "Vegan Fried Rice Noodles", price: 65, diet: "vegan", tags: ["rice noodles", "noodles"], source: menu },
      { zh: "紅糟肉", en: "Red Yeast Fried Pork", price: 90, diet: "contains_meat", proteins: ["pork"], tags: ["pork", "side"], source: menu },
    ],
  },
  {
    id: "yuki-curry",
    name: { en: "Yuki Japanese Curry", zh: "雪之咖哩" },
    district: EAST,
    address: { en: "Near Hsinchu Science Park, East District", zh: "東區科學園區旁" },
    location: { lat: 24.784, lng: 121.005 },
    rating: 4.3,
    reviewCount: 690,
    priceLevel: 2,
    cuisine: ["japanese", "curry"],
    summary:
      "Japanese curry shop busy with Science Park workers at lunch. You choose the spice level from 0 to 5. The vegetable curry is not confirmed vegetarian: Japanese curry roux often contains meat extract.",
    hours: lunchDinner([1, 2, 3, 4, 5]),
    reviews: [
      r(["Level 3 is properly hot. Crispy pork cutlet, rice is free refill.", "三辣就很辣了，豬排酥脆，白飯免費續。"], 4, "1 week ago"),
      r(["Asked whether the vegetable curry is vegetarian; staff weren't sure.", "問蔬菜咖哩是不是素的，店員也不確定。"], 3, "3 months ago"),
    ],
    dishes: [
      { zh: "豬排咖哩", en: "Pork Cutlet Curry", price: 220, diet: "contains_meat", proteins: ["pork"], spice: 1, tags: ["curry", "rice", "katsu"], popular: true, source: menu },
      { zh: "雞腿咖哩", en: "Chicken Thigh Curry", price: 230, diet: "contains_meat", proteins: ["chicken"], spice: 1, tags: ["curry", "rice"], source: menu },
      { zh: "野菜咖哩", en: "Vegetable Curry", price: 190, diet: "unknown", spice: 1, tags: ["curry", "rice", "vegetables"], description: "Curry roux may contain meat extract; staff unsure.", source: reviews(1) },
      { zh: "辛口牛肉咖哩", en: "Extra-Hot Beef Curry", price: 260, diet: "contains_meat", proteins: ["beef"], spice: 3, tags: ["curry", "rice"], source: menu },
    ],
  },
  {
    id: "hakka-table",
    name: { en: "Hakka Table", zh: "客家小館" },
    district: ZHUBEI,
    address: { en: "Xianzheng 9th Rd, Zhubei", zh: "竹北市縣政九路" },
    location: { lat: 24.8205, lng: 121.023 },
    rating: 4.5,
    reviewCount: 1120,
    priceLevel: 2,
    cuisine: ["hakka", "taiwanese"],
    summary:
      "Hakka home cooking, which Hsinchu County is known for. Hakka stir-fry and braised pork belly are the most ordered. Good place to try lei cha (pounded tea). Heavy on pork; few vegetarian mains.",
    hours: lunchDinner(NOT_MON),
    reviews: [
      r(["Hakka stir-fry is salty in the best way, great with rice. Try the lei cha.", "客家小炒鹹香下飯，擂茶一定要試。"], 5, "1 month ago"),
      r(["Ginger intestines are excellent if you eat offal.", "薑絲炒大腸很厲害，敢吃內臟的必點。"], 5, "4 months ago"),
    ],
    dishes: [
      { zh: "客家小炒", en: "Hakka Stir-Fry", price: 240, diet: "contains_meat", proteins: ["pork", "seafood", "tofu"], spice: 1, tags: ["stir-fry", "squid", "hakka"], description: "Pork belly, dried squid, tofu and celery stir-fried.", popular: true, source: menu },
      { zh: "梅干扣肉", en: "Braised Pork Belly with Preserved Mustard Greens", price: 260, diet: "contains_meat", proteins: ["pork"], tags: ["pork belly", "braised", "hakka"], popular: true, source: menu },
      { zh: "薑絲炒大腸", en: "Stir-Fried Intestines with Ginger", price: 220, diet: "contains_meat", proteins: ["pork", "organ"], spice: 1, tags: ["intestines", "ginger", "hakka"], source: menu },
      { zh: "客家粄條", en: "Hakka Flat Rice Noodles", price: 80, diet: "contains_meat", proteins: ["pork"], tags: ["noodles", "rice noodles", "hakka"], source: menu },
      { zh: "擂茶", en: "Lei Cha (Hakka Pounded Tea)", price: 120, diet: "vegan", tags: ["tea", "drink", "hakka"], source: inferred("traditionally vegan; not confirmed") },
    ],
  },
  {
    id: "morning-light",
    name: { en: "Morning Light Breakfast", zh: "晨光早餐店" },
    district: EAST,
    address: { en: "Dongmen St, East District", zh: "東區東門街" },
    location: { lat: 24.8025, lng: 120.987 },
    rating: 4.0,
    reviewCount: 310,
    priceLevel: 1,
    cuisine: ["breakfast", "taiwanese"],
    summary:
      "Neighborhood Taiwanese breakfast shop. Egg crepes and soy milk are cheap and fast. Closes at 12:30.",
    hours: [{ days: ALL_WEEK, open: "06:00", close: "12:30" }],
    reviews: [
      r(["Classic dan bing, crispy edges. Soy milk not too sweet.", "蛋餅邊緣酥脆，豆漿不會太甜。"], 4, "2 months ago"),
      r(["Cheap and quick before work.", "便宜又快，上班前很方便。"], 4, "8 months ago"),
    ],
    dishes: [
      { zh: "蛋餅", en: "Egg Crepe (Dan Bing)", price: 35, diet: "five_pungent", proteins: ["egg"], tags: ["breakfast", "egg", "crepe"], description: "Thin crepe with egg and scallion.", popular: true, source: menu },
      { zh: "鮪魚蛋餅", en: "Tuna Egg Crepe", price: 45, diet: "contains_meat", proteins: ["seafood", "egg"], tags: ["breakfast", "tuna", "crepe"], source: menu },
      { zh: "蘿蔔糕", en: "Pan-Fried Turnip Cake", price: 35, diet: "unknown", tags: ["breakfast", "turnip cake"], description: "Often contains dried shrimp or pork; not confirmed here.", source: inferred("recipe varies") },
      { zh: "豆漿", en: "Soy Milk", price: 25, diet: "vegan", tags: ["breakfast", "drink"], source: menu },
    ],
  },
  {
    id: "little-bangkok",
    name: { en: "Little Bangkok Thai Kitchen", zh: "小曼谷泰式料理" },
    district: NORTH,
    address: { en: "Beida Rd, North District", zh: "北區北大路" },
    location: { lat: 24.815, lng: 120.96 },
    rating: 4.2,
    reviewCount: 870,
    priceLevel: 2,
    cuisine: ["thai"],
    summary:
      "Thai restaurant with a Taiwanese-style Thai menu. Basil pork and moon shrimp cake are favorites. Papaya salad is very spicy. A vegetarian basil 'pork' made with tofu is on the menu.",
    hours: lunchDinner(),
    reviews: [
      r(["Basil pork over rice is a great quick lunch. Ask for Thai-level spicy if you can take it.", "打拋豬飯很適合午餐，敢吃辣可以要泰式辣度。"], 4, "3 weeks ago"),
      r(["Vegetarian basil tofu is surprisingly good.", "素打拋意外地好吃。"], 4, "2 months ago"),
    ],
    dishes: [
      { zh: "打拋豬", en: "Thai Basil Pork", price: 180, diet: "contains_meat", proteins: ["pork"], spice: 2, tags: ["basil", "rice", "stir-fry"], popular: true, source: menu },
      { zh: "綠咖哩雞", en: "Green Curry Chicken", price: 220, diet: "contains_meat", proteins: ["chicken"], spice: 2, tags: ["curry", "coconut"], source: menu },
      { zh: "月亮蝦餅", en: "Moon Shrimp Cake", price: 260, diet: "contains_meat", proteins: ["seafood"], tags: ["shrimp", "fried"], popular: true, source: menu },
      { zh: "涼拌青木瓜", en: "Green Papaya Salad", price: 150, diet: "contains_meat", proteins: ["seafood"], spice: 3, tags: ["salad", "papaya"], description: "Contains fish sauce and dried shrimp.", source: menu },
      { zh: "素打拋", en: "Vegetarian Basil Tofu", price: 170, diet: "five_pungent", proteins: ["tofu"], spice: 2, tags: ["basil", "tofu", "rice"], source: menu },
    ],
  },
  {
    id: "green-plate",
    name: { en: "Green Plate Vegetarian Buffet", zh: "綠盤素食自助餐" },
    district: NORTH,
    address: { en: "Zhongzheng Rd, North District", zh: "北區中正路" },
    location: { lat: 24.8072, lng: 120.9735 },
    rating: 4.4,
    reviewCount: 650,
    priceLevel: 1,
    cuisine: ["vegetarian", "buffet", "taiwanese"],
    summary:
      "Pay-by-weight vegetarian buffet with around 40 dishes. Labels mark which dishes contain egg, dairy or five pungent spices. Best variety at 11:30 and 17:30.",
    hours: lunchDinner(),
    reviews: [
      r(["Huge variety, everything labelled. Lunch for about NT$100.", "菜色很多都有標示，午餐大約一百元。"], 5, "1 month ago"),
      r(["Mala dried tofu is addictive.", "麻辣豆干會上癮。"], 4, "5 months ago"),
    ],
    dishes: [
      { zh: "素食自助餐", en: "Vegetarian Buffet (pay by weight)", price: 100, diet: "lacto_ovo", tags: ["buffet", "vegetables", "rice"], description: "Around NT$100 for a typical plate.", popular: true, source: reviews(4) },
      { zh: "素肉燥飯", en: "Vegetarian Braised 'Pork' Rice", price: 50, diet: "vegan", proteins: ["tofu"], tags: ["rice", "braised"], popular: true, source: menu },
      { zh: "麻辣豆干", en: "Mala Dried Tofu", price: 40, diet: "vegan", proteins: ["tofu"], spice: 2, tags: ["tofu", "mala", "side"], source: reviews(3) },
      { zh: "咖哩素排", en: "Curry Soy Cutlet", price: 60, diet: "vegan", proteins: ["tofu"], spice: 1, tags: ["curry", "soy"], source: menu },
    ],
  },
];

function build(): Dataset {
  const restaurants: Restaurant[] = [];
  const dishes: Dish[] = [];
  for (const { dishes: specs, ...p } of places) {
    const city = p.district === ZHUBEI ? HSINCHU_COUNTY : HSINCHU_CITY;
    restaurants.push({ ...p, city, mapsUrl: mapsUrl(p.location.lat, p.location.lng) });
    specs.forEach((s, i) => {
      dishes.push({
        id: `${p.id}-${i + 1}`,
        restaurantId: p.id,
        name: { zh: s.zh, en: s.en },
        description: s.description,
        priceTwd: s.price,
        diet: s.diet,
        proteins: s.proteins ?? [],
        spice: s.spice ?? 0,
        tags: s.tags ?? [],
        popular: s.popular,
        source: s.source ?? menu,
      });
    });
  }
  return { generatedAt: "2026-10-04", sample: true, restaurants, dishes };
}

export const SAMPLE_DATA: Dataset = build();

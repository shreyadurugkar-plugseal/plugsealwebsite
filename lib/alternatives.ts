import { Category, Alternative } from "./types";

interface AlternativeRule {
  keywords?: string[];
  alternatives: Alternative[];
}

const RULES: Record<Category, AlternativeRule[]> = {
  "Coffee & Drinks": [
    {
      keywords: ["starbucks", "coffee", "latte", "cappuccino", "espresso"],
      alternatives: [
        {
          suggestion: "Brew coffee at home with a French press or drip machine",
          estimatedSaving: 0,
          savingPercent: 70,
          tip: "A bag of quality beans costs ~$15 and makes 30+ cups vs $5–7 per café visit",
        },
        {
          suggestion: "Try instant premium coffee (Nescafé Gold, Davidoff)",
          estimatedSaving: 0,
          savingPercent: 60,
          tip: "Premium instant coffee tastes great at a fraction of the price",
        },
      ],
    },
    {
      keywords: ["bubble tea", "boba", "smoothie", "juice"],
      alternatives: [
        {
          suggestion: "Make smoothies at home with a blender",
          estimatedSaving: 0,
          savingPercent: 65,
          tip: "Frozen fruit + yogurt + milk = $1–2 vs $6–8 at a shop",
        },
      ],
    },
  ],
  "Food & Dining": [
    {
      keywords: ["uber eats", "doordash", "delivery", "grubhub", "zomato"],
      alternatives: [
        {
          suggestion: "Cook at home or meal prep on weekends",
          estimatedSaving: 0,
          savingPercent: 60,
          tip: "Delivery fees + markup + tips add 30–50% to food cost",
        },
        {
          suggestion: "Pick up food instead of delivery to save fees",
          estimatedSaving: 0,
          savingPercent: 25,
          tip: "Saves delivery fee ($4–8) and avoids surge pricing",
        },
      ],
    },
    {
      keywords: ["restaurant", "dinner", "lunch", "brunch", "eat out"],
      alternatives: [
        {
          suggestion: "Cook the same meal at home",
          estimatedSaving: 0,
          savingPercent: 55,
          tip: "Restaurant meals cost 3–5x more than homemade equivalents",
        },
        {
          suggestion: "Look for lunch specials — same food, lower price",
          estimatedSaving: 0,
          savingPercent: 30,
          tip: "Most restaurants offer 20–40% cheaper lunch menus",
        },
      ],
    },
  ],
  Groceries: [
    {
      keywords: ["whole foods", "organic", "premium"],
      alternatives: [
        {
          suggestion: "Switch to store-brand / generic versions",
          estimatedSaving: 0,
          savingPercent: 30,
          tip: "Store brands are often made by the same manufacturers",
        },
        {
          suggestion: "Shop at discount grocers (Aldi, Lidl, Trader Joe's)",
          estimatedSaving: 0,
          savingPercent: 40,
          tip: "Same nutritional value at significantly lower prices",
        },
      ],
    },
    {
      alternatives: [
        {
          suggestion: "Use a grocery list and avoid impulse buys",
          estimatedSaving: 0,
          savingPercent: 20,
          tip: "Sticking to a list reduces impulse spending by 20–30%",
        },
        {
          suggestion: "Buy in bulk for non-perishables",
          estimatedSaving: 0,
          savingPercent: 25,
          tip: "Bulk buying per-unit cost is 20–40% cheaper",
        },
      ],
    },
  ],
  Subscriptions: [
    {
      keywords: ["netflix", "hulu", "disney+", "hbo", "streaming"],
      alternatives: [
        {
          suggestion: "Use free tier or ad-supported plans (Tubi, Pluto TV)",
          estimatedSaving: 0,
          savingPercent: 100,
          tip: "Many great shows are available completely free with ads",
        },
        {
          suggestion: "Share a family/duo plan with someone",
          estimatedSaving: 0,
          savingPercent: 50,
          tip: "Split the cost with a family member or friend",
        },
      ],
    },
    {
      keywords: ["gym", "fitness", "workout"],
      alternatives: [
        {
          suggestion: "YouTube free workouts (Athlean-X, Yoga with Adriene)",
          estimatedSaving: 0,
          savingPercent: 100,
          tip: "Thousands of free professional workouts on YouTube",
        },
        {
          suggestion: "Try a lower-cost gym (Planet Fitness ~$10/month)",
          estimatedSaving: 0,
          savingPercent: 60,
          tip: "Budget gyms offer the same equipment at a fraction of the cost",
        },
      ],
    },
    {
      alternatives: [
        {
          suggestion: "Audit all your subscriptions — cancel unused ones",
          estimatedSaving: 0,
          savingPercent: 100,
          tip: "The average person has 3–5 forgotten subscriptions they don't use",
        },
        {
          suggestion: "Downgrade to a cheaper tier of this service",
          estimatedSaving: 0,
          savingPercent: 40,
          tip: "Most services offer lower-cost tiers with similar value",
        },
      ],
    },
  ],
  Transport: [
    {
      keywords: ["uber", "lyft", "taxi", "cab", "ride"],
      alternatives: [
        {
          suggestion: "Use public transit (bus / metro / train)",
          estimatedSaving: 0,
          savingPercent: 75,
          tip: "Public transit is 70–85% cheaper than rideshare for regular routes",
        },
        {
          suggestion: "Carpool with colleagues or friends",
          estimatedSaving: 0,
          savingPercent: 50,
          tip: "Split ride costs with others going the same direction",
        },
      ],
    },
    {
      keywords: ["gas", "fuel", "petrol"],
      alternatives: [
        {
          suggestion: "Use GasBuddy app to find cheapest nearby station",
          estimatedSaving: 0,
          savingPercent: 10,
          tip: "Prices vary up to 20 cents/gallon within a few miles",
        },
        {
          suggestion: "Consider carpooling or combining errands into one trip",
          estimatedSaving: 0,
          savingPercent: 30,
          tip: "Fewer trips = less fuel consumed",
        },
      ],
    },
  ],
  Shopping: [
    {
      keywords: ["amazon", "online", "order"],
      alternatives: [
        {
          suggestion: "Use price-tracking tools (CamelCamelCamel, Honey)",
          estimatedSaving: 0,
          savingPercent: 20,
          tip: "Prices fluctuate; buy at historic lows",
        },
        {
          suggestion: "Wait for sales (Black Friday, Prime Day, end of season)",
          estimatedSaving: 0,
          savingPercent: 35,
          tip: "Most items go on sale within 30–90 days",
        },
      ],
    },
    {
      keywords: ["clothes", "clothing", "shoes", "fashion"],
      alternatives: [
        {
          suggestion: "Shop at thrift stores or consignment shops",
          estimatedSaving: 0,
          savingPercent: 70,
          tip: "Quality second-hand clothing at a fraction of retail price",
        },
        {
          suggestion: "Buy during end-of-season clearance sales",
          estimatedSaving: 0,
          savingPercent: 50,
          tip: "Retailers clear inventory at 40–70% off between seasons",
        },
      ],
    },
  ],
  Entertainment: [
    {
      keywords: ["movie", "cinema", "theater"],
      alternatives: [
        {
          suggestion: "Go to matinee showings (30–40% cheaper)",
          estimatedSaving: 0,
          savingPercent: 35,
          tip: "Same film, same screen — just earlier in the day",
        },
        {
          suggestion: "Stream new releases at home (rent for $3–5)",
          estimatedSaving: 0,
          savingPercent: 60,
          tip: "Most films hit streaming within 45–90 days of theater release",
        },
      ],
    },
    {
      alternatives: [
        {
          suggestion: "Look for free community events, parks, and activities",
          estimatedSaving: 0,
          savingPercent: 100,
          tip: "Concerts, festivals, and outdoor activities are often free",
        },
      ],
    },
  ],
  "Health & Fitness": [
    {
      alternatives: [
        {
          suggestion: "Compare prices at GoodRx for prescriptions",
          estimatedSaving: 0,
          savingPercent: 40,
          tip: "GoodRx coupons save 40–80% on many medications",
        },
        {
          suggestion: "Buy generic medication (same active ingredient)",
          estimatedSaving: 0,
          savingPercent: 50,
          tip: "FDA-approved generics are chemically identical to branded drugs",
        },
      ],
    },
  ],
  Utilities: [
    {
      alternatives: [
        {
          suggestion: "Audit energy use — unplug devices in standby mode",
          estimatedSaving: 0,
          savingPercent: 10,
          tip: "Standby power can account for 10% of your electricity bill",
        },
        {
          suggestion: "Switch to LED bulbs if you haven't already",
          estimatedSaving: 0,
          savingPercent: 15,
          tip: "LEDs use 75% less energy and last 25x longer than incandescent",
        },
      ],
    },
  ],
  Other: [
    {
      alternatives: [
        {
          suggestion: "Research if a cheaper alternative exists before buying",
          estimatedSaving: 0,
          savingPercent: 20,
          tip: "A quick 5-minute search often reveals better deals",
        },
        {
          suggestion: "Wait 24 hours before non-essential purchases",
          estimatedSaving: 0,
          savingPercent: 30,
          tip: "The 24-hour rule eliminates most impulse buys",
        },
      ],
    },
  ],
};

export function getAlternatives(
  category: Category,
  name: string
): Alternative[] {
  const rules = RULES[category] || RULES["Other"];
  const nameLower = name.toLowerCase();

  // First try keyword-matched rules
  for (const rule of rules) {
    if (rule.keywords?.some((kw) => nameLower.includes(kw))) {
      return rule.alternatives;
    }
  }

  // Fall back to catch-all rule for the category
  const catchAll = rules.find((r) => !r.keywords);
  return catchAll?.alternatives || RULES["Other"][0].alternatives;
}

export function getTopMoneyLeaks(
  spending: Record<Category, number>
): { category: Category; amount: number; advice: string }[] {
  const leakAdvice: Partial<Record<Category, string>> = {
    "Coffee & Drinks":
      "Daily café visits add up fast — even cutting 3x/week saves $600+/year",
    Subscriptions:
      "Unused subscriptions silently drain your account every month",
    "Food & Dining":
      "Eating out frequently is one of the biggest budget drains",
    Shopping: "Impulse online shopping often leads to unused purchases",
    Transport:
      "Frequent rideshares can cost 5–10x more than public transit over time",
    Entertainment: "Premium entertainment spending adds up quickly",
  };

  return Object.entries(spending)
    .filter(([cat]) => leakAdvice[cat as Category])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat, amount]) => ({
      category: cat as Category,
      amount,
      advice: leakAdvice[cat as Category]!,
    }));
}

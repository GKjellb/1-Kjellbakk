/**
 * Utility functions for aggregating ingredients from weekly planner
 * and categorizing them into Rema 1000 store sections.
 */

export const REMA_CATEGORIES = [
  "Frukt & grønt",
  "Kjøtt & fisk",
  "Meieri & egg",
  "Tørrvarer & hermetikk",
  "Bakevarer",
  "Frysevarer",
  "Saus & krydder",
  "Annet"
];

/**
 * Normalizes item names for accurate aggregation (lowercase trimming)
 */
function normalizeName(name) {
  return name ? name.trim().toLowerCase() : '';
}

/**
 * Generates an aggregated shopping list categorized by Rema 1000 aisles
 */
export function generateShoppingList(weeklyPlan = {}, recipes = [], extraItems = []) {
  const aggregated = {};

  // 1. Process ingredients from planned weekly meals
  Object.entries(weeklyPlan).forEach(([day, plan]) => {
    if (!plan || !plan.recipeId) return;

    const recipe = recipes.find(r => r.id === plan.recipeId);
    if (!recipe || !recipe.ingredients) return;

    const recipeServings = recipe.servings || 4;
    const plannedPortions = plan.portions || 4;
    const scaleFactor = plannedPortions / recipeServings;

    recipe.ingredients.forEach(ing => {
      const category = REMA_CATEGORIES.includes(ing.category) ? ing.category : "Annet";
      const key = `${normalizeName(ing.name)}_${ing.unit || ''}_${category}`;

      const scaledAmount = Math.round((ing.amount * scaleFactor) * 10) / 10;

      if (!aggregated[key]) {
        aggregated[key] = {
          id: key,
          name: ing.name,
          amount: scaledAmount,
          unit: ing.unit || '',
          category: category,
          sources: [recipe.title],
          checked: false
        };
      } else {
        aggregated[key].amount = Math.round((aggregated[key].amount + scaledAmount) * 10) / 10;
        if (!aggregated[key].sources.includes(recipe.title)) {
          aggregated[key].sources.push(recipe.title);
        }
      }
    });
  });

  // Convert aggregated object to array
  const recipeShoppingItems = Object.values(aggregated);

  // 2. Process extra manual shopping list items
  const manualItems = extraItems.map(item => ({
    id: item.id,
    name: item.name,
    amount: null,
    unit: '',
    category: REMA_CATEGORIES.includes(item.category) ? item.category : "Annet",
    sources: ['Manuelt lagt til'],
    checked: Boolean(item.checked),
    isExtra: true
  }));

  // 3. Group by Rema 1000 Categories
  const categorizedList = REMA_CATEGORIES.map(cat => {
    const itemsInCat = [
      ...recipeShoppingItems.filter(i => i.category === cat),
      ...manualItems.filter(i => i.category === cat)
    ];

    return {
      categoryName: cat,
      items: itemsInCat
    };
  }).filter(group => group.items.length > 0);

  return categorizedList;
}

/**
 * Formats full shopping list into plain text for easy copying (SMS / Rema 1000 App)
 */
export function formatShoppingListForCopy(categorizedList) {
  let text = "🛒 *HANDLELISTE FOR REMA 1000*\n\n";

  categorizedList.forEach(group => {
    text += `📍 *${group.categoryName.toUpperCase()}*\n`;
    group.items.forEach(item => {
      const checkMark = item.checked ? "✅" : "◻️";
      const amountStr = item.amount ? ` (${item.amount} ${item.unit})` : '';
      text += `${checkMark} ${item.name}${amountStr}\n`;
    });
    text += "\n";
  });

  text += "Generert av Familie Ukesmeny App 🍎";
  return text;
}

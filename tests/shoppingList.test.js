import test from 'node:test';
import assert from 'node:assert/strict';
import { generateShoppingList, formatShoppingListForCopy } from '../src/utils/shoppingList.js';

const mockRecipes = [
  {
    id: 'rec_1',
    title: 'Kjøttkaker',
    servings: 4,
    ingredients: [
      { name: 'Kjøttdeig', amount: 500, unit: 'g', category: 'Kjøtt & fisk' },
      { name: 'Melk', amount: 2, unit: 'dl', category: 'Meieri & egg' }
    ]
  },
  {
    id: 'rec_2',
    title: 'Laks',
    servings: 4,
    ingredients: [
      { name: 'Laksefilet', amount: 600, unit: 'g', category: 'Kjøtt & fisk' },
      { name: 'Rømme', amount: 1, unit: 'beger', category: 'Meieri & egg' }
    ]
  }
];

test('generateShoppingList correctly aggregates and scales ingredient amounts', () => {
  const mockPlan = {
    Mandag: { recipeId: 'rec_1', portions: 4 }, // 1x scale
    Tirsdag: { recipeId: 'rec_1', portions: 8 } // 2x scale
  };

  const categorizedList = generateShoppingList(mockPlan, mockRecipes, []);

  // Find Kjøtt & fisk category
  const kjottGroup = categorizedList.find(g => g.categoryName === 'Kjøtt & fisk');
  assert.ok(kjottGroup, 'Should contain Kjøtt & fisk category');

  const kjottdeigItem = kjottGroup.items.find(i => i.name === 'Kjøttdeig');
  assert.ok(kjottdeigItem, 'Should contain Kjøttdeig item');
  // 500g + 1000g = 1500g
  assert.equal(kjottdeigItem.amount, 1500);

  const meieriGroup = categorizedList.find(g => g.categoryName === 'Meieri & egg');
  const melkItem = meieriGroup.items.find(i => i.name === 'Melk');
  // 2dl + 4dl = 6dl
  assert.equal(melkItem.amount, 6);
});

test('generateShoppingList includes extra manual items under correct categories', () => {
  const extraItems = [
    { id: 'ex_1', name: 'Bananer', category: 'Frukt & grønt', checked: false }
  ];

  const categorizedList = generateShoppingList({}, mockRecipes, extraItems);
  const fruktGroup = categorizedList.find(g => g.categoryName === 'Frukt & grønt');

  assert.ok(fruktGroup, 'Should contain Frukt & grønt group');
  assert.equal(fruktGroup.items[0].name, 'Bananer');
  assert.equal(fruktGroup.items[0].isExtra, true);
});

test('formatShoppingListForCopy formats text string with header and categories', () => {
  const categorizedList = [
    {
      categoryName: 'Meieri & egg',
      items: [
        { name: 'Melk', amount: 1.5, unit: 'L', checked: false }
      ]
    }
  ];

  const output = formatShoppingListForCopy(categorizedList);
  assert.ok(output.includes('HANDLELISTE FOR REMA 1000'));
  assert.ok(output.includes('MEIERI & EGG'));
  assert.ok(output.includes('Melk (1.5 L)'));
});

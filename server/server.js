import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getISOWeekKey } from '../src/utils/dateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');
const INITIAL_DATA_FILE = path.join(__dirname, 'initialData.json');

const DEFAULT_EMPTY_WEEK = {
  Mandag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' },
  Tirsdag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' },
  Onsdag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' },
  Torsdag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' },
  Fredag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' },
  Lørdag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' },
  Søndag: { recipeId: null, customTitle: null, portions: 4, customNotes: '' }
};

// Ensure data file exists and migrate schema if needed
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
    fs.writeFileSync(DATA_FILE, initialData, 'utf-8');
  }
  const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(fileContent);

  // Schema migration for multi-week support
  const currentWeek = getISOWeekKey();
  if (!data.weeklyPlans) {
    data.weeklyPlans = {};
    if (data.weeklyPlan) {
      data.weeklyPlans[currentWeek] = data.weeklyPlan;
    } else {
      data.weeklyPlans[currentWeek] = { ...DEFAULT_EMPTY_WEEK };
    }
  }

  // Ensure current week is set if legacy weeklyPlan exists
  data.weeklyPlan = data.weeklyPlans[currentWeek] || { ...DEFAULT_EMPTY_WEEK };

  return data;
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Routes
// 1. Get initial app state (accepts ?week=2026-W41)
app.get('/api/state', (req, res) => {
  try {
    const data = loadData();
    const requestedWeek = req.query.week || getISOWeekKey();

    // Ensure the requested week exists in data
    if (!data.weeklyPlans[requestedWeek]) {
      data.weeklyPlans[requestedWeek] = JSON.parse(JSON.stringify(DEFAULT_EMPTY_WEEK));
    }

    // Set active weeklyPlan representation for requested week
    const responseData = {
      ...data,
      currentWeekKey: requestedWeek,
      weeklyPlan: data.weeklyPlans[requestedWeek] || JSON.parse(JSON.stringify(DEFAULT_EMPTY_WEEK))
    };

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data', message: err.message });
  }
});

// 2. Add or update recipe
app.post('/api/recipes', (req, res) => {
  try {
    const data = loadData();
    const newRecipe = req.body;

    if (!newRecipe.id) {
      newRecipe.id = 'rec_' + Date.now();
    }

    const existingIndex = data.recipes.findIndex(r => r.id === newRecipe.id);
    if (existingIndex >= 0) {
      data.recipes[existingIndex] = newRecipe;
    } else {
      data.recipes.push(newRecipe);
    }

    saveData(data);
    res.json({ success: true, recipe: newRecipe, recipes: data.recipes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipe', message: err.message });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', (req, res) => {
  try {
    const data = loadData();
    data.recipes = data.recipes.filter(r => r.id !== req.params.id);
    saveData(data);
    res.json({ success: true, recipes: data.recipes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe', message: err.message });
  }
});

// 3. Update weekly menu plan for specific week
app.put('/api/weekly-plan', (req, res) => {
  try {
    const data = loadData();
    const weekKey = req.body.week || req.query.week || getISOWeekKey();
    const newPlan = req.body.plan || req.body;

    if (!data.weeklyPlans) {
      data.weeklyPlans = {};
    }

    data.weeklyPlans[weekKey] = newPlan;
    // Keep legacy field synced if current week
    if (weekKey === getISOWeekKey()) {
      data.weeklyPlan = newPlan;
    }

    saveData(data);
    res.json({ success: true, weekKey, weeklyPlan: data.weeklyPlans[weekKey] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update weekly plan', message: err.message });
  }
});

// 4. Recipe Generator Endpoint
app.post('/api/generate-recipe', (req, res) => {
  try {
    const { ingredientsPrompt } = req.body;
    if (!ingredientsPrompt || !ingredientsPrompt.trim()) {
      return res.status(400).json({ error: 'Ingredienser må oppgis' });
    }

    const rawInputs = ingredientsPrompt
      .split(/[,;\n]+/)
      .map(i => i.trim())
      .filter(Boolean);

    const primaryIngredient = rawInputs[0] ? rawInputs[0].toLowerCase() : 'råvarer';
    const allIngredientsStr = rawInputs.join(', ');

    // Automatic high quality image matching based on main ingredients
    let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'; // default bowl
    let category = 'Middag';

    if (primaryIngredient.includes('kylling') || primaryIngredient.includes('høne')) {
      imageUrl = 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80';
      category = 'Kylling';
    } else if (primaryIngredient.includes('laks') || primaryIngredient.includes('fisk') || primaryIngredient.includes('torsk') || primaryIngredient.includes('reker')) {
      imageUrl = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80';
      category = 'Fisk';
    } else if (primaryIngredient.includes('pasta') || primaryIngredient.includes('spagetti') || primaryIngredient.includes('penne')) {
      imageUrl = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
      category = 'Pasta';
    } else if (primaryIngredient.includes('kjøtt') || primaryIngredient.includes('biff') || primaryIngredient.includes('kjøttdeig') || primaryIngredient.includes('karbonadedeig')) {
      imageUrl = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
      category = 'Middag';
    } else if (primaryIngredient.includes('søtpotet') || primaryIngredient.includes('gulrot') || primaryIngredient.includes('grønnsak') || primaryIngredient.includes('salat') || primaryIngredient.includes('linser')) {
      imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
      category = 'Vegetar';
    } else if (primaryIngredient.includes('taco') || primaryIngredient.includes('tortilla')) {
      imageUrl = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80';
      category = 'Fredagskos';
    } else if (primaryIngredient.includes('egg') || primaryIngredient.includes('ost')) {
      imageUrl = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80';
      category = 'Middag';
    }

    const titleCap = primaryIngredient.charAt(0).toUpperCase() + primaryIngredient.slice(1);
    const generatedTitle = `Gourmet ${titleCap} med ferske råvarer`;

    // Map ingredients to Rema categories
    const generatedIngredients = rawInputs.map((ing) => {
      const lower = ing.toLowerCase();
      let ingCategory = 'Frukt & grønt';
      let amount = 2;
      let unit = 'stk';

      if (lower.includes('kylling') || lower.includes('fisk') || lower.includes('laks') || lower.includes('kjøtt') || lower.includes('biff') || lower.includes('kjøttdeig')) {
        ingCategory = 'Kjøtt & fisk';
        amount = 500;
        unit = 'g';
      } else if (lower.includes('melk') || lower.includes('ost') || lower.includes('rømme') || lower.includes('smør') || lower.includes('fløte')) {
        ingCategory = 'Meieri & egg';
        amount = 2;
        unit = 'dl';
      } else if (lower.includes('ris') || lower.includes('pasta') || lower.includes('mel') || lower.includes('boks')) {
        ingCategory = 'Tørrvarer & hermetikk';
        amount = 300;
        unit = 'g';
      }

      return {
        name: ing.charAt(0).toUpperCase() + ing.slice(1),
        amount,
        unit,
        category: ingCategory
      };
    });

    // Add basic pantry staples if needed
    generatedIngredients.push(
      { name: 'Olivenolje & Smør', amount: 2, unit: 'ss', category: 'Saus & krydder' },
      { name: 'Salt og kvernet pepper', amount: 1, unit: 'ts', category: 'Saus & krydder' }
    );

    const generatedRecipe = {
      id: 'gen_rec_' + Date.now(),
      title: generatedTitle,
      category,
      prepTime: '25 min',
      servings: 4,
      description: `Generert middagskreasjon basert på: ${allIngredientsStr}. En smaksrik, balansert og lettvint rett for hele familien.`,
      image: imageUrl,
      ingredients: generatedIngredients,
      instructions: [
        `Klargjør og kutt alle råvarene (${allIngredientsStr}).`,
        `Varm opp en panne eller kjele med olivenolje/smør over middels sterk varme.`,
        `Tilsett hovedingrediensene og brun raskt til det sprudler og lukter herlig.`,
        `Krydre godt med salt, pepper og dine favorittkrydder, og la rettens smaker smelte sammen i 12-15 minutter.`,
        `Anrett delikat på tallerkener og nyt et ferskt, hjemmelaget måltid!`
      ]
    };

    res.json({ success: true, recipe: generatedRecipe });
  } catch (err) {
    res.status(500).json({ error: 'Klarte ikke å generere oppskrift', message: err.message });
  }
});

// 5. Suggestions API
app.post('/api/suggestions', (req, res) => {
  try {
    const data = loadData();
    const newSuggestion = {
      id: 'sug_' + Date.now(),
      authorId: req.body.authorId || 'felles',
      authorName: req.body.authorName || 'Familien',
      dishTitle: req.body.dishTitle,
      comment: req.body.comment || '',
      likes: req.body.authorId ? [req.body.authorId] : [],
      createdAt: new Date().toISOString()
    };
    data.suggestions.push(newSuggestion);
    saveData(data);
    res.json({ success: true, suggestion: newSuggestion, suggestions: data.suggestions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add suggestion', message: err.message });
  }
});

// Toggle Like on Suggestion
app.post('/api/suggestions/:id/like', (req, res) => {
  try {
    const { userId } = req.body;
    const data = loadData();
    const sug = data.suggestions.find(s => s.id === req.params.id);
    if (sug) {
      if (!sug.likes) sug.likes = [];
      const index = sug.likes.indexOf(userId);
      if (index >= 0) {
        sug.likes.splice(index, 1);
      } else {
        sug.likes.push(userId);
      }
      saveData(data);
      res.json({ success: true, suggestions: data.suggestions });
    } else {
      res.status(404).json({ error: 'Suggestion not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to like suggestion', message: err.message });
  }
});

// Delete Suggestion
app.delete('/api/suggestions/:id', (req, res) => {
  try {
    const data = loadData();
    data.suggestions = data.suggestions.filter(s => s.id !== req.params.id);
    saveData(data);
    res.json({ success: true, suggestions: data.suggestions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete suggestion', message: err.message });
  }
});

// 6. Extra Shopping items API
app.post('/api/extra-shopping-items', (req, res) => {
  try {
    const data = loadData();
    const newItem = {
      id: 'extra_' + Date.now(),
      name: req.body.name,
      category: req.body.category || 'Annet',
      checked: false
    };
    data.extraShoppingItems.push(newItem);
    saveData(data);
    res.json({ success: true, item: newItem, extraShoppingItems: data.extraShoppingItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add extra shopping item', message: err.message });
  }
});

app.patch('/api/extra-shopping-items/:id', (req, res) => {
  try {
    const data = loadData();
    const item = data.extraShoppingItems.find(i => i.id === req.params.id);
    if (item) {
      if (typeof req.body.checked === 'boolean') item.checked = req.body.checked;
      saveData(data);
      res.json({ success: true, extraShoppingItems: data.extraShoppingItems });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', message: err.message });
  }
});

app.delete('/api/extra-shopping-items/:id', (req, res) => {
  try {
    const data = loadData();
    data.extraShoppingItems = data.extraShoppingItems.filter(i => i.id !== req.params.id);
    saveData(data);
    res.json({ success: true, extraShoppingItems: data.extraShoppingItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', message: err.message });
  }
});

app.post('/api/reset-data', (req, res) => {
  try {
    const initialData = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
    fs.writeFileSync(DATA_FILE, initialData, 'utf-8');
    const data = JSON.parse(initialData);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

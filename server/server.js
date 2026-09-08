import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');
const INITIAL_DATA_FILE = path.join(__dirname, 'initialData.json');

// Ensure data file exists
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
    fs.writeFileSync(DATA_FILE, initialData, 'utf-8');
  }
  const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Routes
// 1. Get initial app state
app.get('/api/state', (req, res) => {
  try {
    const data = loadData();
    res.json(data);
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

// 3. Update weekly menu plan
app.put('/api/weekly-plan', (req, res) => {
  try {
    const data = loadData();
    data.weeklyPlan = req.body;
    saveData(data);
    res.json({ success: true, weeklyPlan: data.weeklyPlan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update weekly plan', message: err.message });
  }
});

// 4. Suggestions API
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

// 5. Extra Shopping items API
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

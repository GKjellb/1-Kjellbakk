import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Lightbulb, ShoppingBag, Utensils, RefreshCw, Smartphone } from 'lucide-react';
import WeeklyPlanner from './components/WeeklyPlanner';
import RecipeCatalog from './components/RecipeCatalog';
import FamilySection from './components/FamilySection';
import ShoppingList from './components/ShoppingList';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'recipes' | 'suggestions' | 'shopping'
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    familyMembers: [],
    categories: [],
    recipes: [],
    weeklyPlan: {},
    suggestions: [],
    extraShoppingItems: []
  });

  const [activeProfile, setActiveProfile] = useState(null);

  // Fetch state on mount
  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/state');
      const data = await res.json();
      setState(data);
      if (data.familyMembers?.length > 0 && !activeProfile) {
        setActiveProfile(data.familyMembers[0]);
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  };

  // API Call Helpers
  const handleSaveRecipe = async (recipeData) => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, recipes: data.recipes }));
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, recipes: data.recipes }));
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const handleUpdateWeeklyPlan = async (newPlan) => {
    try {
      setState((prev) => ({ ...prev, weeklyPlan: newPlan }));
      await fetch('/api/weekly-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      });
    } catch (err) {
      console.error('Error updating weekly plan:', err);
    }
  };

  const handleAddSuggestion = async (suggestionData) => {
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestionData)
      });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, suggestions: data.suggestions }));
      }
    } catch (err) {
      console.error('Error adding suggestion:', err);
    }
  };

  const handleLikeSuggestion = async (id, userId) => {
    try {
      const res = await fetch(`/api/suggestions/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, suggestions: data.suggestions }));
      }
    } catch (err) {
      console.error('Error liking suggestion:', err);
    }
  };

  const handleDeleteSuggestion = async (id) => {
    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, suggestions: data.suggestions }));
      }
    } catch (err) {
      console.error('Error deleting suggestion:', err);
    }
  };

  const handleAddExtraShoppingItem = async (itemData) => {
    try {
      const res = await fetch('/api/extra-shopping-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, extraShoppingItems: data.extraShoppingItems }));
      }
    } catch (err) {
      console.error('Error adding extra shopping item:', err);
    }
  };

  const handleToggleExtraShoppingItem = async (id, checked) => {
    try {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        extraShoppingItems: prev.extraShoppingItems.map((item) =>
          item.id === id ? { ...item, checked } : item
        )
      }));

      await fetch(`/api/extra-shopping-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked })
      });
    } catch (err) {
      console.error('Error toggling extra shopping item:', err);
    }
  };

  const handleDeleteExtraShoppingItem = async (id) => {
    try {
      const res = await fetch(`/api/extra-shopping-items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, extraShoppingItems: data.extraShoppingItems }));
      }
    } catch (err) {
      console.error('Error deleting extra shopping item:', err);
    }
  };

  const handleResetData = async () => {
    if (confirm('Vil du tilbakestille ukesmenyen og alle data til startverdier?')) {
      try {
        const res = await fetch('/api/reset-data', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setState(data.data);
          setActiveProfile(data.data.familyMembers[0]);
        }
      } catch (err) {
        console.error('Error resetting data:', err);
      }
    }
  };

  if (loading || !activeProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-rema-blue">
        <div className="text-center space-y-3">
          <RefreshCw className="animate-spin w-10 h-10 mx-auto" />
          <p className="font-bold text-lg">Laster inn familiens meny...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="bg-rema-blue text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-rema-red rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight">Familie Ukesmeny</h1>
              <p className="text-[11px] text-blue-200 flex items-center gap-1">
                <Smartphone size={12} /> Mobil- og Rema 1000 synkronisert
              </p>
            </div>
          </div>

          {/* User selector header menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="hidden sm:flex text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors text-blue-100"
              title="Nullstill eksempeldata"
            >
              Tilbakestill
            </button>

            <div className="flex items-center gap-2 bg-blue-950/60 p-1.5 rounded-xl border border-white/10">
              <span className="text-lg">{activeProfile.avatar}</span>
              <span className="text-xs font-bold hidden xs:inline pr-1">{activeProfile.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'planner' && (
          <WeeklyPlanner
            weeklyPlan={state.weeklyPlan}
            recipes={state.recipes}
            suggestions={state.suggestions}
            onUpdatePlan={handleUpdateWeeklyPlan}
            onNavigateToShoppingList={() => setActiveTab('shopping')}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipeCatalog
            recipes={state.recipes}
            categories={state.categories}
            onSaveRecipe={handleSaveRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onSelectForPlanner={(recipe) => {
              setActiveTab('planner');
            }}
          />
        )}

        {activeTab === 'suggestions' && (
          <FamilySection
            familyMembers={state.familyMembers}
            activeProfile={activeProfile}
            onSelectProfile={setActiveProfile}
            suggestions={state.suggestions}
            onAddSuggestion={handleAddSuggestion}
            onLikeSuggestion={handleLikeSuggestion}
            onDeleteSuggestion={handleDeleteSuggestion}
            onAddToPlanner={(dishTitle) => {
              setActiveTab('planner');
            }}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingList
            weeklyPlan={state.weeklyPlan}
            recipes={state.recipes}
            extraItems={state.extraShoppingItems}
            onAddExtraItem={handleAddExtraShoppingItem}
            onToggleExtraItem={handleToggleExtraShoppingItem}
            onDeleteExtraItem={handleDeleteExtraShoppingItem}
          />
        )}
      </main>

      {/* Mobile-first Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'planner' ? 'text-rema-blue font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calendar size={20} />
            <span className="text-[11px]">Ukesmeny</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'recipes' ? 'text-rema-blue font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-[11px]">Oppskrifter</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'suggestions' ? 'text-rema-blue font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Lightbulb size={20} />
            <span className="text-[11px]">Forslag</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              activeTab === 'shopping' ? 'text-rema-blue font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingBag size={20} />
            <span className="text-[11px]">Handleliste</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

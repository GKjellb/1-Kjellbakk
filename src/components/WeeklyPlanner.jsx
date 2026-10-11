import React, { useState } from 'react';
import { Calendar, Plus, Users, Trash2, ChevronLeft, ChevronRight, ShoppingBag, Sparkles, X, Clock, Wand2, Eye, RotateCcw } from 'lucide-react';
import RecipeGeneratorModal from './RecipeGeneratorModal';

const DAYS_OF_WEEK = [
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
  'Søndag'
];

export default function WeeklyPlanner({
  selectedWeek,
  onNavigateWeek,
  onResetToCurrentWeek,
  isCurrentWeek,
  weeklyPlan,
  recipes,
  suggestions,
  onUpdatePlan,
  onSaveRecipe,
  onNavigateToShoppingList
}) {
  const [editingDay, setEditingDay] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const [modalMode, setModalMode] = useState('recipe'); // 'recipe' | 'custom'
  const [customTitle, setCustomTitle] = useState('');
  const [portions, setPortions] = useState(4);
  const [notes, setNotes] = useState('');

  // Handle clicking on a day card
  const handleDayClick = (day) => {
    const dayData = weeklyPlan[day] || { recipeId: null, portions: 4, customNotes: '', customTitle: '' };
    const recipe = dayData.recipeId ? recipes.find((r) => r.id === dayData.recipeId) : null;

    if (recipe) {
      // If day has a full recipe attached, open interactive recipe modal
      setViewingRecipe({ day, recipe, dayData });
    } else {
      // Open day selection modal
      handleOpenDayModal(day);
    }
  };

  const handleOpenDayModal = (day) => {
    setViewingRecipe(null);
    setEditingDay(day);
    const dayData = weeklyPlan[day] || { recipeId: null, portions: 4, customNotes: '', customTitle: '' };
    setPortions(dayData.portions || 4);
    setNotes(dayData.customNotes || '');
    setCustomTitle(dayData.customTitle || '');
    setModalMode('recipe');
  };

  const handleAssignRecipe = (recipeId, dayOverride = null) => {
    const dayToUse = dayOverride || editingDay;
    if (!dayToUse) return;
    const updatedPlan = {
      ...weeklyPlan,
      [dayToUse]: {
        recipeId,
        customTitle: null,
        portions: portions || 4,
        customNotes: notes || ''
      }
    };
    onUpdatePlan(updatedPlan);
    setEditingDay(null);
    setViewingRecipe(null);
  };

  const handleAssignCustomDish = (titleToUse) => {
    if (!editingDay) return;
    const finalTitle = titleToUse || customTitle;
    if (!finalTitle.trim()) return;

    const updatedPlan = {
      ...weeklyPlan,
      [editingDay]: {
        recipeId: null,
        customTitle: finalTitle.trim(),
        portions,
        customNotes: notes
      }
    };
    onUpdatePlan(updatedPlan);
    setEditingDay(null);
  };

  const handleClearDay = (day, e) => {
    if (e) e.stopPropagation();
    const updatedPlan = {
      ...weeklyPlan,
      [day]: { recipeId: null, customTitle: null, portions: 4, customNotes: '' }
    };
    onUpdatePlan(updatedPlan);
    if (viewingRecipe?.day === day) {
      setViewingRecipe(null);
    }
  };

  const handlePortionChange = (day, newPortions, e) => {
    if (e) e.stopPropagation();
    if (newPortions < 1) return;
    const currentDay = weeklyPlan[day] || {};
    const updatedPlan = {
      ...weeklyPlan,
      [day]: {
        ...currentDay,
        portions: newPortions
      }
    };
    onUpdatePlan(updatedPlan);
    if (viewingRecipe && viewingRecipe.day === day) {
      setViewingRecipe((prev) => ({
        ...prev,
        dayData: { ...prev.dayData, portions: newPortions }
      }));
    }
  };

  // Helper for week label formatting, e.g. "2026-W41" -> "Uke 41 (2026)"
  const formatWeekLabel = (weekKey) => {
    if (!weekKey) return 'Denne uken';
    const parts = weekKey.split('-W');
    if (parts.length === 2) {
      return `Uke ${parseInt(parts[1], 10)} (${parts[0]})`;
    }
    return weekKey;
  };

  // Calculate planned meals count
  const totalPlannedMeals = Object.values(weeklyPlan).filter(
    (d) => d.recipeId || d.customTitle
  ).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Week Navigation Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Calendar className="text-rema-blue" /> Ukens Middagsmeny
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Planlegg middager uker i forveien eller se tilbake på tidligere menyhistorikk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* AI Recipe Generator Launch Button */}
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Wand2 size={16} /> Oppskrift-generator
            </button>

            <button
              onClick={onNavigateToShoppingList}
              className="px-4 py-2.5 bg-rema-red hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={16} /> Handleliste
            </button>
          </div>
        </div>

        {/* Week Selector Ribbon */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => onNavigateWeek(-1)}
              className="p-2 hover:bg-white rounded-lg text-gray-700 hover:text-rema-blue transition-colors shadow-none hover:shadow-sm"
              title="Forrige uke"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-black text-rema-blue px-3">
              {formatWeekLabel(selectedWeek)}
            </span>

            <button
              onClick={() => onNavigateWeek(1)}
              className="p-2 hover:bg-white rounded-lg text-gray-700 hover:text-rema-blue transition-colors shadow-none hover:shadow-sm"
              title="Neste uke"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {!isCurrentWeek && (
              <button
                onClick={onResetToCurrentWeek}
                className="px-3 py-1.5 bg-blue-50 text-rema-blue hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={14} /> Gå til denne uken
              </button>
            )}

            <div className="bg-blue-50 text-rema-blue px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-100">
              <Sparkles size={14} /> {totalPlannedMeals} av 7 dager planlagt
            </div>
          </div>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayData = weeklyPlan[day] || {};
          const recipe = dayData.recipeId
            ? recipes.find((r) => r.id === dayData.recipeId)
            : null;
          const dishName = recipe ? recipe.title : dayData.customTitle;
          const hasDish = Boolean(dishName);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`group bg-white rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                hasDish
                  ? 'border-blue-200 shadow-sm hover:border-rema-blue hover:shadow-md'
                  : 'border-dashed border-gray-300 hover:border-rema-blue bg-gray-50/50'
              }`}
            >
              <div>
                {/* Day title & actions */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-rema-blue bg-rema-lightBlue px-2.5 py-1 rounded-lg">
                    {day}
                  </span>

                  {hasDish && (
                    <button
                      onClick={(e) => handleClearDay(day, e)}
                      className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                      title="Fjern fra dagsmeny"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Dish content */}
                {hasDish ? (
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      {recipe?.image ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-rema-blue shrink-0">
                          <Eye size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-rema-blue transition-colors line-clamp-2">
                          {dishName}
                        </h3>
                        {recipe ? (
                          <span className="inline-block mt-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {recipe.category}
                          </span>
                        ) : (
                          <span className="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Egendefinert rett
                          </span>
                        )}
                      </div>
                    </div>

                    {dayData.customNotes && (
                      <p className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-200/60 font-medium">
                        💬 {dayData.customNotes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-400 group-hover:text-rema-blue group-hover:border-rema-blue transition-all mb-2">
                      <Plus size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500">Velg rett for {day}</p>
                  </div>
                )}
              </div>

              {/* Footer controls */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                {hasDish ? (
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold" onClick={(e) => e.stopPropagation()}>
                    <Users size={15} className="text-gray-400" />
                    <span>Porsjoner:</span>
                    <button
                      onClick={(e) => handlePortionChange(day, (dayData.portions || 4) - 1, e)}
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-800 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-4 text-center">{dayData.portions || 4}</span>
                    <button
                      onClick={(e) => handlePortionChange(day, (dayData.portions || 4) + 1, e)}
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-800 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-gray-400">Klikk for å planlegge</span>
                )}

                <span className="text-xs font-semibold text-rema-blue flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {recipe ? 'Vis oppskrift' : 'Endre'} <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Recipe Details Modal for Planned Day */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header image */}
            <div className="relative h-56 bg-gray-200">
              <img
                src={viewingRecipe.recipe.image}
                alt={viewingRecipe.recipe.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingRecipe(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute top-4 left-4 bg-rema-blue text-white px-3 py-1 rounded-xl text-xs font-black shadow">
                {viewingRecipe.day} Middag
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{viewingRecipe.recipe.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{viewingRecipe.recipe.description}</p>

                <div className="flex gap-4 mt-3 text-xs font-bold text-gray-600">
                  <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                    <Clock size={14} className="text-rema-blue" /> {viewingRecipe.recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                    <Users size={14} className="text-rema-blue" /> {viewingRecipe.dayData.portions || viewingRecipe.recipe.servings} porsjoner
                  </span>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-1">
                  Ingredienser for Rema 1000
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {viewingRecipe.recipe.ingredients?.map((ing, idx) => {
                    const scaledAmount = Math.round(
                      ((ing.amount * (viewingRecipe.dayData.portions || 4)) / (viewingRecipe.recipe.servings || 4)) * 10
                    ) / 10;
                    return (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span>{ing.name}</span>
                        <span className="font-bold text-gray-900">
                          {scaledAmount} {ing.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-1">
                  Fremgangsmåte
                </h3>
                <ol className="space-y-2.5 text-xs text-gray-700">
                  {viewingRecipe.recipe.instructions?.map((inst, idx) => (
                    <li key={idx} className="flex gap-3 items-start bg-blue-50/20 p-2.5 rounded-xl border border-blue-50">
                      <span className="bg-rema-blue text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer controls */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={(e) => handleClearDay(viewingRecipe.day, e)}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={15} /> Fjern fra {viewingRecipe.day}
              </button>

              <button
                onClick={() => {
                  const day = viewingRecipe.day;
                  setViewingRecipe(null);
                  handleOpenDayModal(day);
                }}
                className="px-5 py-2 bg-rema-blue text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors"
              >
                Bytt middag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for selecting meal for a specific day */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-rema-blue text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">Planlegg dag</span>
                <h2 className="text-xl font-bold">Velg middag for {editingDay}</h2>
              </div>
              <button
                onClick={() => setEditingDay(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Controls bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Antall porsjoner (for handleliste)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={portions}
                    onChange={(e) => setPortions(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rema-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kommentar / Notat (valgfritt)
                  </label>
                  <input
                    type="text"
                    placeholder="f.eks. Trening kl 18 / Besøk"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rema-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Mode switch buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setModalMode('recipe')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    modalMode === 'recipe'
                      ? 'bg-rema-blue text-white shadow-sm'
                      : 'bg-white border text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Fra Oppskriftsboken
                </button>
                <button
                  onClick={() => setModalMode('custom')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    modalMode === 'custom'
                      ? 'bg-rema-blue text-white shadow-sm'
                      : 'bg-white border text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Egendefinert Rett / Ønske
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {modalMode === 'recipe' ? (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Velg oppskrift
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {recipes.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleAssignRecipe(r.id)}
                        className="p-3 bg-white border border-gray-200 rounded-xl hover:border-rema-blue hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={r.image}
                            alt={r.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-rema-blue">
                              {r.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {r.category} • {r.prepTime}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-rema-blue bg-blue-100 px-3 py-1 rounded-lg">
                          Velg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Skriv inn navn på retten</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="f.eks. Bestilling fra Peppes Pizza, Restemiddag..."
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-rema-blue focus:outline-none"
                      />
                      <button
                        onClick={() => handleAssignCustomDish()}
                        className="px-4 py-2 bg-rema-blue text-white rounded-xl text-sm font-bold hover:bg-blue-900"
                      >
                        Lagre
                      </button>
                    </div>
                  </div>

                  {/* Suggestions list */}
                  {suggestions && suggestions.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Eller velg et forslag fra familien
                      </h4>
                      <div className="space-y-2">
                        {suggestions.map((sug) => (
                          <div
                            key={sug.id}
                            onClick={() => handleAssignCustomDish(sug.dishTitle)}
                            className="p-3 bg-yellow-50/60 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{sug.dishTitle}</p>
                              <p className="text-xs text-gray-500">Foreslått av {sug.authorName}</p>
                            </div>
                            <span className="text-xs font-bold text-amber-800 bg-yellow-200 px-2.5 py-1 rounded-lg">
                              Bruk denne
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Recipe Generator Modal */}
      <RecipeGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSaveRecipe={onSaveRecipe}
        onSelectForDay={(recipe) => {
          if (editingDay) {
            handleAssignRecipe(recipe.id, editingDay);
          } else {
            // Find first day without a dish, default to Mandag
            const freeDay = DAYS_OF_WEEK.find((d) => !weeklyPlan[d]?.recipeId && !weeklyPlan[d]?.customTitle) || 'Mandag';
            handleAssignRecipe(recipe.id, freeDay);
          }
        }}
      />
    </div>
  );
}

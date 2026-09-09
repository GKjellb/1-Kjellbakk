import React, { useState } from 'react';
import { Calendar, Plus, Users, Trash2, Edit3, ChevronRight, ShoppingBag, Sparkles, X } from 'lucide-react';

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
  weeklyPlan,
  recipes,
  suggestions,
  onUpdatePlan,
  onNavigateToShoppingList
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalMode, setModalMode] = useState('recipe'); // 'recipe' | 'custom'
  const [customTitle, setCustomTitle] = useState('');
  const [portions, setPortions] = useState(4);
  const [notes, setNotes] = useState('');

  const handleOpenDayModal = (day) => {
    setSelectedDay(day);
    const dayData = weeklyPlan[day] || { recipeId: null, portions: 4, customNotes: '' };
    setPortions(dayData.portions || 4);
    setNotes(dayData.customNotes || '');
    setCustomTitle(dayData.customTitle || '');
    setModalMode(dayData.recipeId ? 'recipe' : 'recipe');
  };

  const handleAssignRecipe = (recipeId) => {
    if (!selectedDay) return;
    const updatedPlan = {
      ...weeklyPlan,
      [selectedDay]: {
        recipeId,
        customTitle: null,
        portions,
        customNotes: notes
      }
    };
    onUpdatePlan(updatedPlan);
    setSelectedDay(null);
  };

  const handleAssignCustomDish = (titleToUse) => {
    if (!selectedDay) return;
    const finalTitle = titleToUse || customTitle;
    if (!finalTitle.trim()) return;

    const updatedPlan = {
      ...weeklyPlan,
      [selectedDay]: {
        recipeId: null,
        customTitle: finalTitle.trim(),
        portions,
        customNotes: notes
      }
    };
    onUpdatePlan(updatedPlan);
    setSelectedDay(null);
  };

  const handleClearDay = (day, e) => {
    e.stopPropagation();
    const updatedPlan = {
      ...weeklyPlan,
      [day]: { recipeId: null, customTitle: null, portions: 4, customNotes: '' }
    };
    onUpdatePlan(updatedPlan);
  };

  const handlePortionChange = (day, newPortions, e) => {
    e.stopPropagation();
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
  };

  // Calculate planned meals count
  const totalPlannedMeals = Object.values(weeklyPlan).filter(
    (d) => d.recipeId || d.customTitle
  ).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-rema-blue" /> Ukens Middagsmeny
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Planlegg måltider for uken. Ingredienser legges automatisk til i Rema 1000-handlelisten.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-blue-50 text-rema-blue px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-100">
            <Sparkles size={16} /> {totalPlannedMeals} av 7 dager planlagt
          </div>
          <button
            onClick={onNavigateToShoppingList}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-rema-red hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} /> Se Handleliste
          </button>
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
              onClick={() => handleOpenDayModal(day)}
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
                      {recipe?.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-rema-blue transition-colors line-clamp-2">
                          {dishName}
                        </h3>
                        {recipe && (
                          <span className="inline-block mt-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {recipe.category}
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
                  Endre <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for selecting meal for a specific day */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-rema-blue text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">Planlegg dag</span>
                <h2 className="text-xl font-bold">Velg middag for {selectedDay}</h2>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Controls bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
              {/* Portions & Notes input */}
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

                  {/* Show suggestions from family if any */}
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
    </div>
  );
}

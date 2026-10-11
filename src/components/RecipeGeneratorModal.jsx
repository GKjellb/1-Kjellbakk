import React, { useState } from 'react';
import { Sparkles, X, Wand2, PlusCircle, Check, ArrowRight, RefreshCw, Clock, Users, Utensils } from 'lucide-react';

export default function RecipeGeneratorModal({
  isOpen,
  onClose,
  onSaveRecipe,
  onSelectForDay
}) {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!ingredientsInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSavedSuccess(false);

      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientsPrompt: ingredientsInput.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedRecipe(data.recipe);
      } else {
        setError(data.error || 'Kunne ikke generere oppskrift');
      }
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Nettverksfeil ved generering av oppskrift');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCatalog = async () => {
    if (!generatedRecipe) return;
    await onSaveRecipe(generatedRecipe);
    setSavedSuccess(true);
  };

  const QUICK_SUGGESTIONS = ['Kylling, paprika', 'Laks, rømme, agurk', 'Kjøttdeig, pasta', 'Søtpotet, linser'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-blue-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rema-blue via-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center text-gray-900 shadow-md">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Oppskrift-generator</h2>
              <p className="text-xs text-blue-200">Lag fantastiske retter av råvarene du har tilgjengelig</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          {/* Ingredient Input Form */}
          <form onSubmit={handleGenerate} className="space-y-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
            <label className="block text-sm font-bold text-rema-blue flex items-center gap-1.5">
              <Utensils size={16} /> Hvilke råvarer har du eller ønsker du å bruke?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="f.eks. Kylling, søtpotet, hvitløk..."
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rema-blue focus:outline-none text-sm bg-white shadow-sm"
              />
              <button
                type="submit"
                disabled={loading || !ingredientsInput.trim()}
                className="px-5 py-2.5 bg-rema-red hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 shrink-0"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
                <span>Generer</span>
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-gray-500 font-semibold">Prøv forslag:</span>
              {QUICK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setIngredientsInput(sug)}
                  className="text-xs bg-white text-rema-blue border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* Generated Result Display */}
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-rema-blue/20 border-t-rema-blue animate-spin" />
                <Sparkles className="text-amber-500 animate-bounce" size={24} />
              </div>
              <p className="font-extrabold text-rema-blue text-base">Genererer smakfull oppskrift...</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Kombinerer råvarene dine og tilpasser Rema 1000 ingrediensliste og fremgangsmåte.
              </p>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-5 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Recipe Image & Title */}
              <div className="relative h-52 bg-gray-100">
                <img
                  src={generatedRecipe.image}
                  alt={generatedRecipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" /> Generert oppskrift
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-rema-blue shadow">
                  {generatedRecipe.category}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">
                    {generatedRecipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {generatedRecipe.description}
                  </p>

                  <div className="flex gap-4 mt-3 text-xs font-bold text-gray-600">
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                      <Clock size={14} className="text-rema-blue" /> {generatedRecipe.prepTime}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                      <Users size={14} className="text-rema-blue" /> {generatedRecipe.servings} porsjoner
                    </span>
                  </div>
                </div>

                {/* Ingredients list */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Ingredienser (Beregnet for Rema 1000)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {generatedRecipe.ingredients?.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-medium">
                        <span>{ing.name}</span>
                        <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {ing.amount} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Fremgangsmåte
                  </h4>
                  <ol className="space-y-2 text-xs text-gray-700">
                    {generatedRecipe.instructions?.map((inst, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start bg-blue-50/30 p-2.5 rounded-xl border border-blue-50">
                        <span className="bg-rema-blue text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{inst}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 space-y-2">
              <Wand2 size={36} className="mx-auto text-gray-300" />
              <p className="text-sm font-semibold">Skriv inn råvarer over for å generere en ny oppskrift</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {generatedRecipe && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleSaveToCatalog}
              disabled={savedSuccess}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                savedSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {savedSuccess ? <Check size={16} /> : <PlusCircle size={16} />}
              <span>{savedSuccess ? 'Lagret i Oppskriftsboken!' : 'Lagre i Oppskriftsboka'}</span>
            </button>

            {onSelectForDay && (
              <button
                onClick={() => {
                  if (!savedSuccess) {
                    onSaveRecipe(generatedRecipe);
                  }
                  onSelectForDay(generatedRecipe);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-rema-blue hover:bg-blue-900 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Sett inn i Ukesmenyen</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

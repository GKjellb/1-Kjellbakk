import React, { useState } from 'react';
import { Search, Plus, Clock, Users, Edit, Trash2, BookOpen, ChevronRight, Check, X } from 'lucide-react';
import RecipeModal from './RecipeModal';

export default function RecipeCatalog({
  recipes,
  categories,
  onSaveRecipe,
  onDeleteRecipe,
  onSelectForPlanner
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipeView, setSelectedRecipeView] = useState(null);

  const availableCategories = ['Alle', ...new Set(recipes.map((r) => r.category))];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients?.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'Alle' || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenEdit = (recipe, e) => {
    if (e) e.stopPropagation();
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-rema-blue" /> Oppskriftsbok
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Utforsk familiens favoritter eller legg til egne oppskrifter.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto px-5 py-2.5 bg-rema-blue text-white rounded-xl font-semibold hover:bg-blue-900 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Ny oppskrift
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Søk i retter eller ingredienser..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rema-blue text-sm shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rema-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Ingen oppskrifter funnet.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 text-sm text-rema-blue font-semibold hover:underline"
          >
            + Opprett den første her
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipeView(recipe)}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                  src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {recipe.category}
                </span>

                <div className="absolute top-3 right-3 flex gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOpenEdit(recipe, e)}
                    className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:text-rema-blue hover:bg-white shadow"
                    title="Endre"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Vil du slette "${recipe.title}"?`)) {
                        onDeleteRecipe(recipe.id);
                      }
                    }}
                    className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:text-red-600 hover:bg-white shadow"
                    title="Slett"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-rema-blue transition-colors line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" /> {recipe.prepTime || '30 min'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-gray-400" /> {recipe.servings || 4} porsjoner
                  </span>
                  {onSelectForPlanner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectForPlanner(recipe);
                      }}
                      className="px-2 py-1 bg-rema-lightBlue text-rema-blue rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                    >
                      + Velg for dag
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Modal for Editing & Creating */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveRecipe}
        categories={categories}
        initialRecipe={editingRecipe}
      />

      {/* Detailed Recipe View Modal */}
      {selectedRecipeView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header image */}
            <div className="relative h-56 bg-gray-200">
              <img
                src={selectedRecipeView.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                alt={selectedRecipeView.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRecipeView(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rema-blue">
                {selectedRecipeView.category}
              </div>
            </div>

            {/* Recipe Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">{selectedRecipeView.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedRecipeView.description}</p>

                <div className="flex gap-4 mt-3 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                    <Clock size={14} /> {selectedRecipeView.prepTime}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                    <Users size={14} /> {selectedRecipeView.servings} porsjoner
                  </span>
                </div>
              </div>

              {/* Ingredients section */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-2 border-b pb-1">
                  Ingredienser
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  {selectedRecipeView.ingredients?.map((ing, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <span>{ing.name}</span>
                      <span className="font-semibold text-gray-900">{ing.amount} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions section */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-2 border-b pb-1">
                  Fremgangsmåte
                </h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  {selectedRecipeView.instructions?.map((inst, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <span className="bg-rema-blue text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => {
                  const r = selectedRecipeView;
                  setSelectedRecipeView(null);
                  handleOpenEdit(r);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Endre oppskrift
              </button>
              <button
                onClick={() => setSelectedRecipeView(null)}
                className="px-5 py-2 bg-rema-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

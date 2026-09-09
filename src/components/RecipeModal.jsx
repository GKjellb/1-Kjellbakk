import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Users } from 'lucide-react';

export default function RecipeModal({ isOpen, onClose, onSave, categories = [], initialRecipe = null }) {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [category, setCategory] = useState(initialRecipe?.category || 'Middag');
  const [prepTime, setPrepTime] = useState(initialRecipe?.prepTime || '30 min');
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [image, setImage] = useState(
    initialRecipe?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  );

  const [ingredients, setIngredients] = useState(
    initialRecipe?.ingredients || [
      { name: '', amount: 1, unit: 'stk', category: 'Frukt & grønt' }
    ]
  );

  const [instructions, setInstructions] = useState(
    initialRecipe?.instructions?.length ? initialRecipe.instructions : ['']
  );

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 1, unit: 'stk', category: 'Frukt & grønt' }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recipeData = {
      id: initialRecipe?.id,
      title: title.trim(),
      category,
      prepTime,
      servings: Number(servings),
      description,
      image,
      ingredients: ingredients.filter(i => i.name.trim() !== ''),
      instructions: instructions.filter(inst => inst.trim() !== '')
    };

    onSave(recipeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-rema-blue text-white flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialRecipe ? 'Endre oppskrift' : 'Opprett ny oppskrift'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          <div>
            <label className="block text-sm font-semibold mb-1">Tittel på retten *</label>
            <input
              type="text"
              required
              placeholder="f.eks. Bestemors Kjøttkaker"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none"
              >
                <option value="Middag">Middag</option>
                <option value="Fisk">Fisk</option>
                <option value="Kylling">Kylling</option>
                <option value="Pasta">Pasta</option>
                <option value="Fredagskos">Fredagskos</option>
                <option value="Vegetar">Vegetar</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
                <Clock size={16} /> Tidsbruk
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="f.eks. 25 min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
                <Users size={16} /> Porsjoner
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Kort beskrivelse</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv retten lite kort..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Bilde-URL (valgfritt)</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none text-sm"
            />
          </div>

          {/* Ingredienser */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-900 text-md">Ingredienser (for Rema 1000 Handleliste)</h3>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs font-semibold text-rema-blue bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
              >
                <Plus size={14} /> Legg til råvare
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    placeholder="Råvare (f.eks. Kjøttdeig)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    className="flex-1 min-w-[140px] px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Mengde"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Enhet (g, stk, dl)"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => handleIngredientChange(idx, 'category', e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instruksjoner */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-900 text-md">Fremgangsmåte</h3>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="text-xs font-semibold text-rema-blue bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
              >
                <Plus size={14} /> Legg til steg
              </button>
            </div>

            <div className="space-y-2">
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-gray-400 text-sm w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Steg ${idx + 1}...`}
                    value={inst}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rema-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rema-blue text-white rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-md"
            >
              Lagre oppskrift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

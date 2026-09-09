import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  Circle,
  Copy,
  Trash2,
  Check,
  Store,
  Share2
} from 'lucide-react';
import { generateShoppingList, formatShoppingListForCopy, REMA_CATEGORIES } from '../utils/shoppingList';

export default function ShoppingList({
  weeklyPlan,
  recipes,
  extraItems,
  onAddExtraItem,
  onToggleExtraItem,
  onDeleteExtraItem
}) {
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(REMA_CATEGORIES[0]);
  const [checkedRecipeItems, setCheckedRecipeItems] = useState({});
  const [copied, setCopied] = useState(false);

  // Generate organized shopping list
  const categorizedList = generateShoppingList(weeklyPlan, recipes, extraItems);

  // Apply checked state to recipe items (stored in local state for session)
  const listWithCheckedState = categorizedList.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.isExtra) {
        return item; // inherits checked from backend DB state
      }
      return {
        ...item,
        checked: Boolean(checkedRecipeItems[item.id])
      };
    })
  }));

  // Calculate statistics
  let totalItemsCount = 0;
  let checkedItemsCount = 0;

  listWithCheckedState.forEach((group) => {
    group.items.forEach((item) => {
      totalItemsCount++;
      if (item.checked) checkedItemsCount++;
    });
  });

  const progressPercentage =
    totalItemsCount > 0 ? Math.round((checkedItemsCount / totalItemsCount) * 100) : 0;

  const handleToggleItem = (item) => {
    if (item.isExtra) {
      onToggleExtraItem(item.id, !item.checked);
    } else {
      setCheckedRecipeItems((prev) => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    }
  };

  const handleAddManualItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddExtraItem({
      name: newItemName.trim(),
      category: selectedCategory
    });

    setNewItemName('');
  };

  const handleCopyList = () => {
    const formattedText = formatShoppingListForCopy(listWithCheckedState);
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Rema 1000 Header Banner */}
      <div className="bg-rema-blue text-white p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rema-red rounded-xl flex items-center justify-center font-black text-xl shadow text-white tracking-tighter">
              R1000
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Rema 1000 Handleliste
              </h2>
              <p className="text-xs text-blue-200">
                Sortert etter avdeling i butikken for en effektiv handletur!
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyList}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-white/20"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-400" /> Kopiert til utklippstavle!
              </>
            ) : (
              <>
                <Share2 size={16} /> Kopier / Del Liste
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span>Handletur status</span>
            <span>
              {checkedItemsCount} av {totalItemsCount} varer handlet ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-blue-950/60 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-green-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add extra custom item form */}
      <form
        onSubmit={handleAddManualItem}
        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          placeholder="Legg til ekstra vare (f.eks. Melk, Tannkrem)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rema-blue"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-700"
        >
          {REMA_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2 bg-rema-blue hover:bg-blue-900 text-white font-bold text-sm rounded-xl transition-colors shadow flex items-center justify-center gap-1 shrink-0"
        >
          <Plus size={18} /> Legg til
        </button>
      </form>

      {/* Categorized Aisle List */}
      {listWithCheckedState.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 font-bold">Ingen varer i handlelisten ennå.</p>
          <p className="text-xs text-gray-400 mt-1">
            Legg til middager i ukesmenyen eller skriv inn ekstra varer ovenfor!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listWithCheckedState.map((group) => (
            <div
              key={group.categoryName}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rema-blue inline-block"></span>
                  {group.categoryName}
                </h3>
                <span className="text-xs text-gray-400 font-semibold">
                  {group.items.filter((i) => i.checked).length}/{group.items.length} varer
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-50">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item)}
                    className={`px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      item.checked ? 'bg-gray-50/70' : 'hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 pr-2">
                      <button className="shrink-0 transition-transform active:scale-95">
                        {item.checked ? (
                          <CheckCircle2 className="text-green-600 fill-green-100" size={22} />
                        ) : (
                          <Circle className="text-gray-300" size={22} />
                        )}
                      </button>

                      <div className={item.checked ? 'line-through text-gray-400' : 'text-gray-800'}>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.amount && (
                            <span className="text-xs font-bold text-rema-blue bg-blue-50 px-2 py-0.5 rounded">
                              {item.amount} {item.unit}
                            </span>
                          )}
                        </div>

                        {item.sources && item.sources.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Til: {item.sources.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.isExtra && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteExtraItem(item.id);
                        }}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors shrink-0"
                        title="Fjern ekstra vare"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

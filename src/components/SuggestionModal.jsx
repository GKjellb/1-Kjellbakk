import React, { useState } from 'react';
import { X, Lightbulb, MessageSquare } from 'lucide-react';

export default function SuggestionModal({ isOpen, onClose, onSave, activeProfile }) {
  const [dishTitle, setDishTitle] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dishTitle.trim()) return;

    onSave({
      authorId: activeProfile.id,
      authorName: activeProfile.name,
      dishTitle: dishTitle.trim(),
      comment: comment.trim()
    });

    setDishTitle('');
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 bg-rema-blue text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={22} className="text-yellow-300" />
            <h2 className="text-lg font-bold">Foreslå rett til ukesmenyen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-2xl">{activeProfile.avatar}</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Sender forslag som</p>
              <p className="text-sm font-bold text-gray-900">{activeProfile.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Hva har du lyst på? *
            </label>
            <input
              type="text"
              required
              placeholder="f.eks. Hjemmelaget Pizza, Lasagne, Pannekaker..."
              value={dishTitle}
              onChange={(e) => setDishTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rema-blue focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
              <MessageSquare size={15} /> Kommentar eller ønske for dag
            </label>
            <textarea
              rows="3"
              placeholder="f.eks. Kan vi ha dette på fredag eller i helgen?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rema-blue focus:outline-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rema-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow"
            >
              Send inn forslag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

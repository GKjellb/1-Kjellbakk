import React, { useState } from 'react';
import { Heart, Plus, Trash2, CalendarPlus, UserCheck, MessageCircle } from 'lucide-react';
import SuggestionModal from './SuggestionModal';

export default function FamilySection({
  familyMembers,
  activeProfile,
  onSelectProfile,
  suggestions,
  onAddSuggestion,
  onLikeSuggestion,
  onDeleteSuggestion,
  onAddToPlanner
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      {/* Header with profile selector */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="text-rema-blue" /> Familiens Rettforslag
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Alle i familien kan skrive forslag til retter og stemme frem sine favoritter.
          </p>
        </div>

        {/* Profile Switcher Tabs */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Hvem er du nå?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {familyMembers.map((member) => {
              const isActive = activeProfile.id === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectProfile(member)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    isActive
                      ? 'border-rema-blue bg-blue-50 ring-2 ring-rema-blue/20 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{member.avatar}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Profil</p>
                    <p className={`text-sm font-bold ${isActive ? 'text-rema-blue' : 'text-gray-900'}`}>
                      {member.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-900 to-rema-blue p-5 rounded-2xl text-white shadow-md">
        <div>
          <h3 className="text-lg font-bold">Har du lyst på noe spesiell middag?</h3>
          <p className="text-xs text-blue-100 mt-1">
            Logget inn som <span className="font-semibold underline">{activeProfile.name}</span>. Send inn dine ønskermiddager.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
        >
          <Plus size={18} /> Nytt forslag
        </button>
      </div>

      {/* List of Suggestions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          Innsendte forslag ({suggestions.length})
        </h3>

        {suggestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Ingen forslag har blitt lagt til ennå.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-sm font-bold text-rema-blue hover:underline"
            >
              + Vær den første til å foreslå en rett!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => {
              const likesCount = sug.likes ? sug.likes.length : 0;
              const hasLiked = sug.likes && sug.likes.includes(activeProfile.id);

              return (
                <div
                  key={sug.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {familyMembers.find((m) => m.id === sug.authorId)?.avatar || '👤'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">
                            Foreslått av {sug.authorName}
                          </p>
                          <h4 className="text-lg font-bold text-gray-900">{sug.dishTitle}</h4>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSuggestion(sug.id)}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                        title="Slett forslag"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {sug.comment && (
                      <p className="text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-600 flex items-start gap-1.5">
                        <MessageCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        "{sug.comment}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => onLikeSuggestion(sug.id, activeProfile.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        hasLiked
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Heart size={16} className={hasLiked ? 'fill-red-600 text-red-600' : ''} />
                      <span>{likesCount} Liker</span>
                    </button>

                    {onAddToPlanner && (
                      <button
                        onClick={() => onAddToPlanner(sug.dishTitle)}
                        className="flex items-center gap-1 text-xs font-bold text-rema-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <CalendarPlus size={15} /> Sett på meny
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddSuggestion}
        activeProfile={activeProfile}
      />
    </div>
  );
}

import { X, Plus, Trash2 } from 'lucide-react';
import { useHousehold } from '../hooks/useHousehold';
import { ALLERGENS } from '../lib/allergenUtils';
import { PROTEIN_LABELS } from '../data/recipes';

const EMOJI_CHOICES = ['🙂', '👩', '👨', '👧', '👦', '👵', '👴', '🐣'];
const PREF_OPTIONS = [
  { val: 'dislike', label: 'Dislike' },
  { val: 'neutral', label: 'Neutral' },
  { val: 'like',    label: 'Like' },
];

export default function HouseholdSettings({ onClose }) {
  const { members, addMember, updateMember, removeMember } = useHousehold();

  const toggleAllergy = (member, key) => {
    const has = member.allergies?.includes(key);
    const allergies = has
      ? member.allergies.filter(a => a !== key)
      : [...(member.allergies || []), key];
    updateMember(member.id, { allergies });
  };

  const setProteinPref = (member, protein, val) => {
    updateMember(member.id, { proteinPrefs: { ...member.proteinPrefs, [protein]: val } });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker-sheet household-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div>
            <h2 className="picker-title">Household</h2>
            <p className="picker-subtitle">Preferences and allergies used when planning meals</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="household-list">
          {members.length === 0 && (
            <p className="household-empty">No one added yet — add the people you're planning meals for.</p>
          )}

          {members.map(member => (
            <div key={member.id} className="household-member-card">
              <div className="household-member-top">
                <div className="household-emoji-row">
                  {EMOJI_CHOICES.map(e => (
                    <button
                      key={e}
                      className={`household-emoji-btn ${member.emoji === e ? 'active' : ''}`}
                      onClick={() => updateMember(member.id, { emoji: e })}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <button className="household-remove-btn" onClick={() => removeMember(member.id)} title="Remove">
                  <Trash2 size={15} />
                </button>
              </div>

              <input
                className="household-name-input"
                value={member.name}
                placeholder="Name"
                onChange={e => updateMember(member.id, { name: e.target.value })}
              />

              <div className="household-section-label">Protein preferences</div>
              <div className="household-protein-rows">
                {Object.entries(PROTEIN_LABELS).map(([protein, label]) => (
                  <div key={protein} className="household-protein-row">
                    <span className="household-protein-label">{label}</span>
                    <div className="household-pref-group">
                      {PREF_OPTIONS.map(o => (
                        <button
                          key={o.val}
                          className={`household-pref-btn ${o.val} ${member.proteinPrefs?.[protein] === o.val ? 'active' : ''}`}
                          onClick={() => setProteinPref(member, protein, o.val)}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="household-section-label">Allergies</div>
              <div className="household-allergy-grid">
                {Object.entries(ALLERGENS).map(([key, allergen]) => (
                  <button
                    key={key}
                    className={`filter-btn filter-btn-sm ${member.allergies?.includes(key) ? 'active' : ''}`}
                    onClick={() => toggleAllergy(member, key)}
                  >
                    {allergen.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className="household-add-btn" onClick={() => addMember('New person')}>
            <Plus size={16} /> Add person
          </button>
        </div>
      </div>
    </div>
  );
}

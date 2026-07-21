import { TriangleAlert } from 'lucide-react';

// Soft warning only — never hides or blocks a recipe, just flags it.
export default function AllergyBadge({ warnings, size = 13 }) {
  if (!warnings || warnings.length === 0) return null;

  const title = warnings
    .map(w => `${w.allergenLabel} (${w.memberName})`)
    .join(', ');

  return (
    <span className="allergy-badge" title={`May contain: ${title}`}>
      <TriangleAlert size={size} />
    </span>
  );
}

import { useState } from 'react';
import { X, Link, AlertCircle } from 'lucide-react';
import { importRecipeFromUrl } from '../lib/recipeParser';

const COMING_SOON = true; // flip to false when Cloud Function is deployed

export default function RecipeImport({ onImported, onClose }) {
  const [url, setUrl]       = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError]   = useState('');

  if (COMING_SOON) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="picker-sheet import-sheet" onClick={e => e.stopPropagation()}>
          <div className="picker-header">
            <div>
              <h2 className="picker-title">Import from URL</h2>
              <p className="picker-subtitle">Coming soon</p>
            </div>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>
          <div className="import-body">
            <div className="import-coming-soon">
              <div className="import-coming-icon">🔗</div>
              <h3 className="import-coming-title">URL import coming soon</h3>
              <p className="import-coming-desc">
                This feature needs a small backend update to work around browser
                security restrictions. It's built and ready — just needs to be switched on.
              </p>
              <div className="import-coming-tip">
                <strong>In the meantime:</strong> open the recipe site, copy the
                ingredients and steps, then use <strong>Add Recipe</strong> to paste
                them in. The form parses plain text automatically.
              </div>
              <button className="save-recipe-btn" style={{marginTop: 16}} onClick={onClose}>
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full import UI (active when COMING_SOON = false)
  const handleImport = async () => {
    if (!url.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const result = await importRecipeFromUrl(url.trim());
      onImported(result);
      onClose();
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker-sheet import-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div>
            <h2 className="picker-title">Import from URL</h2>
            <p className="picker-subtitle">Paste a link from any recipe site</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="import-body">
          <div className="import-url-row">
            <div className="import-url-input-wrap">
              <Link size={15} className="import-url-icon" />
              <input
                className="import-url-input"
                placeholder="https://www.allrecipes.com/recipe/…"
                value={url}
                onChange={e => { setUrl(e.target.value); setStatus('idle'); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleImport()}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              {url && (
                <button className="import-url-clear" onClick={() => { setUrl(''); setStatus('idle'); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button className="import-go-btn" onClick={handleImport} disabled={!url.trim() || status === 'loading'}>
              Import
            </button>
          </div>
          {status === 'error' && (
            <div className="import-error">
              <AlertCircle size={20} />
              <div>
                <div className="import-error-title">Couldn't import this recipe</div>
                <div className="import-error-msg">{error}</div>
                <div className="import-error-tip">Try a different site, or use Add Recipe to paste it in manually.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

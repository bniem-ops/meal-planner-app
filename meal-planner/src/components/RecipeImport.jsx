import { useState } from 'react';
import { X, Link, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { importRecipeFromUrl } from '../lib/recipeParser';

const SUGGESTED_SITES = [
  'allrecipes.com', 'budgetbytes.com', 'seriouseats.com',
  'foodnetwork.com', 'bonappetit.com', 'sallysbakingaddiction.com',
];

export default function RecipeImport({ onImported, onClose }) {
  const [url, setUrl]       = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError]   = useState('');
  const [result, setResult] = useState(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const recipe = await importRecipeFromUrl(url.trim());
      setResult(recipe);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleUse = () => {
    onImported(result);
    onClose();
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

          {/* URL input */}
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
            <button
              className="import-go-btn"
              onClick={handleImport}
              disabled={!url.trim() || status === 'loading'}
            >
              {status === 'loading' ? <Loader size={16} className="spin" /> : 'Import'}
            </button>
          </div>

          {/* Suggested sites */}
          {status === 'idle' && (
            <div className="import-suggestions">
              <div className="import-suggestions-label">Works well with</div>
              <div className="import-chips">
                {SUGGESTED_SITES.map(site => (
                  <span key={site} className="import-chip">{site}</span>
                ))}
              </div>
              <p className="import-note">
                Most recipe blogs and food sites work. Sites that require a subscription
                or load content via JavaScript may not parse correctly.
              </p>
            </div>
          )}

          {/* Loading state */}
          {status === 'loading' && (
            <div className="import-loading">
              <Loader size={28} className="spin import-loading-icon" />
              <p>Fetching recipe…</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="import-error">
              <AlertCircle size={20} />
              <div>
                <div className="import-error-title">Couldn't import this recipe</div>
                <div className="import-error-msg">{error}</div>
                <div className="import-error-tip">
                  Try a different site, or use the manual Add Recipe form instead.
                </div>
              </div>
            </div>
          )}

          {/* Success preview */}
          {status === 'success' && result && (
            <div className="import-result">
              <div className="import-success-badge">
                <CheckCircle size={15} />
                Imported via {result.method}
              </div>

              <div className="import-preview-card">
                <div className="import-preview-header" data-protein={result.protein}>
                  <span className="import-preview-emoji">
                    {result.protein === 'chicken' ? '🐔' : result.protein === 'beef' ? '🥩' : '🍽️'}
                  </span>
                  <div>
                    <div className="import-preview-name">{result.name}</div>
                    {result.description && (
                      <div className="import-preview-desc">{result.description.slice(0, 120)}{result.description.length > 120 ? '…' : ''}</div>
                    )}
                    <div className="import-preview-meta">
                      <span>⏱ {result.time} min</span>
                      <span>👤 {result.servings} servings</span>
                    </div>
                  </div>
                </div>

                <div className="import-preview-section">
                  <div className="import-preview-section-label">
                    Ingredients ({result.ingredientText.split('\n').filter(Boolean).length})
                  </div>
                  <div className="import-preview-list">
                    {result.ingredientText.split('\n').filter(Boolean).slice(0, 5).map((ing, i) => (
                      <div key={i} className="import-preview-item">• {ing}</div>
                    ))}
                    {result.ingredientText.split('\n').filter(Boolean).length > 5 && (
                      <div className="import-preview-more">
                        +{result.ingredientText.split('\n').filter(Boolean).length - 5} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="import-preview-section">
                  <div className="import-preview-section-label">
                    Steps ({result.stepText.split('\n').filter(Boolean).length})
                  </div>
                  <div className="import-preview-list">
                    {result.stepText.split('\n').filter(Boolean).slice(0, 2).map((step, i) => (
                      <div key={i} className="import-preview-item">
                        <span className="import-step-num">{i + 1}</span> {step.slice(0, 80)}{step.length > 80 ? '…' : ''}
                      </div>
                    ))}
                    {result.stepText.split('\n').filter(Boolean).length > 2 && (
                      <div className="import-preview-more">
                        +{result.stepText.split('\n').filter(Boolean).length - 2} more steps
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="import-result-actions">
                <button className="import-edit-btn" onClick={handleUse}>
                  Review & save →
                </button>
                <button className="import-retry-btn" onClick={() => { setStatus('idle'); setResult(null); }}>
                  Try another URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

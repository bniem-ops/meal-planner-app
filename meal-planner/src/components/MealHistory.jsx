import { BarChart2, Clock, Users, TrendingUp, RotateCcw, Activity } from 'lucide-react';
import { useMealHistory } from '../hooks/useMealHistory';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useRatings } from '../hooks/useRatings';
import { useWeeklyReviewHistory } from '../hooks/useWeeklyReviewHistory';
import { getDueForRerun } from '../lib/ingredientUtils';

function formatLastCooked(weekId) {
  if (!weekId) return '';
  const date = new Date(weekId);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 8)  return 'This week';
  if (diffDays < 15) return 'Last week';
  if (diffDays < 32) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function MealHistory() {
  const { customRecipes } = useCustomRecipes();
  const { history, weeklyBreakdown, loading } = useMealHistory(customRecipes);
  const { ratings } = useRatings();
  const { history: reviewHistory } = useWeeklyReviewHistory(8);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-pot">🍲</div>
      <p>Crunching your history…</p>
    </div>
  );

  if (history.length === 0) return (
    <div className="history-empty">
      <BarChart2 size={44} className="history-empty-icon" />
      <h3 className="history-empty-title">No history yet</h3>
      <p className="history-empty-desc">
        Plan a few weeks of meals and your most cooked recipes will show up here.
      </p>
    </div>
  );

  const maxCount = history[0]?.count || 1;

  // Stats summary
  const totalMeals = history.reduce((sum, h) => sum + h.count, 0);
  const uniqueRecipes = history.length;
  const topProtein = (() => {
    const counts = { chicken: 0, beef: 0, other: 0 };
    history.forEach(h => {
      const p = h.recipe.protein || 'other';
      counts[p] = (counts[p] || 0) + h.count;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const maxWeekTotal = Math.max(1, ...weeklyBreakdown.map(w => w.chicken + w.beef + w.other));

  const dueForRerun = getDueForRerun(history);

  return (
    <div className="history-wrap">

      {/* Summary cards */}
      <div className="history-stats">
        <div className="history-stat">
          <div className="history-stat-num">{totalMeals}</div>
          <div className="history-stat-label">Meals planned</div>
        </div>
        <div className="history-stat">
          <div className="history-stat-num">{uniqueRecipes}</div>
          <div className="history-stat-label">Unique recipes</div>
        </div>
        <div className="history-stat">
          <div className="history-stat-num">
            {topProtein === 'chicken' ? '🐔' : topProtein === 'beef' ? '🥩' : '🍽️'}
          </div>
          <div className="history-stat-label">Top protein</div>
        </div>
      </div>

      {/* Protein variety over time */}
      {weeklyBreakdown.length >= 2 && (
        <div className="insight-card">
          <div className="insight-label"><Activity size={13} /> Protein variety, last {weeklyBreakdown.length} weeks</div>
          <div className="protein-trend-row">
            {weeklyBreakdown.map(w => {
              const total = w.chicken + w.beef + w.other;
              return (
                <div key={w.weekId} className="protein-trend-col" title={`${w.weekId}: ${w.chicken} chicken, ${w.beef} beef, ${w.other} other`}>
                  <div className="protein-trend-bar" style={{ height: `${Math.max(6, (total / maxWeekTotal) * 80)}px` }}>
                    {w.chicken > 0 && <div className="protein-trend-seg" data-protein="chicken" style={{ flex: w.chicken }} />}
                    {w.beef > 0 && <div className="protein-trend-seg" data-protein="beef" style={{ flex: w.beef }} />}
                    {w.other > 0 && <div className="protein-trend-seg" data-protein="other" style={{ flex: w.other }} />}
                  </div>
                  <div className="protein-trend-count">{total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Due for a rerun */}
      {dueForRerun.length > 0 && (
        <div className="insight-card">
          <div className="insight-label"><RotateCcw size={13} /> Due for a rerun</div>
          <div className="rerun-list">
            {dueForRerun.map(({ recipe, lastWeek }) => (
              <div key={recipe.id} className="rerun-row">
                <span className="rerun-emoji">
                  {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
                </span>
                <span className="rerun-name">{recipe.name}</span>
                <span className="rerun-last">{formatLastCooked(lastWeek)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly ratings trend */}
      {reviewHistory.length > 0 && (
        <div className="insight-card">
          <div className="insight-label"><TrendingUp size={13} /> Weekly ratings trend</div>
          <div className="rating-trend-row">
            {reviewHistory.map(w => (
              <div key={w.weekId} className="rating-trend-col" title={`${w.weekId}: ${w.upPct ?? '—'}% liked`}>
                <div
                  className="rating-trend-bar"
                  style={{
                    height: w.upPct != null ? `${Math.max(6, w.upPct)}px` : '4px',
                    opacity: w.upPct != null ? 1 : 0.3,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {history.length >= 3 && (
        <div className="history-podium">
          <div className="history-podium-label">
            <TrendingUp size={13} /> Your top meals
          </div>
          <div className="history-podium-cards">
            {history.slice(0, 3).map((entry, i) => {
              const rating = ratings[entry.recipe.id] || {};
              return (
                <div key={entry.recipe.id} className={`podium-card podium-${i + 1}`}>
                  <div className="podium-rank">#{i + 1}</div>
                  <div className="podium-emoji">
                    {entry.recipe.protein === 'chicken' ? '🐔' :
                     entry.recipe.protein === 'beef' ? '🥩' : '🍽️'}
                  </div>
                  <div className="podium-name">{entry.recipe.name}</div>
                  <div className="podium-count">{entry.count}×</div>
                  {(rating.thumbs || rating.kidAte) && (
                    <div className="podium-badges">
                      {rating.thumbs === 'up' && <span>👍</span>}
                      {rating.kidAte && <span>👶</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full frequency list */}
      <div className="history-section-label">All recipes</div>
      <div className="history-list">
        {history.map((entry, i) => {
          const { recipe, count, lastWeek } = entry;
          const rating = ratings[recipe.id] || {};
          const barWidth = Math.max(8, Math.round((count / maxCount) * 100));

          return (
            <div key={recipe.id} className="history-row">
              <div className="history-row-rank">{i + 1}</div>
              <div className="history-row-body">
                <div className="history-row-top">
                  <span className="history-row-emoji">
                    {recipe.protein === 'chicken' ? '🐔' :
                     recipe.protein === 'beef' ? '🥩' : '🍽️'}
                  </span>
                  <span className="history-row-name">{recipe.name}</span>
                  <div className="history-row-badges">
                    {rating.thumbs === 'up' && <span className="hist-badge">👍</span>}
                    {rating.thumbs === 'down' && <span className="hist-badge">👎</span>}
                    {rating.kidAte && <span className="hist-badge">👶</span>}
                  </div>
                </div>
                <div className="history-bar-row">
                  <div className="history-bar-track">
                    <div
                      className="history-bar-fill"
                      data-protein={recipe.protein}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="history-count">{count}×</span>
                </div>
                <div className="history-row-meta">
                  <span><Clock size={11} /> {recipe.time} min</span>
                  <span><Users size={11} /> {recipe.servings}</span>
                  {lastWeek && <span>Last: {formatLastCooked(lastWeek)}</span>}
                  {recipe.custom && <span className="tag custom-tag" style={{fontSize:10}}>custom</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

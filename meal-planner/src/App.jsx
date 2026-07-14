import { useState } from 'react';
import { CalendarDays, BookOpen, ShoppingCart, BarChart2, LogOut } from 'lucide-react';
import WeeklyCalendar from './components/WeeklyCalendar';
import WeeklyDashboard from './components/WeeklyDashboard';
import RecipeLibrary from './components/RecipeLibrary';
import GroceryList from './components/GroceryList';
import MealHistory from './components/MealHistory';
import LoginScreen from './components/LoginScreen';
import { useAuth } from './hooks/useAuth';
import { useMediaQuery } from './hooks/useMediaQuery';
import './App.css';

const tabs = [
  { id: 'planner', label: 'This Week', icon: CalendarDays },
  { id: 'recipes', label: 'Recipes',   icon: BookOpen },
  { id: 'grocery', label: 'Grocery',   icon: ShoppingCart },
  { id: 'history', label: 'Favorites', icon: BarChart2 },
];

export default function App() {
  const [tab, setTab] = useState('planner');
  const { user, loading, error, signIn, logOut } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-pot">🍲</div>
      <p>Setting the table…</p>
    </div>
  );

  if (!user) return <LoginScreen onSignIn={signIn} error={error} />;

  return (
    <div className={`app ${isDesktop ? 'app-desktop' : ''}`}>
      {isDesktop ? (
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="app-logo">🍽️</div>
            <div className="app-title-block">
              <h1 className="app-title">Home Table</h1>
              <p className="app-subtitle">Family meal planner</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className={`sidebar-nav-btn ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <Icon size={18} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
          <button className="sidebar-signout-btn" onClick={logOut}>
            <LogOut size={16} /> Sign out
          </button>
        </aside>
      ) : (
        <header className="app-header">
          <div className="header-inner">
            <div className="app-logo">🍽️</div>
            <h1 className="app-title">Home Table</h1>
            <button className="signout-btn" onClick={logOut} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>
      )}

      <main className="app-main">
        {tab === 'planner' && (isDesktop ? <WeeklyDashboard /> : <WeeklyCalendar />)}
        {tab === 'recipes' && <RecipeLibrary />}
        {tab === 'grocery' && <GroceryList />}
        {tab === 'history' && <MealHistory />}
      </main>

      {!isDesktop && (
        <nav className="bottom-nav">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={`bottom-nav-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <Icon size={18} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

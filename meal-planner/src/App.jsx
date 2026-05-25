import { useState } from 'react';
import { CalendarDays, BookOpen, ShoppingCart } from 'lucide-react';
import WeeklyCalendar from './components/WeeklyCalendar';
import RecipeLibrary from './components/RecipeLibrary';
import GroceryList from './components/GroceryList';
import './App.css';

const tabs = [
  { id: 'planner', label: 'This Week', icon: CalendarDays },
  { id: 'recipes', label: 'Recipes', icon: BookOpen },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
];

export default function App() {
  const [tab, setTab] = useState('planner');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="app-logo">🍽️</div>
          <div className="app-title-block">
            <h1 className="app-title">Home Table</h1>
            <p className="app-subtitle">Family meal planner</p>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={18} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="app-main">
        {tab === 'planner' && <WeeklyCalendar />}
        {tab === 'recipes' && <RecipeLibrary />}
        {tab === 'grocery' && <GroceryList />}
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import DirectSearchRecipes from './components/DirectSearchRecipes';
import IngredientSearchRecipes from './components/IngredientSearchRecipes';
import './App.css'; // Import the CSS file

function App() {
  const [page, setPage] = useState('home'); // 'home' (DirectSearchRecipes) or 'ingredients' (IngredientSearchRecipes)

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <DirectSearchRecipes />;
      case 'ingredients':
        return <IngredientSearchRecipes />;
      default:
        return <DirectSearchRecipes />;
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => setPage('home')}>
          My Recipes
        </div>
        <div className="navbar-buttons">
          <button className="navbar-button" onClick={() => setPage('home')}>
            Recipe Search
          </button>
          <button className="navbar-button" onClick={() => setPage('ingredients')}>
            Search by Ingredients
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;

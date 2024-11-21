import React, { useState } from 'react';
import DirectSearchRecipes from './components/DirectSearchRecipes';
import IngredientSearchRecipes from './components/IngredientSearchRecipes';

function App() {
  const [page, setPage] = useState('direct'); // 'direct' or 'ingredient'

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setPage('direct')} style={{ marginRight: '10px' }}>
          Direct Search
        </button>
        <button onClick={() => setPage('ingredient')}>Ingredient Search</button>
      </header>

      <main style={{ padding: '20px' }}>
        {page === 'direct' ? <DirectSearchRecipes /> : <IngredientSearchRecipes />}
      </main>
    </div>
  );
}

export default App;

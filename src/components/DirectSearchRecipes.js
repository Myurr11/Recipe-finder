import React, { useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';

const DirectSearchRecipes = () => {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRecipes = async () => {
    if (!query) return; // Prevent empty search
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/complexSearch`, {
        params: {
          apiKey: API_KEY,
          query,
          number: 10, // Limit results to 10
        },
      });
      setRecipes(response.data.results);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Search Recipes</h1>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter a keyword (e.g., chicken)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '10px', width: '300px' }}
        />
        <button onClick={searchRecipes} style={{ padding: '10px', marginLeft: '10px' }}>
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {recipes.map((recipe, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '5px',
                maxWidth: '300px',
              }}
            >
              <h3>{recipe.title}</h3>
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{ width: '100%' }}
                />
              )}
              <a
                href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Recipe
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectSearchRecipes;

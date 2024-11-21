import React, { useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';

const IngredientSearchRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchByIngredients = async () => {
    if (!ingredients) return; // Prevent empty input
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/findByIngredients`, {
        params: {
          apiKey: API_KEY,
          ingredients, // Comma-separated list of ingredients
          number: 10,  // Limit results to 10
        },
      });
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Search Recipes by Ingredients</h1>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter ingredients (e.g., tomato, cheese, chicken)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{ padding: '10px', width: '300px' }}
        />
        <button onClick={searchByIngredients} style={{ padding: '10px', marginLeft: '10px' }}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientSearchRecipes;

import React, { useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';
import './IngredientSearchRecipes.css'; // Import the CSS file
import FoodImage from './Food-image_1.jpg';

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
          number: 10, // Limit results to 10
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
    <div>
      {/* Main Content */}
      <div className="ingredient-search-container">
        <img
          src={FoodImage}
          alt="Food background"
          className="ingredient-search-image"
        />
        <div className="ingredient-search-overlay">
          <input
            type="text"
            placeholder="Enter ingredients (e.g., tomato, cheese, chicken)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="ingredient-search-input"
          />
          <button onClick={searchByIngredients} className="ingredient-search-button">
            Search
          </button>
        </div>
      </div>

      {/* Recipes Section */}
      <div className="ingredient-recipe-list">
        {loading ? (
          <p>Loading recipes...</p>
        ) : (
          <div className="ingredient-recipe-cards">
            {recipes.map((recipe, index) => (
              <div key={index} className="ingredient-recipe-card">
                <h3>{recipe.title}</h3>
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="ingredient-recipe-image"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientSearchRecipes;

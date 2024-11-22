import React, { useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';
import './DirectSearchRecipes.css'; // Import the CSS file
import FoodImage from './Food-image_1.jpg';


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
    <div>
      {/* Main Content */}
      <div className="recipe-search-container">
        <img
          src={FoodImage}
          alt="Food background"
          className="recipe-search-image"
        />
        <div className="recipe-search-overlay">
          <input
            type="text"
            placeholder="Search recipes (e.g., chicken)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="recipe-search-input"
          />
          <button onClick={searchRecipes} className="recipe-search-button">
            Search
          </button>
        </div>
      </div>

      {/* Recipes Section */}
      <div className="recipe-list">
        {loading ? (
          <p>Loading recipes...</p>
        ) : (
          <div className="recipe-cards">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <h3>{recipe.title}</h3>
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="recipe-image"
                  />
                )}
                <a
                  href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recipe-link"
                >
                  View Recipe
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectSearchRecipes;

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

      const recipesWithDetails = await Promise.all(
        response.data.map(async (recipe) => {
          try {
            const detailsResponse = await axios.get(`${BASE_URL}/${recipe.id}/information`, {
              params: { apiKey: API_KEY },
            });
            return { ...recipe, ...detailsResponse.data }; // Merge details with recipe
          } catch (detailsError) {
            console.error(`Error fetching details for recipe ${recipe.id}:`, detailsError);
            return recipe; // Return original recipe if details fetch fails
          }
        })
      );

      setRecipes(recipesWithDetails);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to clean HTML tags from the description
  const cleanHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // Basic Summarization Method - Picks key sentences
  const summarizeDescription = (description, length = 150) => {
    // Clean the description first
    const cleanedDescription = cleanHTML(description);

    // If the description is shorter than the required length, return as is
    if (cleanedDescription.length <= length) {
      return cleanedDescription;
    }

    // Otherwise, split the description into sentences and pick a few key ones
    const sentences = cleanedDescription.split('. ');
    let summary = '';

    // Keep adding sentences until we reach the desired length
    for (let i = 0; i < sentences.length; i++) {
      summary += sentences[i] + '. ';
      if (summary.length > length) {
        break;
      }
    }

    return summary.trim() + '...'; // Add ellipsis if it was truncated
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
                <div className="recipe-card-header">
                  <h3 className="recipe-title">{recipe.title}</h3>
                </div>

                <div className="recipe-card-body">
                  <div className="recipe-image-container">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="recipe-thumbnail"
                      />
                    )}
                  </div>
                  <p className="recipe-prep-time">
                    <strong>Prep Time:</strong> {recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'Not available'}
                  </p>
                  <p className="recipe-servings">
                    <strong>Serves:</strong> {recipe.servings ? recipe.servings : 'N/A'}
                  </p>
                  <p className="recipe-description">
                    {/* Use the summarized description */}
                    {recipe.summary ? summarizeDescription(recipe.summary) : 'No description available.'}
                  </p>
                </div>

                <button
                  onClick={() => window.open(`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`, '_blank')}
                  className="view-recipe-button"
                >
                  View Recipe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientSearchRecipes;

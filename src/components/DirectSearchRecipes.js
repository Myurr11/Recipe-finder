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
          number: 10,
          addRecipeInformation: true, // Ensure detailed information is included
        },
      });

      console.log(response.data); // Log the full response for inspection
      setRecipes(response.data.results);
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
        
                <div className="recipe-tags">
                  {recipe.dietLabels && recipe.dietLabels.map((label, index) => (
                    <span key={index} className="diet-tag">{label}</span>
                  ))}
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

export default DirectSearchRecipes;

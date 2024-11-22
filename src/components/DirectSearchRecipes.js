import React, { useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';
import './DirectSearchRecipes.css'; // Import the CSS file
import FoodImage from './Food_3.jpg';

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

  const cleanHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const summarizeDescription = (description, length = 150) => {
    const cleanedDescription = cleanHTML(description);

    if (cleanedDescription.length <= length) {
      return cleanedDescription;
    }

    const sentences = cleanedDescription.split('. ');
    let summary = '';
    for (let i = 0; i < sentences.length; i++) {
      summary += sentences[i] + '. ';
      if (summary.length > length) {
        break;
      }
    }

    return summary.trim() + '...';
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
          {/* Title and Subtitle */}
          <div className="recipe-title-container">
            <h1 className="recipe-title">Discover Delicious Recipes</h1>
            <p className="recipe-subtitle">
              Explore a variety of recipes tailored to your taste. Start by searching for an ingredient or a dish!
            </p>
          </div>

          {/* Search Bar */}
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
                    <strong>Prep Time:</strong>{' '}
                    {recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'Not available'}
                  </p>
                  <p className="recipe-servings">
                    <strong>Serves:</strong> {recipe.servings ? recipe.servings : 'N/A'}
                  </p>
                  <p className="recipe-description">
                    {recipe.summary
                      ? summarizeDescription(recipe.summary)
                      : 'No description available.'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      `https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`,
                      '_blank'
                    )
                  }
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

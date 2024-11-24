import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';
import './IngredientSearchRecipes.css'; // Import the CSS file
import FoodImage from './SearchByIngredients.jpg';

// Custom Hook for Debouncing Input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Clean up HTML content
const cleanHTML = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// Summarize recipe description to a given length
const summarizeDescription = (description, length = 150) => {
  const cleanedDescription = cleanHTML(description);
  if (cleanedDescription.length <= length) return cleanedDescription;

  const sentences = cleanedDescription.split('. ');
  let summary = '';
  for (let i = 0; i < sentences.length; i++) {
    summary += sentences[i] + '. ';
    if (summary.length > length) break;
  }
  return summary.trim() + '...';
};

const IngredientSearchRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ diet: '', cuisine: '', type: '' });
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [hasMore, setHasMore] = useState(true); // To handle infinite scroll

  const debouncedIngredients = useDebounce(ingredients, 500); // Debounced input

  // Define the searchByIngredients function with useCallback to avoid re-creation on every render
  const searchByIngredients = useCallback(async () => {
    if (!debouncedIngredients) return; // Prevent empty input
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/findByIngredients`, {
        params: {
          apiKey: API_KEY,
          ingredients: debouncedIngredients, // Comma-separated list of ingredients
          number: 10, // Limit results to 10
          offset: (page - 1) * 10,
          diet: filters.diet,
          cuisine: filters.cuisine,
          type: filters.type,
          sort: 'popularity', // Sort by popularity or relevance
        },
      });

      // Check if there are more recipes to load
      setHasMore(response.data.length === 10);

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

      setRecipes((prevRecipes) => [...prevRecipes, ...recipesWithDetails]);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedIngredients, page, filters]); // Dependencies for searchByIngredients

  // Load more recipes on scroll
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Trigger searchByIngredients when debouncedIngredients or page changes
  useEffect(() => {
    if (debouncedIngredients) {
      searchByIngredients(); // Call the API when ingredients change
    }
  }, [debouncedIngredients, page, searchByIngredients]); // `searchByIngredients` is stable due to `useCallback`

  // Toggle dark mode
  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      {/* Theme Toggle */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Main Content */}
      <div className="ingredient-search-container">
        <img
          src={FoodImage}
          alt="Food background"
          className="ingredient-search-image"
        />
        <div className="ingredient-search-overlay">
          <div className="recipe-title-container">
            <h1 className="recipe-title">What's in your fridge?!</h1>
            <p className="recipe-subtitle">
              Explore a variety of recipes tailored to your taste. Start by searching by ingredients!
            </p>
          </div>

          {/* Input and Filters */}
          <div className="search-and-filters">
            <div className="search-bar">
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

            {/* Filters */}
            <div className="filters">
              <select
                onChange={(e) => setFilters({ ...filters, diet: e.target.value })}
                value={filters.diet}
                className="filter-dropdown"
              >
                <option value="">Diet</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="keto">Keto</option>
                <option value="gluten free">Gluten-Free</option>
              </select>
              <select
                onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                value={filters.cuisine}
                className="filter-dropdown"
              >
                <option value="">Cuisine</option>
                <option value="italian">Italian</option>
                <option value="indian">Indian</option>
                <option value="chinese">Chinese</option>
                <option value="mexican">Mexican</option>
              </select>
              <select
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                value={filters.type}
                className="filter-dropdown"
              >
                <option value="">Meal Type</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div className={`ingredient-recipe-list ${recipes.length ? '' : 'hidden'}`} onScroll={handleScroll}>
        {loading ? (
          <div className="loading-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
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

      {/* Pagination */}
      {recipes.length > 0 && (
        <div className="pagination">
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              className="pagination-button"
              onClick={() => {
                setPage(i + 1);
                searchByIngredients();
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientSearchRecipes;

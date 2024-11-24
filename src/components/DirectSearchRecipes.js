import React, { useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../apiConfig';
import './DirectSearchRecipes.css';
import FoodImage from './DirectSearchRecipe.jpg';
import Fuse from 'fuse.js';

const DirectSearchRecipes = () => {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ diet: '', cuisine: '', type: '' });
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  
  // Fuzzy Search Function
  const fuzzySearchRecipes = (query, recipes) => {
    const fuse = new Fuse(recipes, {
      keys: ['title'],
      threshold: 0.4,
    });
    const result = fuse.search(query);
    return result.map(res => res.item);
  };

  // Function to determine if it's a recipe search or ingredient search
  const parseSearchQuery = (query) => {
    const recipeKeywords = ['recipe', 'dish', 'meal', 'cooking'];
    const isRecipeSearch = recipeKeywords.some(keyword => query.toLowerCase().includes(keyword));
    return isRecipeSearch ? { type: 'recipe', query } : { type: 'ingredient', query };
  };

  // Summarize Recipe Description
  const cleanHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

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

  // Search Recipes
  const searchRecipes = async () => {
    if (!query) return;
    setLoading(true);
    const parsedQuery = parseSearchQuery(query);

    try {
      const response = await axios.get(`${BASE_URL}/complexSearch`, {
        params: {
          apiKey: API_KEY,
          query: parsedQuery.query,
          number: 12,
          offset: (page - 1) * 12,
          diet: filters.diet,
          cuisine: filters.cuisine,
          type: filters.type,
          addRecipeInformation: true,
        },
      });

      let searchResults = response.data.results;
      if (parsedQuery.type === 'recipe') {
        searchResults = fuzzySearchRecipes(parsedQuery.query, searchResults);
      }

      setRecipes(searchResults);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Handler
  const changePage = (newPage) => {
    setPage(newPage);
    searchRecipes();
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      {/* Theme Toggle */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Recipe Search Section */}
      <div className="recipe-search-container">
        <img src={FoodImage} alt="Food background" className="recipe-search-image" />
        <div className="recipe-search-overlay">
          <div className="recipe-title-container">
            <h1 className="recipe-title">Discover Delicious Recipes</h1>
            <p className="recipe-subtitle">
              Explore a variety of recipes tailored to your taste. Start by searching for an ingredient or a dish!
            </p>
          </div>

          {/* Search and Filter */}
          <div className="search-and-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search recipes (e.g., chicken)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="recipe-search-input"
              />
              <button onClick={searchRecipes} className="recipe-search-button">
                <i className="fas fa-search">Search</i> {/* Search icon */}
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

      {/* Recipe List */}
      <div className={`recipe-list ${recipes.length > 0 ? 'has-recipes' : ''}`}>
        {loading ? (
          <div className="loading-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : (
          <div className="recipe-cards">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <div className="recipe-card-header">
                  <h3 className="recipe-title">{recipe.title}</h3>
                </div>
                <div className="recipe-card-body">
                  <div className="recipe-image-container">
                    {recipe.image && <img src={recipe.image} alt={recipe.title} className="recipe-thumbnail" />}
                  </div>
                  <p className="recipe-prep-time">
                    <strong>Prep Time:</strong> {recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'N/A'}
                  </p>
                  <p className="recipe-servings">
                    <strong>Serves:</strong> {recipe.servings ? recipe.servings : 'N/A'}
                  </p>
                  <p className="recipe-description">
                    {recipe.summary ? summarizeDescription(recipe.summary) : 'No description available.'}
                  </p>
                  <div className="recipe-tags">
                    {recipe.vegetarian && <span className="recipe-tag">Vegetarian</span>}
                    {recipe.vegan && <span className="recipe-tag">Vegan</span>}
                    {recipe.glutenFree && <span className="recipe-tag">Gluten-Free</span>}
                  </div>
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
              onClick={() => changePage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectSearchRecipes;

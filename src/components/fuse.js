import Fuse from 'fuse.js';

const searchRecipes = async () => {
  if (!query) return;
  setLoading(true);

  // Perform fuzzy search on existing recipes
  const fuse = new Fuse(recipes, {
    keys: ['title'],
    threshold: 0.4, // Adjust for fuzzy match sensitivity
  });

  // Search the recipe titles
  const result = fuse.search(query);
  const searchResults = result.map(res => res.item);

  setRecipes(searchResults); // Set search results
  setLoading(false);
};

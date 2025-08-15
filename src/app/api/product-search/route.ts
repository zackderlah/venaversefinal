import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const category = searchParams.get('category') || 'all';

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    let results: any[] = [];

    // 1. Food & Drinks - Using a free food database API
    if (category === 'all' || category === 'food' || category === 'drinks') {
      try {
        // Using Open Food Facts API (free, no API key required)
        const foodUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
        const foodRes = await fetch(foodUrl);
        const foodData = await foodRes.json();
        
        if (foodData.products) {
          const foodResults = foodData.products.map((product: any) => ({
            title: product.product_name || product.product_name_en || query,
            creator: product.brands || product.manufacturer || 'Unknown',
            poster: product.image_front_url || product.image_url,
            year: product.created_t || new Date().getFullYear().toString(),
            type: 'food',
            description: product.generic_name || product.product_name_en || ''
          }));
          results.push(...foodResults);
        }
      } catch (error) {
        console.error('Error fetching food data:', error);
      }
    }

    // 2. Products - Using a free product search API
    if (category === 'all' || category === 'products') {
      try {
        // Using a free product search service (example with dummy data for now)
        // In a real implementation, you could use APIs like:
        // - Walmart API (requires registration)
        // - Best Buy API (requires registration)
        // - Google Shopping API (requires API key)
        
        // For now, we'll create some generic product suggestions
        const productSuggestions = [
          {
            title: query,
            creator: 'Various Brands',
            poster: undefined,
            year: new Date().getFullYear().toString(),
            type: 'product',
            description: `Search results for ${query}`
          }
        ];
        results.push(...productSuggestions);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    }

    // 3. Drinks - Using a free drinks database
    if (category === 'all' || category === 'drinks') {
      try {
        // Using TheCocktailDB API (free, no API key required)
        const drinkUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
        const drinkRes = await fetch(drinkUrl);
        const drinkData = await drinkRes.json();
        
        if (drinkData.drinks) {
          const drinkResults = drinkData.drinks.map((drink: any) => ({
            title: drink.strDrink,
            creator: drink.strAlcoholic || 'Non-Alcoholic',
            poster: drink.strDrinkThumb,
            year: new Date().getFullYear().toString(),
            type: 'drink',
            description: drink.strInstructions || ''
          }));
          results.push(...drinkResults);
        }
      } catch (error) {
        console.error('Error fetching drink data:', error);
      }
    }

    // 4. Games - Using existing GiantBomb API
    if (category === 'all' || category === 'games') {
      try {
        const apiKey = "4ad067883d9d052b144b74cec0dcedb2c1c48431";
        const gameUrl = `https://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=game`;
        const gameRes = await fetch(gameUrl, { headers: { 'User-Agent': 'johnnywebsite' } });
        const gameData = await gameRes.json();
        
        if (gameData.results) {
          const gameResults = gameData.results.slice(0, 3).map((game: any) => ({
            title: game.name,
            creator: game.developer || 'Unknown Developer',
            poster: game.image?.super_url,
            year: game.original_release_date ? game.original_release_date.slice(0, 4) : new Date().getFullYear().toString(),
            type: 'game',
            description: game.deck || ''
          }));
          results.push(...gameResults);
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.title === result.title && r.creator === result.creator)
    );

    return NextResponse.json({ 
      results: uniqueResults.slice(0, 10),
      total: uniqueResults.length 
    });

  } catch (error) {
    console.error('Error in product search:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}

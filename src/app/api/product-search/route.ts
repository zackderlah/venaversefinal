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

    // 1. Food & Drinks - Using multiple free APIs
    if (category === 'all' || category === 'food' || category === 'drinks') {
      try {
        // Using Open Food Facts API (free, no API key required)
        const foodUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
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

      // Additional search for beverages using TheCocktailDB
      try {
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

      // Search for beer specifically using a beer database
      try {
        // Using Punk API (free beer database)
        const beerUrl = `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(query)}&per_page=5`;
        const beerRes = await fetch(beerUrl);
        const beerData = await beerRes.json();
        
        if (beerData && beerData.length > 0) {
          const beerResults = beerData.map((beer: any) => ({
            title: beer.name,
            creator: beer.brewery || beer.brewer_tips || 'Craft Brewery',
            poster: beer.image_url,
            year: beer.first_brewed ? beer.first_brewed.split('/')[1] || new Date().getFullYear().toString() : new Date().getFullYear().toString(),
            type: 'beer',
            description: beer.description || beer.tagline || ''
          }));
          results.push(...beerResults);
        }
      } catch (error) {
        console.error('Error fetching beer data:', error);
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

    // If no results found, provide some common suggestions based on the query
    if (uniqueResults.length === 0) {
      const lowerQuery = query.toLowerCase();
      
      // Common beer suggestions
      if (lowerQuery.includes('beer') || lowerQuery.includes('lager') || lowerQuery.includes('ale')) {
        uniqueResults.push(
          {
            title: query,
            creator: 'Various Breweries',
            poster: undefined,
            year: new Date().getFullYear().toString(),
            type: 'beer',
            description: `Beer product: ${query}`
          }
        );
      }
      // Common food suggestions
      else if (lowerQuery.includes('food') || lowerQuery.includes('snack') || lowerQuery.includes('meal')) {
        uniqueResults.push(
          {
            title: query,
            creator: 'Various Brands',
            poster: undefined,
            year: new Date().getFullYear().toString(),
            type: 'food',
            description: `Food product: ${query}`
          }
        );
      }
      // Generic product suggestion
      else {
        uniqueResults.push(
          {
            title: query,
            creator: 'Various Brands',
            poster: undefined,
            year: new Date().getFullYear().toString(),
            type: 'product',
            description: `Product: ${query}`
          }
        );
      }
    }

    return NextResponse.json({ 
      results: uniqueResults.slice(0, 10),
      total: uniqueResults.length 
    });

  } catch (error) {
    console.error('Error in product search:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}

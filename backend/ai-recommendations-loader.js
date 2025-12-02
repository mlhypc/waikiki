const fs = require('fs');
const path = require('path');

class AIRecommendationsLoader {
  constructor() {
    this.recommendations = {
      kadin: {
        alt: null,
        ayakkabi: null,
        dis: null,
        ust: null
      },
      erkek: {
        alt: null,
        ayakkabi: null,
        dis: null,
        ust: null
      }
    };
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;

    try {
      const recommendationsPath = path.join(__dirname, 'ai-recommendations');

      // Load all recommendation files for Kadın
      this.recommendations.kadin.alt = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_alt.json'), 'utf8')
      );
      this.recommendations.kadin.ayakkabi = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_ayakkabi.json'), 'utf8')
      );
      this.recommendations.kadin.dis = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_dis.json'), 'utf8')
      );
      this.recommendations.kadin.ust = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_ust.json'), 'utf8')
      );

      // Load all recommendation files for Erkek
      this.recommendations.erkek.alt = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'erkek_alt.json'), 'utf8')
      );
      this.recommendations.erkek.ayakkabi = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'erkek_ayakkabi.json'), 'utf8')
      );
      this.recommendations.erkek.dis = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'erkek_dis.json'), 'utf8')
      );
      this.recommendations.erkek.ust = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'erkek_ust.json'), 'utf8')
      );

      this.loaded = true;
      console.log('✅ AI Recommendations loaded successfully (Kadın & Erkek)');
    } catch (error) {
      console.error('❌ Failed to load AI recommendations:', error.message);
      this.loaded = false;
    }
  }

  /**
   * Get AI-powered recommendations for a product
   * @param {string} productId - The product ID to get recommendations for
   * @param {string} category - The product category (alt, ayakkabi, dis, ust)
   * @param {string} gender - The product gender (Kadın, Erkek)
   * @returns {Array} Array of product IDs from the SAME combination (3 items)
   */
  getRecommendations(productId, category, gender = 'Kadın') {
    if (!this.loaded) {
      console.warn('AI Recommendations not loaded yet');
      return [];
    }

    // Extract numeric ID from productId (e.g., "product-name-123" -> "123")
    const numericId = productId.match(/\d+$/)?.[0];
    if (!numericId) {
      return [];
    }

    // Normalize gender to lowercase for object key
    const genderKey = gender.toLowerCase() === 'erkek' ? 'erkek' : 'kadin';

    // Get recommendations based on gender and category
    const categoryRecommendations = this.recommendations[genderKey]?.[category];
    if (!categoryRecommendations || !categoryRecommendations[numericId]) {
      return [];
    }

    // Get the TOP combination sorted by score (just one combination)
    const topCombination = categoryRecommendations[numericId]
      .sort((a, b) => b.score - a.score)[0];

    if (!topCombination) {
      return [];
    }

    // Extract product IDs from the SAME combination
    const productIds = [];

    // Add different category products from the same recommendation
    if (category === 'alt') {
      // For pants, recommend top wear and accessories
      if (topCombination.ust_id) productIds.push(topCombination.ust_id.toString());
      if (topCombination.dis_id) productIds.push(topCombination.dis_id.toString());
      if (topCombination.ayakkabi_id) productIds.push(topCombination.ayakkabi_id.toString());
    } else if (category === 'ayakkabi') {
      // For shoes, recommend clothing items
      if (topCombination.alt_id) productIds.push(topCombination.alt_id.toString());
      if (topCombination.ust_id) productIds.push(topCombination.ust_id.toString());
      if (topCombination.dis_id) productIds.push(topCombination.dis_id.toString());
    } else if (category === 'dis') {
      // For outerwear, recommend other items
      if (topCombination.alt_id) productIds.push(topCombination.alt_id.toString());
      if (topCombination.ust_id) productIds.push(topCombination.ust_id.toString());
      if (topCombination.ayakkabi_id) productIds.push(topCombination.ayakkabi_id.toString());
    } else if (category === 'ust') {
      // For top wear, recommend other items
      if (topCombination.alt_id) productIds.push(topCombination.alt_id.toString());
      if (topCombination.dis_id) productIds.push(topCombination.dis_id.toString());
      if (topCombination.ayakkabi_id) productIds.push(topCombination.ayakkabi_id.toString());
    }

    // Return exactly 3 product IDs from the same combination
    return productIds.slice(0, 3);
  }

  /**
   * Map LCW category to AI recommendation category
   */
  mapCategory(lcwCategory) {
    const categoryMap = {
      'alt_giyim': 'alt',
      'ayakkabi': 'ayakkabi',
      'dis_giyim': 'dis',
      'ust_giyim': 'ust'
    };
    return categoryMap[lcwCategory] || null;
  }
}

// Singleton instance
const aiRecommendationsLoader = new AIRecommendationsLoader();

module.exports = aiRecommendationsLoader;

const fs = require('fs');
const path = require('path');

class AIRecommendationsLoader {
  constructor() {
    this.recommendations = {
      alt: null,
      ayakkabi: null,
      dis: null,
      ust: null
    };
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;

    try {
      const recommendationsPath = path.join(__dirname, 'ai-recommendations');

      // Load all recommendation files
      this.recommendations.alt = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_alt.json'), 'utf8')
      );
      this.recommendations.ayakkabi = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_ayakkabi.json'), 'utf8')
      );
      this.recommendations.dis = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_dis.json'), 'utf8')
      );
      this.recommendations.ust = JSON.parse(
        fs.readFileSync(path.join(recommendationsPath, 'kadın_ust.json'), 'utf8')
      );

      this.loaded = true;
      console.log('✅ AI Recommendations loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load AI recommendations:', error.message);
      this.loaded = false;
    }
  }

  /**
   * Get AI-powered recommendations for a product
   * @param {string} productId - The product ID to get recommendations for
   * @param {string} category - The product category (alt, ayakkabi, dis, ust)
   * @returns {Array} Array of product IDs
   */
  getRecommendations(productId, category) {
    if (!this.loaded) {
      console.warn('AI Recommendations not loaded yet');
      return [];
    }

    // Extract numeric ID from productId (e.g., "product-name-123" -> "123")
    const numericId = productId.match(/\d+$/)?.[0];
    if (!numericId) {
      return [];
    }

    // Get recommendations based on category
    const categoryRecommendations = this.recommendations[category];
    if (!categoryRecommendations || !categoryRecommendations[numericId]) {
      return [];
    }

    // Get top recommendations sorted by score
    const recommendations = categoryRecommendations[numericId]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    // Extract product IDs from the combination
    const productIds = [];
    recommendations.forEach(rec => {
      // Add different category products from the recommendation
      if (category === 'alt') {
        // For pants, recommend top wear and accessories
        if (rec.ust_id) productIds.push(rec.ust_id.toString());
        if (rec.dis_id) productIds.push(rec.dis_id.toString());
        if (rec.ayakkabi_id) productIds.push(rec.ayakkabi_id.toString());
      } else if (category === 'ayakkabi') {
        // For shoes, recommend clothing items
        if (rec.alt_id) productIds.push(rec.alt_id.toString());
        if (rec.ust_id) productIds.push(rec.ust_id.toString());
        if (rec.dis_id) productIds.push(rec.dis_id.toString());
      } else if (category === 'dis') {
        // For outerwear, recommend other items
        if (rec.alt_id) productIds.push(rec.alt_id.toString());
        if (rec.ust_id) productIds.push(rec.ust_id.toString());
        if (rec.ayakkabi_id) productIds.push(rec.ayakkabi_id.toString());
      }
    });

    // Return unique product IDs
    return [...new Set(productIds)].slice(0, 4);
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

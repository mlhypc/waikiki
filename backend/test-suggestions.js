const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/waikiki-store').then(async () => {
  const product = await Product.findOne({ productId: 'asimetrik-yaka-kadin-tisort-lacivert-o-4637078' });

  console.log('\n=== Product Info ===');
  console.log('Product ID:', product.productId);
  console.log('Category:', product.category);
  console.log('Has combinationSuggestions:', !!product.combinationSuggestions);
  console.log('combinationSuggestions length:', product.combinationSuggestions?.length || 0);

  if (product.combinationSuggestions && product.combinationSuggestions.length > 0) {
    console.log('\n=== First Combination Suggestion ===');
    console.log(JSON.stringify(product.combinationSuggestions[0], null, 2));
  }

  console.log('\n=== Related Products ===');
  console.log('Has relatedProducts:', !!product.relatedProducts);
  console.log('relatedProducts length:', product.relatedProducts?.length || 0);
  if (product.relatedProducts && product.relatedProducts.length > 0) {
    console.log('First 3 related:', product.relatedProducts.slice(0, 3));
  }

  process.exit(0);
});

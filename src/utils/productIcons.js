export const productIcons = {
  'green-apple': '/icons/products/apple_green.png',
  'red-apple': '/icons/products/apple_red.png',
  'corn': '/icons/products/corn.png',
  'eggplant': '/icons/products/eggplant.png',
  'lemon': '/icons/products/lemon.png',
  'peach': '/icons/products/peach.png',
  'strawberry': '/icons/products/strawberry.png',
  'tangerine': '/icons/products/tangerine.png',
  'tomato': '/icons/products/tomato.png',
  'watermelon': '/icons/products/watermelon.png',
  // Add default icons for other categories
  'vegetables': '/icons/products/default.png',
  'fruits': '/icons/products/default.png',
  'grains': '/icons/products/default.png',
  'herbs': '/icons/products/default.png',
  'flowers': '/icons/products/default.png',
  'organic-produce': '/icons/products/default.png',
  'dairy-products': '/icons/products/default.png',
  'livestock': '/icons/products/default.png',
};

// utils/productIcons.js
export const getProductIcon = (category) => {
  if (!category || typeof category !== 'string') {
    console.warn('Invalid category provided:', category);
    return '/icons/products/default.png';
  }
  
  // Normalize the category name to match the icon keys
  const normalizedName = category.toLowerCase().replace(/\s+/g, '-');
  return productIcons[normalizedName] || '/icons/products/default.png';
};

export const productCategories = [
  { id: 1, name: 'Green Apple', key: 'green-apple' },
  { id: 2, name: 'Red Apple', key: 'red-apple' },
  { id: 3, name: 'Corn', key: 'corn' },
  { id: 4, name: 'Eggplant', key: 'eggplant' },
  { id: 5, name: 'Lemon', key: 'lemon' },
  { id: 6, name: 'Peach', key: 'peach' },
  { id: 7, name: 'Strawberry', key: 'strawberry' },
  { id: 8, name: 'Tangerine', key: 'tangerine' },
  { id: 9, name: 'Tomato', key: 'tomato' },
  { id: 10, name: 'Watermelon', key: 'watermelon' },
];
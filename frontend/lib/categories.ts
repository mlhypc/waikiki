export interface SubCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: SubCategory[];
}

export interface GenderCategories {
  [key: string]: Category[];
}

// Match backend categories: alt_giyim, ust_giyim, dis_giyim, ayakkabi
export const categories: GenderCategories = {
  kadin: [
    {
      id: 'ust_giyim',
      name: 'Üst Giyim',
      icon: '👕',
    },
    {
      id: 'alt_giyim',
      name: 'Alt Giyim',
      icon: '👖',
    },
    {
      id: 'dis_giyim',
      name: 'Dış Giyim',
      icon: '🧥',
    },
    {
      id: 'ayakkabi',
      name: 'Ayakkabı',
      icon: '👠',
    },
  ],
  erkek: [
    {
      id: 'ust_giyim',
      name: 'Üst Giyim',
      icon: '👔',
    },
    {
      id: 'alt_giyim',
      name: 'Alt Giyim',
      icon: '👖',
    },
    {
      id: 'dis_giyim',
      name: 'Dış Giyim',
      icon: '🧥',
    },
    {
      id: 'ayakkabi',
      name: 'Ayakkabı',
      icon: '👞',
    },
  ],
};

export function getGenderCategories(gender: string): Category[] {
  return categories[gender] || [];
}

export function getCategory(gender: string, categoryId: string): Category | undefined {
  const genderCategories = getGenderCategories(gender);
  return genderCategories.find((cat) => cat.id === categoryId);
}

export function getSubcategory(
  gender: string,
  categoryId: string,
  subcategoryId: string
): SubCategory | undefined {
  const category = getCategory(gender, categoryId);
  return category?.subcategories?.find((sub) => sub.id === subcategoryId);
}

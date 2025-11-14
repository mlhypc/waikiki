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

export const categories: GenderCategories = {
  erkek: [
    {
      id: 'gomlek',
      name: 'Gömlek',
      icon: '👔',
      subcategories: [
        { id: 'klasik-gomlek', name: 'Klasik Gömlek', icon: '👔' },
        { id: 'kot-gomlek', name: 'Kot Gömlek', icon: '👕' },
        { id: 'spor-gomlek', name: 'Spor Gömlek', icon: '🎽' },
      ],
    },
    {
      id: 'tisort',
      name: 'Tişört',
      icon: '👕',
      subcategories: [
        { id: 'basic-tisort', name: 'Basic Tişört', icon: '👕' },
        { id: 'polo-tisort', name: 'Polo Tişört', icon: '👔' },
        { id: 'baskili-tisort', name: 'Baskılı Tişört', icon: '🎨' },
      ],
    },
    {
      id: 'pantolon',
      name: 'Pantolon',
      icon: '👖',
      subcategories: [
        { id: 'kot-pantolon', name: 'Kot Pantolon', icon: '👖' },
        { id: 'kumas-pantolon', name: 'Kumaş Pantolon', icon: '👔' },
        { id: 'esofman', name: 'Eşofman', icon: '🏃' },
      ],
    },
    {
      id: 'ceket',
      name: 'Ceket',
      icon: '🧥',
      subcategories: [
        { id: 'deri-ceket', name: 'Deri Ceket', icon: '🧥' },
        { id: 'kot-ceket', name: 'Kot Ceket', icon: '🧥' },
        { id: 'bomber-ceket', name: 'Bomber Ceket', icon: '🧥' },
      ],
    },
    {
      id: 'ayakkabi',
      name: 'Ayakkabı',
      icon: '👞',
      subcategories: [
        { id: 'spor-ayakkabi', name: 'Spor Ayakkabı', icon: '👟' },
        { id: 'klasik-ayakkabi', name: 'Klasik Ayakkabı', icon: '👞' },
        { id: 'bot', name: 'Bot', icon: '🥾' },
        { id: 'terlik', name: 'Terlik', icon: '🩴' },
      ],
    },
    {
      id: 'aksesuar',
      name: 'Aksesuar',
      icon: '⌚',
      subcategories: [
        { id: 'saat', name: 'Saat', icon: '⌚' },
        { id: 'kemer', name: 'Kemer', icon: '🎗️' },
        { id: 'sapka', name: 'Şapka', icon: '🧢' },
      ],
    },
  ],
  kadin: [
    {
      id: 'elbise',
      name: 'Elbise',
      icon: '👗',
      subcategories: [
        { id: 'gunluk-elbise', name: 'Günlük Elbise', icon: '👗' },
        { id: 'abiye-elbise', name: 'Abiye Elbise', icon: '👗' },
        { id: 'yazlik-elbise', name: 'Yazlık Elbise', icon: '👗' },
      ],
    },
    {
      id: 'etek',
      name: 'Etek',
      icon: '👚',
      subcategories: [
        { id: 'mini-etek', name: 'Mini Etek', icon: '👚' },
        { id: 'midi-etek', name: 'Midi Etek', icon: '👚' },
        { id: 'maxi-etek', name: 'Maxi Etek', icon: '👚' },
      ],
    },
    {
      id: 'bluz',
      name: 'Bluz',
      icon: '👕',
      subcategories: [
        { id: 'klasik-bluz', name: 'Klasik Bluz', icon: '👕' },
        { id: 'sifon-bluz', name: 'Şifon Bluz', icon: '👕' },
        { id: 'crop-top', name: 'Crop Top', icon: '👕' },
      ],
    },
    {
      id: 'pantolon',
      name: 'Pantolon',
      icon: '👖',
      subcategories: [
        { id: 'kot-pantolon', name: 'Kot Pantolon', icon: '👖' },
        { id: 'kumas-pantolon', name: 'Kumaş Pantolon', icon: '👔' },
        { id: 'tayt', name: 'Tayt', icon: '🩱' },
      ],
    },
    {
      id: 'ayakkabi',
      name: 'Ayakkabı',
      icon: '👠',
      subcategories: [
        { id: 'topuklu-ayakkabi', name: 'Topuklu Ayakkabı', icon: '👠' },
        { id: 'spor-ayakkabi', name: 'Spor Ayakkabı', icon: '👟' },
        { id: 'sandalet', name: 'Sandalet', icon: '👡' },
        { id: 'bot', name: 'Bot', icon: '🥾' },
      ],
    },
    {
      id: 'canta',
      name: 'Çanta',
      icon: '👜',
      subcategories: [
        { id: 'el-cantasi', name: 'El Çantası', icon: '👜' },
        { id: 'omuz-cantasi', name: 'Omuz Çantası', icon: '👜' },
        { id: 'sirt-cantasi', name: 'Sırt Çantası', icon: '🎒' },
      ],
    },
    {
      id: 'aksesuar',
      name: 'Aksesuar',
      icon: '💍',
      subcategories: [
        { id: 'taki', name: 'Takı', icon: '💍' },
        { id: 'saat', name: 'Saat', icon: '⌚' },
        { id: 'sal', name: 'Şal', icon: '🧣' },
      ],
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

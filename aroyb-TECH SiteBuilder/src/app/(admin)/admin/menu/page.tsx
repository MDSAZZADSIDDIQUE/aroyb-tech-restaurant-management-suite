import Image from 'next/image';
import menuData from '@/data/menu.json';
import { MenuItem, MenuCategory } from '@/types';

export default function AdminMenuPage() {
  const categories = menuData.categories as MenuCategory[];
  const items = menuData.items as MenuItem[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900">Menu Preview</h1>
        <p className="text-neutral-600 mt-2">
          View how menu items appear to customers (read-only in demo)
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-primary-600">{items.length}</span>
          <span className="text-neutral-600 ml-2">items</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-primary-600">{categories.length}</span>
          <span className="text-neutral-600 ml-2">categories</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-green-600">{items.filter(i => i.available).length}</span>
          <span className="text-neutral-600 ml-2">available</span>
        </div>
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = items.filter(i => i.categoryId === category.id);
          
          return (
            <div key={category.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">{category.name}</h2>
                    <p className="text-sm text-neutral-500">{categoryItems.length} items</p>
                  </div>
                  <span className="badge-neutral">Sort: {category.sortOrder}</span>
                </div>
              </div>

              <div className="divide-y divide-neutral-100">
                {categoryItems.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 hover:bg-neutral-50">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100">
                      {item.images[0] && (
                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-neutral-900 flex items-center gap-2">
                            {item.name}
                            {!item.available && (
                              <span className="badge-danger text-xs">Unavailable</span>
                            )}
                            {item.popular && (
                              <span className="badge-primary text-xs">Popular</span>
                            )}
                            {item.newItem && (
                              <span className="badge-warning text-xs">New</span>
                            )}
                          </h3>
                          <p className="text-sm text-neutral-500 line-clamp-1 mt-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="font-bold text-neutral-900">£{item.price.toFixed(2)}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.dietaryTags.map((tag) => (
                          <span key={tag} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        {item.allergens.map((allergen) => (
                          <span key={allergen} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            {allergen}
                          </span>
                        ))}
                        {item.spiceLevel > 0 && (
                          <span className="text-xs">
                            {'🌶️'.repeat(item.spiceLevel)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Note */}
      <div className="mt-8 p-4 bg-neutral-100 rounded-lg text-center">
        <p className="text-sm text-neutral-600">
          In production, you can edit items, prices, availability, and photos directly from this page.
        </p>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import AllergenBadge from './AllergenBadge';
import DietaryTag from './DietaryTag';
import SpiceIndicator from './SpiceIndicator';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

export default function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  return (
    <button
      onClick={onClick}
      className="card group text-left w-full focus:outline-none focus:ring-2 
                focus:ring-primary-500 focus:ring-offset-2"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.images[0] || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-card-gradient opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.popular && (
            <span className="badge bg-primary-500 text-white">
              ⭐ Popular
            </span>
          )}
          {item.newItem && (
            <span className="badge bg-secondary-500 text-neutral-900">
              ✨ New
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white px-3 py-1.5 rounded-full font-bold text-neutral-900 shadow-soft">
            £{item.price.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 
                     transition-colors line-clamp-1">
          {item.name}
        </h3>
        
        <p className="text-neutral-600 text-sm mt-1 line-clamp-2 min-h-[2.5rem]">
          {item.description}
        </p>
        
        {/* Tags Row */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          {/* Dietary Tags */}
          {item.dietaryTags.slice(0, 3).map((tag) => (
            <DietaryTag key={tag} tag={tag} size="sm" />
          ))}
          
          {/* Spice Level */}
          {item.spiceLevel > 0 && (
            <SpiceIndicator level={item.spiceLevel} />
          )}
        </div>
        
        {/* Allergens */}
        {item.allergens.length > 0 && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100">
            <span className="text-xs text-neutral-500 mr-1">Contains:</span>
            {item.allergens.slice(0, 4).map((allergen) => (
              <AllergenBadge key={allergen} allergen={allergen} size="sm" />
            ))}
            {item.allergens.length > 4 && (
              <span className="text-xs text-neutral-500">+{item.allergens.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

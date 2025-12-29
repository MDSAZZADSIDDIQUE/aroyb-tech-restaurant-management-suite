'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, ModifierGroup, AddOn, CartItemModifier, CartItemAddOn } from '@/types';
import { useCart } from '@/lib/cart-store';
import AllergenBadge from './AllergenBadge';
import DietaryTag from './DietaryTag';
import SpiceIndicator from './SpiceIndicator';
import menuData from '@/data/menu.json';
import { getRecommendedAddOns } from '@/lib/recommendation-rules';

interface ItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemModal({ item, isOpen, onClose }: ItemModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const allItems = menuData.items as MenuItem[];
  const recommendations = getRecommendedAddOns(item, allItems);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedModifiers({});
      setSelectedAddOns({});
      setSpecialInstructions('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleModifierChange = (groupId: string, optionId: string, maxSelect: number) => {
    setSelectedModifiers(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      }
      if (maxSelect === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.length < maxSelect) {
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return prev;
    });
  };

  const handleAddOnChange = (addOnId: string, delta: number) => {
    setSelectedAddOns(prev => {
      const current = prev[addOnId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [addOnId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addOnId]: newValue };
    });
  };

  const calculateTotal = () => {
    let total = item.price;
    
    // Add modifier prices
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = item.modifierGroups.find(g => g.id === groupId);
      if (group) {
        optionIds.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId);
          if (option) total += option.priceDelta;
        });
      }
    });
    
    // Add add-on prices
    Object.entries(selectedAddOns).forEach(([addOnId, qty]) => {
      const addOn = item.addOns.find(a => a.id === addOnId);
      if (addOn) total += addOn.price * qty;
    });
    
    return total * quantity;
  };

  const canAddToCart = () => {
    // Check required modifiers
    return item.modifierGroups
      .filter(g => g.required)
      .every(g => {
        const selected = selectedModifiers[g.id] || [];
        return selected.length >= g.minSelect;
      });
  };

  const handleAddToCart = () => {
    const modifiers: CartItemModifier[] = Object.entries(selectedModifiers)
      .filter(([_, options]) => options.length > 0)
      .map(([groupId, optionIds]) => {
        const group = item.modifierGroups.find(g => g.id === groupId)!;
        return {
          groupId,
          groupName: group.name,
          options: optionIds.map(optionId => {
            const option = group.options.find(o => o.id === optionId)!;
            return { id: optionId, name: option.name, priceDelta: option.priceDelta };
          }),
        };
      });

    const addOns: CartItemAddOn[] = Object.entries(selectedAddOns)
      .filter(([_, qty]) => qty > 0)
      .map(([addOnId, qty]) => {
        const addOn = item.addOns.find(a => a.id === addOnId)!;
        return { id: addOnId, name: addOn.name, price: addOn.price, quantity: qty };
      });

    addItem({
      itemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      modifiers,
      addOns,
      specialInstructions: specialInstructions || undefined,
      image: item.images[0],
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur 
                     rounded-full flex items-center justify-center shadow-lg
                     hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative h-64 md:h-80">
            <Image
              src={item.images[0] || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600'}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-4 left-4 right-16">
              <h2 id="modal-title" className="text-2xl md:text-3xl font-display font-bold text-white">
                {item.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {item.dietaryTags.map((tag) => (
                  <DietaryTag key={tag} tag={tag} size="md" />
                ))}
                {item.spiceLevel > 0 && <SpiceIndicator level={item.spiceLevel} />}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-20rem)]">
            <div className="p-6">
              {/* Description */}
              <p className="text-neutral-600 mb-4">
                {item.longDescription || item.description}
              </p>

              {/* Price & Calories */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold text-primary-600">
                  £{item.price.toFixed(2)}
                </span>
                {item.calories && (
                  <span className="text-neutral-500 text-sm">
                    {item.calories} kcal
                  </span>
                )}
              </div>

              {/* Allergens Warning */}
              {item.allergens.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-amber-800 mb-2">Allergen Information</p>
                      <div className="flex flex-wrap gap-2">
                        {item.allergens.map((allergen) => (
                          <AllergenBadge key={allergen} allergen={allergen} showLabel size="md" />
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        If you have severe allergies, please call the restaurant before ordering.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modifiers */}
              {item.modifierGroups.map((group) => (
                <div key={group.id} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">
                      {group.name}
                      {group.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <span className="text-sm text-neutral-500">
                      {group.maxSelect === 1 ? 'Choose 1' : `Choose up to ${group.maxSelect}`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = (selectedModifiers[group.id] || []).includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleModifierChange(group.id, option.id, group.maxSelect)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border 
                                    transition-all ${
                                      isSelected 
                                        ? 'border-primary-500 bg-primary-50' 
                                        : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary-500 bg-primary-500' : 'border-neutral-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium">{option.name}</span>
                          </div>
                          {option.priceDelta !== 0 && (
                            <span className="text-neutral-600">
                              {option.priceDelta > 0 ? '+' : ''}£{option.priceDelta.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Add-ons */}
              {item.addOns.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Add-ons</h3>
                  <div className="space-y-2">
                    {item.addOns.map((addOn) => {
                      const qty = selectedAddOns[addOn.id] || 0;
                      return (
                        <div
                          key={addOn.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-neutral-200"
                        >
                          <div>
                            <span className="font-medium">{addOn.name}</span>
                            <span className="text-neutral-600 ml-2">+£{addOn.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAddOnChange(addOn.id, -1)}
                              disabled={qty === 0}
                              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center
                                       hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium">{qty}</span>
                            <button
                              onClick={() => handleAddOnChange(addOn.id, 1)}
                              className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center
                                       hover:bg-primary-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                  <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <span>✨</span>
                    <span>Recommended for you</span>
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">{recommendations[0]?.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.slice(0, 3).map((rec) => (
                      <span 
                        key={rec.type === 'item' ? (rec.item as MenuItem).id : (rec.item as AddOn).id}
                        className="badge-neutral"
                      >
                        {rec.type === 'item' ? (rec.item as MenuItem).name : (rec.item as AddOn).name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="mb-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Special Instructions</h3>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any allergies or special requests? Let us know..."
                  className="input-field resize-none h-24"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  ⚠️ Allergy information is provided by the restaurant. If you have severe allergies, 
                  call the restaurant before ordering.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4">
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-3 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center
                           hover:bg-neutral-50 transition-colors font-bold text-lg"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center
                           hover:bg-neutral-50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart • £{calculateTotal().toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

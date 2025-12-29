import { NextResponse } from 'next/server';
import menuData from '@/data/menu.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId');
  const categoryId = searchParams.get('categoryId');
  
  let items = menuData.items;
  
  if (categoryId) {
    items = items.filter(item => item.categoryId === categoryId);
  }
  
  return NextResponse.json({
    categories: menuData.categories,
    items,
    locationId,
  });
}


import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card group">
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {product.installmentAvailable && (
            <div className="absolute top-2 right-2 bg-brand-600 text-white text-xs py-1 px-2 rounded-full">
              EMI Available
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 text-lg font-semibold text-brand-700">{formatPrice(product.price)}</p>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        
        <div className="mt-4 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 flex items-center justify-center"
            asChild
          >
            <Link to={`/product/${product.id}`}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span>Buy Now</span>
            </Link>
          </Button>
          
          {product.installmentAvailable && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 flex items-center justify-center bg-brand-600 hover:bg-brand-700"
              asChild
            >
              <Link to={`/product/${product.id}?installment=true`}>
                <CreditCard className="h-4 w-4 mr-1" />
                <span>EMI</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

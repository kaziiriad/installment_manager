
import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Product, ApiError } from '@/types';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORIES = ['Smartphones', 'Laptops', 'Cameras', 'TVs'];
const BRANDS = ['Samsung', 'Apple', 'Dell', 'Sony', 'Canon', 'LG'];

export const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 400000]);
  const [sortOption, setSortOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/products/`);
        
        // Transform the API response to match our Product type
        const transformedProducts = response.data.map((product: Product) => ({
          id: product.id, // Now expecting a number from the backend
          name: product.name,
          price_in_bdt: product.price_in_bdt, // Updated to match backend response
          // Add default values for fields not provided by the API
          description: product.description || 'No description available',
          category: product.category || 'Uncategorized',
          brand: product.brand || 'Unknown',
          images: product.images || ['https://placehold.co/600x400?text=No+Image'],
          installment_available: product.installment_available || false,
        }));
        
        setAllProducts(transformedProducts);
        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on selected filters
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    setLoading(true);
    
    // Apply filters locally
    setTimeout(() => {
      let filteredProducts = [...allProducts];
      
      // Apply search term filter
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply category filter
      if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          selectedCategories.includes(product.category || 'Uncategorized')
        );
      }
      
      // Apply brand filter
      if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          selectedBrands.includes(product.brand || 'Unknown')
        );
      }
      
      // Apply price range filter - using price_in_bdt instead of price
      filteredProducts = filteredProducts.filter(product => 
        product.price_in_bdt >= priceRange[0] && product.price_in_bdt <= priceRange[1]
      );
      
      // Apply sorting - using price_in_bdt instead of price
      if (sortOption) {
        if (sortOption === 'price-low-high') {
          filteredProducts.sort((a, b) => a.price_in_bdt - b.price_in_bdt);
        } else if (sortOption === 'price-high-low') {
          filteredProducts.sort((a, b) => b.price_in_bdt - a.price_in_bdt);
        }
      }
      
      setProducts(filteredProducts);
      setLoading(false);
    }, 300);
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, sortOption, allProducts]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle brand selection
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 400000]);
    setSortOption('');
  };

  return (
    <>
      <Navbar />
      <main className="page-container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
          
          <div className="flex gap-2">
            {/* Sort dropdown for desktop */}
            <div className="hidden md:block">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
            
            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="font-medium text-sm mb-2">Categories</h3>
                    <div className="space-y-2">
                      {CATEGORIES.map(category => (
                        <div key={category} className="flex items-center">
                          <Checkbox
                            id={`mobile-category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label
                            htmlFor={`mobile-category-${category}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-sm mb-2">Brands</h3>
                    <div className="space-y-2">
                      {BRANDS.map(brand => (
                        <div key={brand} className="flex items-center">
                          <Checkbox
                            id={`mobile-brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <label
                            htmlFor={`mobile-brand-${brand}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium text-sm">Price Range</h3>
                      <span className="text-xs text-gray-500">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={[priceRange[0], priceRange[1]]}
                      min={0}
                      max={400000}
                      step={10000}
                      onValueChange={(value) => setPriceRange([value[0], value[1]])}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-sm mb-2">Sort By</h3>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="">No sorting</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                    </select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop filter sidebar */}
          <div className="hidden md:block space-y-6">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Categories</span>
                  </h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(category => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-sm mb-2">Brands</h3>
                  <div className="space-y-2">
                    {BRANDS.map(brand => (
                      <div key={brand} className="flex items-center">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-sm">Price Range</h3>
                    <span className="text-xs text-gray-500">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                  </div>
                  <Slider
                    value={[priceRange[0], priceRange[1]]}
                    min={0}
                    max={400000}
                    step={10000}
                    onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Product grid */}
          <div className="md:col-span-3">
            {/* Mobile search */}
            <div className="relative mb-4 md:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort dropdown for mobile */}
            <div className="flex justify-end mb-4 md:hidden">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
            
            {/* Active filters */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || searchTerm) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map(category => (
                  <div 
                    key={`filter-${category}`}
                    className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{category}</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => toggleCategory(category)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {selectedBrands.map(brand => (
                  <div 
                    key={`filter-${brand}`}
                    className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{brand}</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => toggleBrand(brand)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {searchTerm && (
                  <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full flex items-center">
                    <span>"{searchTerm}"</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setSearchTerm('')}
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <button 
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  onClick={resetFilters}
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-72 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SlidersHorizontal className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button 
                  onClick={resetFilters} 
                  variant="outline" 
                  className="mt-6"
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

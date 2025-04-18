import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, CreditCard, Check, ArrowRight, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/products/ProductCard';
import { InstallmentCalculator } from '@/components/installments/InstallmentCalculator';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Type for product specifications
interface ProductSpec {
  name: string;
  value: string;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const showInstallment = searchParams.get('installment') === 'true';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productSpecs, setProductSpecs] = useState<ProductSpec[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product details
        const response = await axios.get(`${API_URL}/products/${id}/`);
        
        // Transform the API response to match our Product type
        const transformedProduct: Product = {
          id: response.data.id.toString(),
          name: response.data.name,
          price: response.data.price_in_bdt,
          description: response.data.description || 'No description available',
          category: response.data.category || 'Uncategorized',
          brand: response.data.brand || 'Unknown',
          images: response.data.images || ['https://placehold.co/600x400?text=No+Image'],
          installmentAvailable: response.data.installment_available || true,
        };
        
        setProduct(transformedProduct);
        
        // Extract specifications if available
        if (response.data.specifications) {
          const specs: ProductSpec[] = Object.entries(response.data.specifications).map(
            ([name, value]) => ({ name, value: value as string })
          );
          setProductSpecs(specs);
        }
        
        // Fetch related products
        try {
          const relatedResponse = await axios.get(`${API_URL}/products/`, {
            params: {
              category: transformedProduct.category,
              exclude: id,
              limit: 3
            }
          });
          
          // Transform related products
          const transformedRelated: Product[] = relatedResponse.data.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            price: item.price_in_bdt,
            description: item.description || 'No description available',
            category: item.category || 'Uncategorized',
            brand: item.brand || 'Unknown',
            images: item.images || ['https://placehold.co/600x400?text=No+Image'],
            installmentAvailable: item.installment_available || false,
          }));
          
          setRelatedProducts(transformedRelated);
        } catch (err) {
          console.error('Error fetching related products:', err);
          // Don't set an error for related products, just leave the array empty
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Navigate to previous or next image
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!product || !product.images || product.images.length <= 1) return;
    
    if (direction === 'prev') {
      setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    } else {
      setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  // Handle installment plan selection
  const handleProceedToInstallment = (plan: {
    months: number;
    downPayment: number;
    monthlyAmount: number;
    totalAmount: number;
  }) => {
    if (!product) return;
    
    navigate('/installment-application', { 
      state: { 
        product,
        plan,
      } 
    });
  };

  // Handle buy now button click
  const handleBuyNow = () => {
    toast({
      title: 'Processing Purchase',
      description: 'This would normally take you to the checkout page.',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page-container py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="page-container py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
            <p className="mt-2 text-gray-600">We couldn't load the product details.</p>
            <Button 
              onClick={() => navigate('/products')} 
              className="mt-6 bg-brand-600 hover:bg-brand-700"
            >
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="page-container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
            <p className="mt-2 text-gray-600">Sorry, we couldn't find the product you're looking for.</p>
            <Button 
              onClick={() => navigate('/products')} 
              className="mt-6 bg-brand-600 hover:bg-brand-700"
            >
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-container py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-brand-600">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-brand-600">Products</a>
          <span className="mx-2">/</span>
          <a href={`/products?category=${product.category}`} className="hover:text-brand-600">{product.category}</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product images */}
          <div className="space-y-4">
            <div className="relative aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
              
              {product.installmentAvailable && (
                <div className="absolute top-2 right-2 bg-brand-600 text-white text-xs py-1 px-2 rounded-full">
                  EMI Available
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-brand-600' : 'opacity-70'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - View ${index + 1}`} 
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div>
            <div className="border-b pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-gray-500 text-sm ml-2">124 Reviews</span>
              </div>
              <p className="text-3xl font-semibold text-brand-700">{formatPrice(product.price)}</p>
              
              <div className="mt-6 space-y-4">
                <p className="text-gray-600">{product.description}</p>
                
                <div className="flex flex-col space-y-3">
                  <div className="flex">
                    <span className="text-gray-500 w-24">Brand:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Availability:</span>
                    <span className="font-medium text-green-600">In Stock</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              {!showInstallment ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                    <Button 
                      onClick={handleBuyNow}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    
                    {product.installmentAvailable && (
                      <Button 
                        onClick={() => navigate(`/installments?product_id=${product.id}&`)}
                        className="flex-1 bg-brand-600 hover:bg-brand-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Buy on Installment
                      </Button>
                    )}
                  </div>
                  
                  {product.installmentAvailable && (
                    <Card className="bg-gray-50 border-none">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                          <div className="mb-3 sm:mb-0">
                            <p className="text-sm font-semibold text-gray-900">Available on Easy Installments</p>
                            <p className="text-sm text-gray-600">Pay as low as {formatPrice(product.price / 12)} per month</p>
                          </div>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-brand-600"
                            onClick={() => navigate(`/product/${product.id}?installment=true`)}
                          >
                            View Plans <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <InstallmentCalculator 
                  productPrice={product.price} 
                  onProceed={handleProceedToInstallment}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Product details tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-6">
              <div className="prose max-w-none">
                <h3>About this item</h3>
                <p>Experience cutting-edge technology with the {product.name}. This premium device offers exceptional performance, a stunning display, and innovative features to enhance your daily life.</p>
                <p>{product.description}</p>
                <h3>Key Features</h3>
                <ul>
                  <li>Powerful performance for all your computing needs</li>
                  <li>Stunning high-resolution display for immersive viewing</li>
                  <li>Long-lasting battery life to keep you productive all day</li>
                  <li>Sleek and lightweight design for ultimate portability</li>
                  <li>Advanced security features to protect your data</li>
                </ul>
                <h3>Warranty Information</h3>
                <p>This product comes with 1 year of manufacturer warranty covering hardware defects and malfunctions.</p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="pt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {productSpecs && productSpecs.length > 0 ? (
                      productSpecs.map((spec, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">{spec.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{spec.value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-4 text-sm text-gray-500 text-center">
                          Detailed specifications not available for this product.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-600">Reviews will be available soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};
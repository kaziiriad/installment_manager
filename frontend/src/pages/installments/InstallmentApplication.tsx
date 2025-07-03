
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Calendar, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface LocationState {
  product: Product;
  plan: {
    months: number;
    downPayment: number;
    monthlyAmount: number;
    totalAmount: number;
  };
}

export const InstallmentApplication: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as LocationState;
  
  // Form state - must be declared before any returns
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (!state?.product || !state?.plan) {
      return {
        productId: '',
        initialPayment: 0,
        period_of_installment: 0,
        due_day: 1
      };
    }
    return {
      // Personal Information
      productId: state.product.id,
      initialPayment: state.plan.downPayment,
      period_of_installment: state.plan.months,
      due_day: 1
    };
  });
  
  // If no state is provided, redirect to products page
  if (!state?.product || !state?.plan) {
    navigate('/products');
    return null;
  }

  const { product, plan } = state;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle radio input changes
  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Go to next step
  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  // Go to previous step
  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', { ...formData, product, plan });
    
    toast({
      title: 'Application Submitted',
      description: 'Your installment application has been submitted successfully!',
    });
    
    // Redirect to confirmation page or dashboard
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar />
      <main className="page-container py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 p-0 flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Product
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Installment Application</h1>
            <p className="text-gray-600">
              Please fill out the form below to apply for an installment plan for your purchase.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Personal Info</span>
              <span>Address</span>
              <span>Employment</span>
              <span>Review</span>
            </div>
            <Progress value={currentStep * 25} className="h-2 bg-gray-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email address"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="nationalId">National ID / Passport Number</Label>
                            <Input
                              id="nationalId"
                              name="nationalId"
                              value={formData.nationalId}
                              onChange={handleInputChange}
                              placeholder="Enter your ID number"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              name="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                          <Button 
                            type="button" 
                            onClick={handleNextStep}
                            className="bg-brand-600 hover:bg-brand-700"
                          >
                            Next Step
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Address */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="address">Street Address</Label>
                            <Textarea
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Enter your street address"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Enter your city"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              placeholder="Enter your postal code"
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handlePreviousStep}
                          >
                            Previous Step
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleNextStep}
                            className="bg-brand-600 hover:bg-brand-700"
                          >
                            Next Step
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Employment Details */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment & Income</h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label>Employment Status</Label>
                            <RadioGroup
                              value={formData.employmentStatus}
                              onValueChange={(value) => handleRadioChange('employmentStatus', value)}
                              className="mt-2 space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="employed" id="employed" />
                                <Label htmlFor="employed" className="font-normal">Employed</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="self-employed" id="self-employed" />
                                <Label htmlFor="self-employed" className="font-normal">Self-Employed</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="student" id="student" />
                                <Label htmlFor="student" className="font-normal">Student</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other" className="font-normal">Other</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div>
                            <Label htmlFor="employer">Employer / Business Name</Label>
                            <Input
                              id="employer"
                              name="employer"
                              value={formData.employer}
                              onChange={handleInputChange}
                              placeholder="Enter your employer or business name"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="monthlyIncome">Monthly Income (BDT)</Label>
                            <Input
                              id="monthlyIncome"
                              name="monthlyIncome"
                              type="number"
                              value={formData.monthlyIncome}
                              onChange={handleInputChange}
                              placeholder="Enter your monthly income"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="paymentDay">Preferred Monthly Payment Day</Label>
                            <Select
                              value={formData.paymentDay}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentDay: value }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select payment day" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(28)].map((_, i) => (
                                  <SelectItem key={i} value={(i + 1).toString()}>
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handlePreviousStep}
                          >
                            Previous Step
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleNextStep}
                            className="bg-brand-600 hover:bg-brand-700"
                          >
                            Next Step
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 4: Review and Submit */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h2>
                        
                        <div className="bg-gray-50 p-4 rounded-md space-y-4">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600">Full Name:</div>
                              <div>{formData.fullName || 'Not provided'}</div>
                              <div className="text-gray-600">Email:</div>
                              <div>{formData.email || 'Not provided'}</div>
                              <div className="text-gray-600">Phone:</div>
                              <div>{formData.phone || 'Not provided'}</div>
                              <div className="text-gray-600">National ID:</div>
                              <div>{formData.nationalId || 'Not provided'}</div>
                              <div className="text-gray-600">Date of Birth:</div>
                              <div>{formData.dateOfBirth || 'Not provided'}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Address</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600">Street Address:</div>
                              <div>{formData.address || 'Not provided'}</div>
                              <div className="text-gray-600">City:</div>
                              <div>{formData.city || 'Not provided'}</div>
                              <div className="text-gray-600">Postal Code:</div>
                              <div>{formData.postalCode || 'Not provided'}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Employment Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600">Employment Status:</div>
                              <div>{formData.employmentStatus}</div>
                              <div className="text-gray-600">Employer:</div>
                              <div>{formData.employer || 'Not provided'}</div>
                              <div className="text-gray-600">Monthly Income:</div>
                              <div>{formData.monthlyIncome ? `BDT ${formData.monthlyIncome}` : 'Not provided'}</div>
                              <div className="text-gray-600">Payment Day:</div>
                              <div>{formData.paymentDay} of each month</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-6">
                          <Checkbox
                            id="acceptTerms"
                            checked={formData.acceptTerms}
                            onCheckedChange={(checked) => handleCheckboxChange('acceptTerms', checked === true)}
                          />
                          <label
                            htmlFor="acceptTerms"
                            className="text-sm text-gray-700 leading-tight"
                          >
                            I accept the{' '}
                            <a href="/terms" className="text-brand-600 hover:underline">Terms & Conditions</a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>.
                          </label>
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handlePreviousStep}
                          >
                            Previous Step
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-brand-600 hover:bg-brand-700"
                            disabled={!formData.acceptTerms}
                          >
                            Submit Application
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Summary sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Product Price:</span>
                      <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{plan.months} months</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Down Payment:</span>
                      <span className="text-sm font-medium">{formatCurrency(plan.downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Payment:</span>
                      <span className="text-sm font-medium">{formatCurrency(plan.monthlyAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Total Amount:</span>
                      <span className="text-sm font-semibold text-brand-700">{formatCurrency(plan.totalAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>No hidden fees</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Free delivery</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 text-green-500 mr-2" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-green-500 mr-2" />
                      <span>Flexible payment dates</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-xs text-gray-600">
                      <ChevronsUpDown className="h-3 w-3 text-gray-400 mr-1" />
                      <span>Payment schedule will be available after approval</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};


import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-12 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-700">EasyPay</h3>
            <p className="text-gray-600">
              Making payments simple and accessible through installment plans.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-600">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-600">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-600">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-600">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-brand-600">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-brand-600">Products</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-brand-600">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-brand-600">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-brand-600">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-brand-600">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-600 hover:text-brand-600">Refund Policy</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-brand-600">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                <span className="text-gray-600">123 Business Street, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">+880 1234 567890</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">info@easypay.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-gray-500 text-center">
            © {new Date().getFullYear()} EasyPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

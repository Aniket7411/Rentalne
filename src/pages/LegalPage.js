import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TITLES = {
  'terms-and-conditions': 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy',
  'cancellation-refund': 'Cancellation & Refund',
  'delivery-service': 'Delivery & Service',
  'shipping-policy': 'Shipping Policy',
};

const LegalPage = () => {
  const { docId } = useParams();
  const title = TITLES[docId] || 'Legal';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-primary-blue hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold text-text-dark mb-4">{title}</h1>
        <p className="text-text-light leading-relaxed">
          Full policy documents are maintained by ASH Enterprises. For the latest version or questions,
          contact{' '}
          <a href="mailto:support@ashenterprises.in" className="text-primary-blue font-medium hover:underline">
            support@ashenterprises.in
          </a>{' '}
          or call{' '}
          <a href="tel:+918169535736" className="text-primary-blue font-medium hover:underline">
            +91 8169535736
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default LegalPage;

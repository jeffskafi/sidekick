import React from "react";
import { Check } from "lucide-react";

interface PricingTierProps {
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  features,
  buttonText,
  highlighted = false,
}) => (
  <div
    className={`rounded-lg p-6 shadow-md ${
      highlighted
        ? "border-2 border-primary-light dark:border-primary-dark bg-gray-100 dark:bg-gray-700"
        : "bg-white dark:bg-gray-800"
    }`}
  >
    <h3 className="mb-4 text-2xl font-bold text-text-light dark:text-text-dark">{name}</h3>
    <p className="mb-6 text-3xl font-bold text-primary-light dark:text-primary-dark">{price}</p>
    <ul className="mb-6">
      {features.map((feature, index) => (
        <li key={index} className="mb-2 flex items-center">
          <Check className="mr-2 text-accent-light dark:text-accent-dark" size={20} />
          <span className="text-text-light dark:text-text-dark">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      className={`btn w-full ${
        highlighted ? "btn-primary" : "btn-secondary"
      }`}
    >
      {buttonText}
    </button>
  </div>
);

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <h2 className="mb-12 text-center text-4xl font-extrabold text-text-light dark:text-text-dark">
          Pricing Plans
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <PricingTier
            name="Free Tier"
            price="$0/month"
            features={[
              "10 fast requests per month",
              "100 slow requests per month",
              "Basic task management",
            ]}
            buttonText="Get Started"
          />
          <PricingTier
            name="Pro"
            price="$19/month"
            features={[
              "500 fast requests per month",
              "Unlimited slow requests",
              "Advanced task management",
              "Priority support",
            ]}
            buttonText="Upgrade to Pro"
            highlighted={true}
          />
          <PricingTier
            name="Ultimate"
            price="$49/month"
            features={[
              "Unlimited fast requests",
              "Unlimited slow requests",
              "Advanced task management",
              "Priority support",
              "Custom integrations",
            ]}
            buttonText="Go Ultimate"
          />
        </div>
        <div className="mt-12 text-center">
          <h3 className="mb-4 text-2xl font-bold text-text-light dark:text-text-dark">Enterprise Plan</h3>
          <p className="mb-6 text-text-light-light dark:text-text-light-dark">
            Need SOC-2 & HIPAA compliance? Contact our sales team for a custom
            enterprise solution.
          </p>
          <a
            href="mailto:sales@getsidekick.so"
            className="btn btn-secondary"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
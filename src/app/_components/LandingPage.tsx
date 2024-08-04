'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ListTodo, GitBranch, Workflow, Zap, Target, Lightbulb } from 'lucide-react';

// Updated HowItWorks component with enhanced icon styling and z-index
const HowItWorks: React.FC = () => {
  const steps = [
    { icon: ListTodo, title: "Create Your Main Task", description: "Start by adding your primary goal or task." },
    { icon: GitBranch, title: "Break It Down", description: "Add subtasks to your main task, creating a hierarchical structure." },
    { icon: Workflow, title: "Build Your Journey", description: "Continue adding layers of subtasks to create a detailed sequence of events." },
  ];

  return (
    <section className="bg-background-light dark:bg-background-dark py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="mb-8 sm:mb-12 text-center text-2xl sm:text-3xl font-bold text-secondary dark:text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {steps.map((Step, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="mb-6 relative z-10">
                <Step.icon className="w-12 h-12 text-primary dark:text-primary-dark drop-shadow-lg" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-secondary dark:text-primary">{Step.title}</h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-text-light dark:text-text-light-dark">{Step.description}</p>
              <div className="text-base sm:text-lg font-bold text-primary dark:text-primary-dark">Step {index + 1}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// New Features component with enhanced icon styling
const Features: React.FC = () => {
  const features = [
    { icon: Zap, title: "Boost Productivity", description: "Break down complex tasks into manageable steps, increasing your efficiency." },
    { icon: Target, title: "Stay Focused", description: "Visualize your entire journey, helping you stay on track and motivated." },
    { icon: Lightbulb, title: "Inspire Creativity", description: "Organize your thoughts and ideas in a structured, hierarchical manner." },
  ];

  return (
    <section className="py-16 sm:py-20 bg-surface-light dark:bg-surface-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-secondary dark:text-primary text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why Choose Sidekick?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {features.map((Feature, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="mb-6 relative z-10">
                <Feature.icon className="w-12 h-12 text-primary dark:text-primary-dark drop-shadow-lg" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-secondary dark:text-primary">{Feature.title}</h3>
              <p className="text-text-light dark:text-text-light-dark">{Feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// LandingPage component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">

      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-secondary dark:text-primary text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                Welcome to Sidekick
                <span className="text-primary dark:text-primary-dark block mt-2">Your Journey Planner</span>
              </h2>
              <p className="text-text-light-light dark:text-text-light-dark text-lg sm:text-xl mb-8">
                Create detailed, hierarchical task sequences to map out your journey
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a href="#" className="btn btn-primary text-sm sm:text-base">Get Started</a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* New Features Section */}
      <Features />

      {/* CTA Section */}
      <section className="bg-primary-light dark:bg-primary-dark py-12 sm:py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Plan Your Journey?
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg md:text-xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Start using Sidekick today and transform your task management experience.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a href="#" className="btn btn-secondary text-sm sm:text-base">Get Started</a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ListTodo, GitBranch, Workflow } from 'lucide-react';

// HowItWorks component
const HowItWorks: React.FC = () => {
  const steps = [
    { icon: <ListTodo className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Create Your Main Task", description: "Start by adding your primary goal or task." },
    { icon: <GitBranch className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Break It Down", description: "Add subtasks to your main task, creating a hierarchical structure." },
    { icon: <Workflow className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Build Your Journey", description: "Continue adding layers of subtasks to create a detailed sequence of events." },
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
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="mb-3 sm:mb-4 rounded-full bg-primary dark:bg-primary-dark p-3 sm:p-4 text-white">
                {step.icon}
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-secondary dark:text-primary">{step.title}</h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-text-light dark:text-text-light-dark">{step.description}</p>
              <div className="text-base sm:text-lg font-bold text-primary dark:text-primary-dark">Step {index + 1}</div>
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

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-surface-light dark:bg-surface-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-secondary dark:text-primary text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">User Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { name: 'Alex Johnson', role: 'Project Manager', quote: 'Sidekick has revolutionized how I manage my team\'s tasks.' },
              { name: 'Sarah Lee', role: 'Freelance Designer', quote: 'As a freelancer, Sidekick has been a game-changer for my productivity.' },
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="bg-surface-light dark:bg-surface-dark p-4 sm:p-6 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <p className="text-text-light-light dark:text-text-light-dark text-sm italic mb-4">&quot;{testimonial.quote}&quot;</p>
                <p className="text-primary dark:text-primary font-semibold">{testimonial.name}</p>
                <p className="text-text-light-light dark:text-text-light-dark text-xs sm:text-sm">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary dark:bg-primary-dark py-12 sm:py-16 text-white">
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
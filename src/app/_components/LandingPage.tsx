'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SignUpButton } from '@clerk/nextjs';
import { Bot, ClipboardList, Database, MessageCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark flex flex-col">
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                Meet Your Personal Task Manager
                <span className="text-primary-light dark:text-primary-dark block mt-2">
                  Sidekick for ChatGPT
                </span>
              </h1>
              <p className="text-text-light dark:text-text-dark text-lg sm:text-xl mb-8">
                Simplify your task management within ChatGPT using Sidekick, your custom AI assistant.
              </p>
              <SignUpButton mode="modal">
                <motion.button
                  className="inline-block px-8 py-3 text-lg font-semibold text-white bg-primary-light dark:bg-primary-dark rounded-full shadow-lg hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-300 ease-in-out"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Sidekick Now
                </motion.button>
              </SignUpButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-surface-light dark:bg-surface-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-secondary-light dark:text-secondary-dark text-3xl sm:text-4xl font-bold text-center mb-12">
            What Can Sidekick Do?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ClipboardList className="w-14 h-14 text-primary-light dark:text-primary-dark mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                Create Tasks Seamlessly
              </h3>
              <p className="text-text-light dark:text-text-dark">
                Simply tag Sidekick in your ChatGPT conversations to create new tasks without leaving the chat.
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Database className="w-14 h-14 text-primary-light dark:text-primary-dark mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                Manage Your Tasks
              </h3>
              <p className="text-text-light dark:text-text-dark">
                Retrieve, update, and delete tasks easily through natural language commands in ChatGPT.
              </p>
            </motion.div>
            {/* Feature 3 */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <MessageCircle className="w-14 h-14 text-primary-light dark:text-primary-dark mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                Stay Within ChatGPT
              </h3>
              <p className="text-text-light dark:text-text-dark">
                No need to switch apps—manage your tasks directly within your ChatGPT conversations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-background-light dark:bg-background-dark py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-secondary-light dark:text-secondary-dark text-3xl sm:text-4xl font-bold text-center mb-12">
            How to Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Bot className="w-14 h-14 text-primary-light dark:text-primary-dark mb-6" />
              <h3 className="text-xl font-semibold mb-2">Add Sidekick</h3>
              <p className="text-text-light dark:text-text-dark">
                Install Sidekick from the GPT Store and enable it in your ChatGPT interface.
              </p>
            </motion.div>
            {/* Step 2 */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ClipboardList className="w-14 h-14 text-primary-light dark:text-primary-dark mb-6" />
              <h3 className="text-xl font-semibold mb-2">Create Tasks</h3>
              <p className="text-text-light dark:text-text-dark">
                Tag <strong>@Sidekick</strong> and describe your task. Sidekick will add it to your task list instantly.
              </p>
            </motion.div>
            {/* Step 3 */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Database className="w-14 h-14 text-primary-light dark:text-primary-dark mb-6" />
              <h3 className="text-xl font-semibold mb-2">Manage Tasks</h3>
              <p className="text-text-light dark:text-text-dark">
                Retrieve and update your tasks using simple commands within ChatGPT.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-surface-light dark:bg-surface-dark py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary-light dark:text-primary-dark"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Simplify Task Management Today
          </motion.h2>
          <a href="https://chatgpt.com/g/g-DMgdGagJK-sidekick" target="_blank" rel="noopener noreferrer">
            <motion.button
              className="inline-block px-8 py-3 text-lg font-semibold text-white bg-primary-light dark:bg-primary-dark rounded-full shadow-lg hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-300 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Sidekick from GPT Store
            </motion.button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-light dark:bg-background-dark py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-light dark:text-text-dark">
            Made with ❤️ | © {new Date().getFullYear()} Sidekick
          </p>
          <p className="text-sm text-text-light dark:text-text-dark mt-2">
            <a href="https://github.com/jeffskafi" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Check out my GitHub!
            </a>
          </p>
          <p className="text-sm text-text-light dark:text-text-dark mt-2">
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>{' '}
            |{' '}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
'use client';

import React, { useState, useEffect } from 'react';

export function TutorialOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem('farm-tycoon-tutorial-seen');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const steps = [
    {
      title: '🌾 Welcome to Farm Tycoon!',
      content:
        'Build and manage your own farm. Buy animals, produce resources, and earn money!',
      highlight: null,
    },
    {
      title: '💰 Buying Animals',
      content:
        'Use the "Buy Animals" section to purchase cows, chickens, pigs, and sheep. Each animal costs money and produces different resources.',
      highlight: 'buy-animals',
    },
    {
      title: '📦 Resources & Selling',
      content:
        'Animals automatically produce resources every 3 seconds. Sell them in the Resources panel to earn money!',
      highlight: 'resources',
    },
    {
      title: '🔧 Maintenance',
      content:
        'Keep your farm healthy! Repair fences and heal animals when their health gets low. Watch for warning notifications.',
      highlight: 'controls',
    },
    {
      title: '🌅 Day/Night Cycle',
      content:
        'Watch the sky change as time progresses. Your farm operates 24/7, so plan accordingly!',
      highlight: null,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('farm-tycoon-tutorial-seen', 'true');
    setIsVisible(false);
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" />

      {/* Tutorial Card */}
      <div className="fixed top-1/2 left-1/2 z-[9999] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-green-500 bg-gray-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{step.title}</h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 transition-colors hover:text-white"
            aria-label="Close tutorial"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <p className="mb-6 text-lg text-gray-300">{step.content}</p>

        {/* Progress Dots */}
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="rounded bg-gray-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>

          <span className="text-sm text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="rounded bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
          >
            {currentStep === steps.length - 1 ? "Let's Play!" : 'Next →'}
          </button>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="mt-4 w-full text-sm text-gray-400 transition-colors hover:text-white"
        >
          Skip Tutorial
        </button>
      </div>
    </>
  );
}

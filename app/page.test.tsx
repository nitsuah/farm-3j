import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(document.body).toBeTruthy();
  });

  it('has farm-related content', () => {
    render(<Home />);
    // Add more specific assertions based on your actual content
    const main = document.querySelector('main');
    expect(main).toBeTruthy();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Landing from './landing';

describe('Landing Page', () => {
  it('renders the main heading', () => {
    render(<Landing />);
    // Note: This test is very basic and depends on the current content of the landing page.
    // A more robust test might look for a specific, stable element like a data-testid.
    const heading = screen.getByRole('heading', { name: /Master Your Trading Journey/i });
    expect(heading).toBeInTheDocument();
  });
});

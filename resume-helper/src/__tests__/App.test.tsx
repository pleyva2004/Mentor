/**
 * Basic App component test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the header', () => {
    render(<App />);
    expect(screen.getByText('ResumeHelper MVP')).toBeInTheDocument();
  });

  it('renders the upload screen initially', () => {
    render(<App />);
    expect(screen.getByText('Build Your AI-Powered Resume')).toBeInTheDocument();
  });
});

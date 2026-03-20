import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from '../components/SearchBar';

// Mock timers for debounce testing
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('SearchBar', () => {
  it('should render the search input', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} placeholder="Buscar cerámicas..." />);

    const input = screen.getByPlaceholderText('Buscar cerámicas...');
    expect(input).toBeInTheDocument();
  });

  it('should have default placeholder text', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Buscar productos...');
    expect(input).toBeInTheDocument();
  });

  it('should have aria-label for accessibility', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByLabelText('Buscar productos');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch with debounce when typing', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'taza');

    // Before debounce fires
    jest.advanceTimersByTime(200);
    expect(onSearch).not.toHaveBeenCalledWith('taza');

    // After debounce fires (300ms)
    jest.advanceTimersByTime(150);
    expect(onSearch).toHaveBeenCalledWith('taza');
  });

  it('should show clear button when input has a value', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');

    // No clear button initially
    expect(screen.queryByLabelText('Limpiar búsqueda')).not.toBeInTheDocument();

    await user.type(input, 'taza');
    jest.advanceTimersByTime(300);

    // Clear button should appear
    expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
  });

  it('should clear the input when clear button is clicked', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'taza');
    jest.advanceTimersByTime(300);

    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    await user.click(clearButton);
    jest.advanceTimersByTime(300);

    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('should debounce multiple rapid keystrokes and only call once', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');

    await user.type(input, 't');
    jest.advanceTimersByTime(100);
    await user.type(input, 'a');
    jest.advanceTimersByTime(100);
    await user.type(input, 'z');
    jest.advanceTimersByTime(100);
    await user.type(input, 'a');

    // Only fire after last keystroke's debounce window
    jest.advanceTimersByTime(300);

    // Should have been called with final value
    const lastCall = onSearch.mock.calls[onSearch.mock.calls.length - 1];
    expect(lastCall[0]).toBe('taza');
  });
});

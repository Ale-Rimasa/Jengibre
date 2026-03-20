import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CategoryFilter from '../components/CategoryFilter';
import { Category } from '../types';

const EXPECTED_CATEGORIES = [
  { label: 'Todas', value: 'todas' },
  { label: 'Tazas', value: 'tazas' },
  { label: 'Platos', value: 'platos' },
  { label: 'Decoración', value: 'decoracion' },
  { label: 'Bowls', value: 'bowls' },
  { label: 'Jarrones', value: 'jarrones' },
  { label: 'Sets', value: 'set_vajilla' },
];

describe('CategoryFilter', () => {
  it('should render all categories', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    EXPECTED_CATEGORIES.forEach((cat) => {
      expect(screen.getByText(cat.label)).toBeInTheDocument();
    });
  });

  it('should render the correct number of category buttons', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(EXPECTED_CATEGORIES.length);
  });

  it('should call onCategoryChange when a category is clicked', async () => {
    const onCategoryChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    await user.click(screen.getByText('Tazas'));

    expect(onCategoryChange).toHaveBeenCalledTimes(1);
    expect(onCategoryChange).toHaveBeenCalledWith('tazas');
  });

  it('should call onCategoryChange with the correct category value', async () => {
    const onCategoryChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    await user.click(screen.getByText('Bowls'));
    expect(onCategoryChange).toHaveBeenCalledWith('bowls');

    await user.click(screen.getByText('Jarrones'));
    expect(onCategoryChange).toHaveBeenCalledWith('jarrones');

    await user.click(screen.getByText('Sets'));
    expect(onCategoryChange).toHaveBeenCalledWith('set_vajilla');
  });

  it('should show active state for the selected category', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilter selected="tazas" onCategoryChange={onCategoryChange} />
    );

    const tazasButton = screen.getByText('Tazas');
    // aria-pressed should be true for active category
    expect(tazasButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show inactive state for non-selected categories', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilter selected="tazas" onCategoryChange={onCategoryChange} />
    );

    const todasButton = screen.getByText('Todas');
    const bowlsButton = screen.getByText('Bowls');

    expect(todasButton).toHaveAttribute('aria-pressed', 'false');
    expect(bowlsButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show "Todas" as selected by default when selected="todas"', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    const todasButton = screen.getByText('Todas');
    expect(todasButton).toHaveAttribute('aria-pressed', 'true');

    // All others should be inactive
    screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent !== 'Todas')
      .forEach((btn) => {
        expect(btn).toHaveAttribute('aria-pressed', 'false');
      });
  });

  it('should have accessible group label', () => {
    const onCategoryChange = jest.fn();
    render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    expect(
      screen.getByRole('group', { name: 'Filtrar por categoría' })
    ).toBeInTheDocument();
  });

  it('should update active state when different category is selected', () => {
    const onCategoryChange = jest.fn();
    const { rerender } = render(
      <CategoryFilter selected="todas" onCategoryChange={onCategoryChange} />
    );

    // Initially "Todas" is active
    expect(screen.getByText('Todas')).toHaveAttribute('aria-pressed', 'true');

    // Rerender with different selection
    rerender(
      <CategoryFilter selected="platos" onCategoryChange={onCategoryChange} />
    );

    expect(screen.getByText('Todas')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Platos')).toHaveAttribute('aria-pressed', 'true');
  });
});

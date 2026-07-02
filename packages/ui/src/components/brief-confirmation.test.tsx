import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BriefConfirmation, BriefField } from './brief-confirmation';
import { Button } from './button';

describe('BriefConfirmation', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    render(
      <BriefConfirmation
        title="Test Title"
        description="Test Description"
        actions={<Button>Confirm</Button>}
      >
        <BriefField label="Destination" value="Portugal" />
        <BriefField label="Duration" value="7 days" />
      </BriefConfirmation>
    );

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
    expect(screen.getByText('Destination')).toBeDefined();
    expect(screen.getByText('Portugal')).toBeDefined();
    expect(screen.getByText('Duration')).toBeDefined();
    expect(screen.getByText('7 days')).toBeDefined();
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDefined();
  });

  it('renders "Not specified" if value is falsy', () => {
    render(<BriefField label="Pace" value={null} />);
    expect(screen.getByText('Not specified')).toBeDefined();
  });

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(<BriefField label="Budget" value="Premium" onEdit={handleEdit} />);
    
    const editBtn = screen.getByRole('button', { name: /Edit Budget/i });
    expect(editBtn).toBeDefined();
    
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalled();
  });
});

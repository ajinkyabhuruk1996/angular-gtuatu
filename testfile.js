import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import YaraDefinition from './YaraDefinition';

const mockHandleDefinitionChange = jest.fn();
const mockRemoveDefinition = jest.fn();

const defaultProps = {
  defId: 'test1',
  definition: {
    name: 'testName',
    value: 'testValue',
    modifiers: ['ascii'],
  },
  errors: {},
  readOnly: false,
  handleDefinitionChange: mockHandleDefinitionChange,
  removeDefinition: mockRemoveDefinition,
};

describe('YaraDefinition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input fields with correct values', () => {
    render(<YaraDefinition {...defaultProps} />);

    expect(screen.getByDisplayValue('testName')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testValue')).toBeInTheDocument();
    expect(screen.getByText('ascii')).toBeInTheDocument();
  });

  it('calls handleDefinitionChange when name changes', () => {
    render(<YaraDefinition {...defaultProps} />);

    fireEvent.change(screen.getByDisplayValue('testName'), {
      target: { value: 'newName' },
    });

    expect(mockHandleDefinitionChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: { value: 'newName' } }),
      'test1',
      'name'
    );
  });

  it('calls handleDefinitionChange when value changes', () => {
    render(<YaraDefinition {...defaultProps} />);

    fireEvent.change(screen.getByDisplayValue('testValue'), {
      target: { value: 'newValue' },
    });

    expect(mockHandleDefinitionChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: { value: 'newValue' } }),
      'test1',
      'value'
    );
  });

  it('renders all modifier options', () => {
    render(<YaraDefinition {...defaultProps} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: /ascii/i }));

    ['ascii', 'fullword', 'rd', 'nocase', 'wide'].forEach((mod) => {
      expect(screen.getByText(mod)).toBeInTheDocument();
    });
  });

  it('calls removeDefinition on delete button click', () => {
    render(<YaraDefinition {...defaultProps} />);
    const deleteBtn = screen.getByRole('button');

    fireEvent.click(deleteBtn);

    expect(mockRemoveDefinition).toHaveBeenCalled();
  });

  it('disables inputs when readOnly is true', () => {
    render(<YaraDefinition {...defaultProps} readOnly={true} />);

    const nameInput = screen.getByDisplayValue('testName');
    expect(nameInput).toBeDisabled();

    const deleteBtn = screen.getByRole('button');
    expect(deleteBtn).toBeDisabled();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children
}));

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body styles
    document.body.style.overflow = '';
  });

  // 기본 렌더링 테스트
  it('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders children content correctly', () => {
    const complexContent = (
      <div>
        <h2>Modal Title</h2>
        <p>Modal description</p>
        <button>Action Button</button>
      </div>
    );

    render(<Modal {...defaultProps}>{complexContent}</Modal>);
    
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Modal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('focuses the modal when opened', () => {
      render(<Modal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('supports additional ARIA attributes', () => {
      render(
        <Modal {...defaultProps}>
          <div
            role="document"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <h2 id="modal-title">Title</h2>
            <p id="modal-description">Description</p>
          </div>
        </Modal>
      );

      expect(screen.getByRole('document')).toBeInTheDocument();
      expect(screen.getByRole('document')).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByRole('document')).toHaveAttribute('aria-describedby', 'modal-description');
    });
  });

  // 닫기 기능 테스트
  describe('closing functionality', () => {
    it('calls onClose when overlay is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={handleClose} />);
      
      const overlay = screen.getByRole('dialog');
      await user.click(overlay);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={handleClose} />);
      
      const content = screen.getByText('Modal Content');
      await user.click(content);
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={handleClose} />);
      
      await user.keyboard('{Escape}');
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on other key presses', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={handleClose} />);
      
      await user.keyboard('{Enter}');
      await user.keyboard('{Space}');
      await user.keyboard('a');
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('handles multiple escape key presses', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={handleClose} />);
      
      await user.keyboard('{Escape}');
      await user.keyboard('{Escape}');
      
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });

  // Body scroll 관리 테스트
  describe('body scroll management', () => {
    it('prevents body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('handles rapid open/close cycles', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);
      
      // Open
      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      // Close
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
      
      // Open again
      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  // 이벤트 리스너 관리 테스트
  describe('event listener management', () => {
    it('adds keydown event listener when opened', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      render(<Modal {...defaultProps} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('removes event listener when closed', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { rerender } = render(<Modal {...defaultProps} />);
      rerender(<Modal {...defaultProps} isOpen={false} />);
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<Modal {...defaultProps} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('updates event listener when onClose changes', () => {
      const firstHandler = jest.fn();
      const secondHandler = jest.fn();
      
      const { rerender } = render(<Modal {...defaultProps} onClose={firstHandler} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(firstHandler).toHaveBeenCalledTimes(1);
      expect(secondHandler).not.toHaveBeenCalled();
      
      rerender(<Modal {...defaultProps} onClose={secondHandler} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(firstHandler).toHaveBeenCalledTimes(1); // Still only called once
      expect(secondHandler).toHaveBeenCalledTimes(1);
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies default classes', () => {
      render(<Modal {...defaultProps} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass(
        'fixed',
        'inset-0',
        'bg-black/80',
        'backdrop-blur-sm',
        'flex',
        'items-center',
        'justify-center',
        'z-50',
        'p-6'
      );
    });

    it('applies custom overlay className', () => {
      render(<Modal {...defaultProps} overlayClassName="custom-overlay-class" />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('custom-overlay-class');
    });

    it('applies custom modal className', () => {
      render(<Modal {...defaultProps} className="custom-modal-class" />);
      
      const content = screen.getByText('Modal Content').parentElement;
      expect(content).toHaveClass('custom-modal-class');
    });

    it('merges custom classes with default classes', () => {
      render(
        <Modal 
          {...defaultProps} 
          className="custom-content-class"
          overlayClassName="custom-overlay-class"
        />
      );
      
      const overlay = screen.getByRole('dialog');
      const content = screen.getByText('Modal Content').parentElement;
      
      expect(overlay).toHaveClass('custom-overlay-class', 'fixed', 'inset-0');
      expect(content).toHaveClass('custom-content-class', 'bg-card', 'border');
    });

    it('applies animation classes', () => {
      render(<Modal {...defaultProps} />);
      
      const overlay = screen.getByRole('dialog');
      const content = screen.getByText('Modal Content').parentElement;
      
      expect(overlay).toHaveClass('animate-[fadeIn_0.2s_ease-out]');
      expect(content).toHaveClass('animate-[fadeIn_0.2s_ease-out]');
    });

    it('applies responsive sizing classes', () => {
      render(<Modal {...defaultProps} />);
      
      const content = screen.getByText('Modal Content').parentElement;
      expect(content).toHaveClass(
        'max-w-2xl',
        'w-full',
        'max-h-[80vh]',
        'overflow-auto'
      );
    });
  });

  // Portal 동작 테스트
  describe('portal behavior', () => {
    it('renders modal content in document.body', () => {
      render(<Modal {...defaultProps} />);
      
      // Modal should be in the document
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render portal content when closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles portal creation and destruction', () => {
      const { rerender, unmount } = render(<Modal {...defaultProps} isOpen={false} />);
      
      // Not rendered initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Render when opened
      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Remove when closed
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Clean up on unmount
      unmount();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // 복합 상호작용 테스트
  describe('complex interactions', () => {
    it('handles click and keyboard interactions together', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={handleClose} />);
      
      // Click overlay to close
      await user.click(screen.getByRole('dialog'));
      expect(handleClose).toHaveBeenCalledTimes(1);
      
      // Press Escape to close
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it('prevents event bubbling on content click', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(
        <Modal {...defaultProps} onClose={handleClose}>
          <div>
            <button>Inner Button</button>
            <input placeholder="Inner Input" />
          </div>
        </Modal>
      );
      
      // Click on inner elements should not close modal
      await user.click(screen.getByRole('button', { name: 'Inner Button' }));
      await user.click(screen.getByPlaceholderText('Inner Input'));
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('handles focus management within modal', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal {...defaultProps}>
          <div>
            <h2>Modal Title</h2>
            <input placeholder="First Input" />
            <input placeholder="Second Input" />
            <button>Close</button>
          </div>
        </Modal>
      );
      
      const firstInput = screen.getByPlaceholderText('First Input');
      const secondInput = screen.getByPlaceholderText('Second Input');
      const closeButton = screen.getByRole('button', { name: 'Close' });
      
      // Tab navigation within modal
      await user.tab();
      expect(firstInput).toHaveFocus();
      
      await user.tab();
      expect(secondInput).toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('handles onClose being undefined', () => {
      expect(() => {
        render(<Modal isOpen={true} onClose={undefined as any}>Content</Modal>);
      }).not.toThrow();
    });

    it('handles children being null', () => {
      expect(() => {
        render(<Modal {...defaultProps}>{null}</Modal>);
      }).not.toThrow();
    });

    it('handles empty children', () => {
      render(<Modal {...defaultProps}>{''}</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles rapid state changes', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);
      
      // Rapidly toggle state
      for (let i = 0; i < 10; i++) {
        rerender(<Modal {...defaultProps} isOpen={i % 2 === 0} />);
      }
      
      // Should end up closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });

    it('handles multiple modals', () => {
      render(
        <div>
          <Modal isOpen={true} onClose={jest.fn()}>
            <div>First Modal</div>
          </Modal>
          <Modal isOpen={true} onClose={jest.fn()}>
            <div>Second Modal</div>
          </Modal>
        </div>
      );
      
      expect(screen.getByText('First Modal')).toBeInTheDocument();
      expect(screen.getByText('Second Modal')).toBeInTheDocument();
      expect(screen.getAllByRole('dialog')).toHaveLength(2);
    });
  });

  // 실제 사용 사례 테스트
  describe('real-world usage', () => {
    it('works as confirmation dialog', async () => {
      const user = userEvent.setup();
      const handleConfirm = jest.fn();
      const handleCancel = jest.fn();
      
      render(
        <Modal {...defaultProps} onClose={handleCancel}>
          <div>
            <h2>Confirm Action</h2>
            <p>Are you sure you want to continue?</p>
            <button onClick={handleConfirm}>Confirm</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </Modal>
      );
      
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(handleConfirm).toHaveBeenCalled();
      
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleCancel).toHaveBeenCalled();
    });

    it('works as form modal', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <Modal {...defaultProps}>
          <form onSubmit={handleSubmit}>
            <h2>Create Item</h2>
            <input name="name" placeholder="Item name" />
            <textarea name="description" placeholder="Description"></textarea>
            <button type="submit">Create</button>
          </form>
        </Modal>
      );
      
      await user.type(screen.getByPlaceholderText('Item name'), 'Test Item');
      await user.type(screen.getByPlaceholderText('Description'), 'Test Description');
      await user.click(screen.getByRole('button', { name: 'Create' }));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('works as image/content viewer', () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <img src="/test-image.jpg" alt="Test Image" />
            <h3>Image Title</h3>
            <p>Image description and details</p>
          </div>
        </Modal>
      );
      
      expect(screen.getByRole('img', { name: 'Test Image' })).toBeInTheDocument();
      expect(screen.getByText('Image Title')).toBeInTheDocument();
    });
  });
});
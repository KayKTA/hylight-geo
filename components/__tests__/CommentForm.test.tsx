import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentForm from '../CommentForm';

describe('CommentForm', () => {
    it('should render input and submit button', () => {
        render(<CommentForm onSubmit={vi.fn()} />);

        expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should disable submit button when input is empty', () => {
        render(<CommentForm onSubmit={vi.fn()} />);

        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has text', async () => {
        const user = userEvent.setup();
        render(<CommentForm onSubmit={vi.fn()} />);

        const input = screen.getByPlaceholderText('Add a note...');
        const submitButton = screen.getByRole('button');

        await user.type(input, 'Test comment');

        expect(submitButton).not.toBeDisabled();
    });

    it('should call onSubmit with trimmed content', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn(() => Promise.resolve());
        render(<CommentForm onSubmit={onSubmit} />);

        const input = screen.getByPlaceholderText('Add a note...');
        const submitButton = screen.getByRole('button');

        await user.type(input, '  Test comment with spaces  ');
        await user.click(submitButton);

        await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Test comment with spaces');
        expect(onSubmit).toHaveBeenCalledTimes(1);
        });
    });

    it('should clear input after successful submit', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn(() => Promise.resolve());
        render(<CommentForm onSubmit={onSubmit} />);

        const input = screen.getByPlaceholderText('Add a note...') as HTMLInputElement;
        const submitButton = screen.getByRole('button');

        await user.type(input, 'Test comment');

        expect(input.value).toBe('Test comment');

        await user.click(submitButton);

        await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Test comment');
        expect(input.value).toBe('');
        });
    });

    it('should submit on Enter key press', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn(() => Promise.resolve());
        render(<CommentForm onSubmit={onSubmit} />);

        const input = screen.getByPlaceholderText('Add a note...');

        await user.type(input, 'Test comment');
        await user.keyboard('{Enter}');

        await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Test comment');
        });
    });

    it('should disable input and button during submission', async () => {
        const user = userEvent.setup();
        let resolveSubmit: () => void;
        const onSubmit = vi.fn(
        () =>
            new Promise<void>((resolve) => {
            resolveSubmit = resolve;
            })
        );

        render(<CommentForm onSubmit={onSubmit} />);

        const input = screen.getByPlaceholderText('Add a note...') as HTMLInputElement;
        const submitButton = screen.getByRole('button');

        await user.type(input, 'Test comment');
        await user.click(submitButton);

        // Should be disabled during submission
        expect(input).toBeDisabled();
        expect(submitButton).toBeDisabled();

        // Resolve the promise
        resolveSubmit!();

        await waitFor(() => {
        expect(input).not.toBeDisabled();
        expect(submitButton).toBeDisabled(); // Disabled because input is now empty
        });
    });

    it('should handle submission errors gracefully', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn(() => Promise.reject(new Error('Network error')));
        render(<CommentForm onSubmit={onSubmit} />);

        const input = screen.getByPlaceholderText('Add a note...');
        const submitButton = screen.getByRole('button');

        await user.type(input, 'Test comment');
        await user.click(submitButton);

        await waitFor(() => {
        // Input should not be cleared on error
        expect((input as HTMLInputElement).value).toBe('Test comment');
        });
    });

    //   it('should not submit whitespace-only content', async () => {
    //     const user = userEvent.setup();
    //     const onSubmit = vi.fn(() => Promise.resolve());
    //     render(<CommentForm onSubmit={onSubmit} />);

    //     const input = screen.getByPlaceholderText('Add a note...');
    //     const submitButton = screen.getByRole('button');

    //     await user.type(input, '   ');

    //     expect(submitButton).toBeDisabled();

    //     await user.click(submitButton);

    //     expect(onSubmit).not.toHaveBeenCalled();
    //   });

    it("should not submit whitespace-only content", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<CommentForm onSubmit={onSubmit} />);

        const input = screen.getByPlaceholderText(/add a note/i);
        const submit = screen.getByRole("button", { name: /post/i });

        await user.type(input, "   ");

        await waitFor(() => expect(submit).toBeDisabled());
        expect(onSubmit).not.toHaveBeenCalled(); // nothing triggered
    });

    it('should respect disabled prop', () => {
        render(<CommentForm onSubmit={vi.fn()} disabled />);

        const input = screen.getByPlaceholderText('Add a note...');
        const submitButton = screen.getByRole('button');

        expect(input).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPhotoComments, addComment, deleteComment, getCommentCount } from '../comments';

type MockSupabaseClient = {
  from: ReturnType<typeof vi.fn>;
};

describe('Comments API', () => {
    let mockSupabase: MockSupabaseClient;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPhotoComments', () => {
        it('should return comments for a photo', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                order: vi.fn(() =>
                    Promise.resolve({
                    data: [
                        {
                        id: 'comment-1',
                        photo_id: 'photo-123',
                        user_id: 'user-123',
                        content: 'Great photo!',
                        created_at: '2024-01-01T00:00:00Z',
                        },
                        {
                        id: 'comment-2',
                        photo_id: 'photo-123',
                        user_id: 'user-123',
                        content: 'Amazing view',
                        created_at: '2024-01-02T00:00:00Z',
                        },
                    ],
                    error: null,
                    })
                ),
                })),
            })),
            })),
        };

        const result = await getPhotoComments(mockSupabase as any, 'photo-123');

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0]).toMatchObject({
            id: 'comment-1',
            content: 'Great photo!',
        });
        });

        it('should return empty array when no comments exist', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                order: vi.fn(() =>
                    Promise.resolve({
                    data: [],
                    error: null,
                    })
                ),
                })),
            })),
            })),
        };

        const result = await getPhotoComments(mockSupabase as any, 'photo-123');

        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
        });

        it('should handle database errors', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                order: vi.fn(() =>
                    Promise.resolve({
                    data: null,
                    error: { message: 'Database error' },
                    })
                ),
                })),
            })),
            })),
        };

        const result = await getPhotoComments(mockSupabase as any, 'photo-123');

        expect(result.error).toBe('Database error');
        expect(result.data).toBeNull();
        });
    });

    describe('addComment', () => {
        it('should add a comment successfully', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                single: vi.fn(() =>
                    Promise.resolve({
                    data: {
                        id: 'new-comment-1',
                        photo_id: 'photo-123',
                        user_id: 'user-123',
                        content: 'New comment',
                        created_at: '2024-01-15T12:00:00Z',
                    },
                    error: null,
                    })
                ),
                })),
            })),
            })),
        };

        const result = await addComment(mockSupabase as any, {
            photoId: 'photo-123',
            userId: 'user-123',
            content: 'New comment',
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
            id: 'new-comment-1',
            content: 'New comment',
        });
        });

        it('should trim whitespace from content', async () => {
        const insertMock = vi.fn(() => ({
            select: vi.fn(() => ({
            single: vi.fn(() =>
                Promise.resolve({
                data: {
                    id: 'new-comment-1',
                    content: 'Trimmed content',
                },
                error: null,
                })
            ),
            })),
        }));

        mockSupabase = {
            from: vi.fn(() => ({
            insert: insertMock,
            })),
        };

        await addComment(mockSupabase as any, {
            photoId: 'photo-123',
            userId: 'user-123',
            content: '  Trimmed content  ',
        });

        // Check that insert was called with trimmed content
        expect(insertMock).toHaveBeenCalledWith({
            photo_id: 'photo-123',
            user_id: 'user-123',
            content: 'Trimmed content',
        });
        });

        it('should handle insertion errors', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                single: vi.fn(() =>
                    Promise.resolve({
                    data: null,
                    error: { message: 'Insertion failed' },
                    })
                ),
                })),
            })),
            })),
        };

        const result = await addComment(mockSupabase as any, {
            photoId: 'photo-123',
            userId: 'user-123',
            content: 'New comment',
        });

        expect(result.error).toBe('Insertion failed');
        expect(result.data).toBeNull();
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment successfully', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            delete: vi.fn(() => ({
                eq: vi.fn((field, value) => {
                // Return the chain for the second eq call
                if (field === 'id') {
                    return {
                    eq: vi.fn(() => Promise.resolve({ error: null }))
                    };
                }
                return Promise.resolve({ error: null });
                }),
            })),
            })),
        };

        const result = await deleteComment(mockSupabase as any, 'comment-123', 'user-123');

        expect(result.error).toBeNull();
        });

        it('should enforce user ownership when deleting', async () => {
        const firstEqMock = vi.fn(() => Promise.resolve({ error: null }));
        const secondEqMock = vi.fn((field, value) => ({
            eq: firstEqMock,
        }));

        mockSupabase = {
            from: vi.fn(() => ({
            delete: vi.fn(() => ({
                eq: secondEqMock,
            })),
            })),
        };

        await deleteComment(mockSupabase as any, 'comment-123', 'user-123');

        // Should call eq for both id and user_id
        expect(secondEqMock).toHaveBeenCalledWith('id', 'comment-123');
        expect(firstEqMock).toHaveBeenCalledWith('user_id', 'user-123');
        });

        it('should handle deletion errors', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            delete: vi.fn(() => ({
                eq: vi.fn(() => ({
                eq: vi.fn(() =>
                    Promise.resolve({
                    error: { message: 'Deletion failed' },
                    })
                ),
                })),
            })),
            })),
        };

        const result = await deleteComment(mockSupabase as any, 'comment-123', 'user-123');

        expect(result.error).toBe('Deletion failed');
        expect(result.data).toBeNull();
        });
    });

    describe('getCommentCount', () => {
        it('should return comment count for a photo', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() =>
                Promise.resolve({
                    count: 5,
                    error: null,
                })
                ),
            })),
            })),
        };

        const result = await getCommentCount(mockSupabase as any, 'photo-123');

        expect(result.error).toBeNull();
        expect(result.data).toBe(5);
        });

        it('should return 0 when no comments exist', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() =>
                Promise.resolve({
                    count: 0,
                    error: null,
                })
                ),
            })),
            })),
        };

        const result = await getCommentCount(mockSupabase as any, 'photo-123');

        expect(result.error).toBeNull();
        expect(result.data).toBe(0);
        });

        it('should handle null count', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() =>
                Promise.resolve({
                    count: null,
                    error: null,
                })
                ),
            })),
            })),
        };

        const result = await getCommentCount(mockSupabase as any, 'photo-123');

        expect(result.error).toBeNull();
        expect(result.data).toBe(0);
        });

        it('should handle errors', async () => {
        mockSupabase = {
            from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() =>
                Promise.resolve({
                    count: null,
                    error: { message: 'Count failed' },
                })
                ),
            })),
            })),
        };

        const result = await getCommentCount(mockSupabase as any, 'photo-123');

        expect(result.error).toBe('Count failed');
        expect(result.data).toBeNull();
        });
    });
});

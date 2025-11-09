import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserPhotos, uploadPhoto, deletePhoto } from '../photos';

// Mock Supabase client type
type MockSupabaseClient = {
  from: ReturnType<typeof vi.fn>;
  storage: {
    from: ReturnType<typeof vi.fn>;
  };
};

describe('Photos API', () => {
    let mockSupabase: MockSupabaseClient;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserPhotos', () => {
        it('should return photos with signed URLs', async () => {
            mockSupabase = {
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        order: vi.fn(() =>
                            Promise.resolve({
                                data: [
                                {
                                    id: 'photo-1',
                                    path: 'user-123/photo.jpg',
                                    lat: 48.8566,
                                    lon: 2.3522,
                                    title: 'Test Photo',
                                    created_at: '2024-01-01T00:00:00Z',
                                },
                                ],
                                error: null,
                            })
                        ),
                    })),
                })),
                storage: {
                from: vi.fn(() => ({
                    createSignedUrl: vi.fn(() =>
                    Promise.resolve({
                        data: { signedUrl: 'https://storage.supabase.co/signed-url' },
                        error: null,
                    })
                    ),
                })),
                },
            };

            const result = await getUserPhotos(mockSupabase as any);

            expect(result.error).toBeNull();
            expect(result.data).toHaveLength(1);
            expect(result.data?.[0]).toMatchObject({
                id: 'photo-1',
                lat: 48.8566,
                lon: 2.3522,
                title: 'Test Photo',
                imageUrl: 'https://storage.supabase.co/signed-url',
            });
        });

        it('should handle database errors', async () => {
            mockSupabase = {
                from: vi.fn(() => ({
                select: vi.fn(() => ({
                    order: vi.fn(() =>
                    Promise.resolve({
                        data: null,
                        error: { message: 'Database connection failed' },
                    })
                    ),
                })),
                })),
                storage: {
                from: vi.fn(),
                },
            };

            const result = await getUserPhotos(mockSupabase as any);

            expect(result.error).toBe('Database connection failed');
            expect(result.data).toBeNull();
        });

        it('should handle empty photo list', async () => {
            mockSupabase = {
                from: vi.fn(() => ({
                select: vi.fn(() => ({
                    order: vi.fn(() =>
                    Promise.resolve({
                        data: [],
                        error: null,
                    })
                    ),
                })),
                })),
                storage: {
                from: vi.fn(),
                },
            };

            const result = await getUserPhotos(mockSupabase as any);

            expect(result.error).toBeNull();
            expect(result.data).toEqual([]);
        });

        it('should handle signed URL generation failure', async () => {
            mockSupabase = {
                from: vi.fn(() => ({
                select: vi.fn(() => ({
                    order: vi.fn(() =>
                    Promise.resolve({
                        data: [{ id: 'photo-1', path: 'user/photo.jpg', lat: 0, lon: 0 }],
                        error: null,
                    })
                    ),
                })),
                })),
                storage: {
                from: vi.fn(() => ({
                    createSignedUrl: vi.fn(() =>
                    Promise.resolve({
                        data: null,
                        error: { message: 'Storage error' },
                    })
                    ),
                })),
                },
            };

            const result = await getUserPhotos(mockSupabase as any);

            // Should still return photos but with empty imageUrl
            expect(result.error).toBeNull();
            expect(result.data?.[0].imageUrl).toBe('');
        });
    });

    describe('uploadPhoto', () => {
        it('should upload photo successfully', async () => {
            const mockFile = new File(['photo content'], 'test.jpg', {
                type: 'image/jpeg',
            });

            mockSupabase = {
                from: vi.fn(() => ({
                insert: vi.fn(() => ({
                    select: vi.fn(() => ({
                    single: vi.fn(() =>
                        Promise.resolve({
                        data: {
                            id: 'new-photo-1',
                            path: 'user-123/test.jpg',
                            lat: 48.8566,
                            lon: 2.3522,
                        },
                        error: null,
                        })
                    ),
                    })),
                })),
                })),
                storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(() =>
                    Promise.resolve({
                        error: null,
                    })
                    ),
                    getPublicUrl: vi.fn(() => ({
                    data: { publicUrl: 'https://storage.url/photo.jpg' },
                    })),
                })),
                },
            };

            const result = await uploadPhoto(mockSupabase as any, {
                userId: 'user-123',
                file: mockFile,
                lat: 48.8566,
                lon: 2.3522,
                title: 'Test Upload',
            });

            expect(result.error).toBeNull();
            expect(result.data).toMatchObject({
                id: 'new-photo-1',
                lat: 48.8566,
                lon: 2.3522,
            });
        });

        it('should rollback storage upload if database insert fails', async () => {
            const mockFile = new File(['photo content'], 'test.jpg', {
                type: 'image/jpeg',
            });

            const removeMock = vi.fn(() => Promise.resolve({ error: null }));

            mockSupabase = {
                from: vi.fn(() => ({
                insert: vi.fn(() => ({
                    select: vi.fn(() => ({
                    single: vi.fn(() =>
                        Promise.resolve({
                        data: null,
                        error: { message: 'Database insert failed' },
                        })
                    ),
                    })),
                })),
                })),
                storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(() => Promise.resolve({ error: null })),
                    remove: removeMock,
                })),
                },
            };

            const result = await uploadPhoto(mockSupabase as any, {
                userId: 'user-123',
                file: mockFile,
                lat: 48.8566,
                lon: 2.3522,
            });

            // Should have called remove to rollback
            expect(removeMock).toHaveBeenCalled();
            expect(result.error).toBe('Database insert failed');
            expect(result.data).toBeNull();
        });

        it('should handle storage upload failure', async () => {
            const mockFile = new File(['photo content'], 'test.jpg', {
                type: 'image/jpeg',
            });

            mockSupabase = {
                from: vi.fn(),
                storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(() =>
                    Promise.resolve({
                        error: { message: 'Storage quota exceeded' },
                    })
                    ),
                })),
                },
            };

            const result = await uploadPhoto(mockSupabase as any, {
                userId: 'user-123',
                file: mockFile,
                lat: 48.8566,
                lon: 2.3522,
            });

            expect(result.error).toBe('Storage quota exceeded');
            expect(result.data).toBeNull();
        });
    });

});

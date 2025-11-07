"use client";

import { useMemo, useState } from "react";
import {
    Box,
    Container,
    Paper,
    Stack,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
} from "@mui/material";
import { createBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
    const supabase = useMemo(() => createBrowserClient(), []);
    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [info, setInfo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const disabled = pending || !/^\S+@\S+\.\S+$/.test(email);

    const handleMagicLink = async () => {

        setError(null);
        setInfo(null);
        setPending(true);

        try {
            const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: redirectTo,
                },
            });

            if (error) throw error;
            setInfo(
                "A magic link has just been sent. Open your email and click the link to sign in."
            );
            setEmail("");
        } catch (e: any) {
            setError(e?.message ?? "Unable to send the link. Please try again.");
        } finally {
            setPending(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100dvh",
                display: "grid",
                placeItems: "center",
            }}
        >
            <Container maxWidth="sm" sx={{ px: 2 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                    }}
                >
                    <Stack spacing={3}>
                        {/* Header / Branding */}
                        <Stack spacing={0.5} textAlign="center">
                            <Typography variant="h4" fontWeight={800}>
                                Login
                            </Typography>
                            <Typography color="text.secondary">
                                Access your account to upload geolocated photos.
                            </Typography>
                        </Stack>

                        {/* Alerts */}
                        {info && <Alert severity="success">{info}</Alert>}
                        {error && <Alert severity="error">{error}</Alert>}

                        {/* Email form */}
                        <Stack spacing={2}>
                            <TextField
                                type="email"
                                label="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                autoFocus
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleMagicLink}
                                disabled={disabled}
                                sx={{ height: 44 }}
                            >
                                {pending ? (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CircularProgress size={20} />
                                        <span>Sending link…</span>
                                    </Stack>
                                ) : (
                                    "Send magic link"
                                )}
                            </Button>
                        </Stack>

                        {/* Footer help */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                        >
                            By clicking, you'll receive a secure link by email. No password to remember.
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

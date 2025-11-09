"use client";

import { useEffect, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Menu,
    MenuItem,
    IconButton,
} from "@mui/material";
import { MapPin, LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const supabase = createBrowserSupabaseClient();
    const router = useRouter();

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email || null);
        });

        // Listen to auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUserEmail(session?.user?.email || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        handleMenuClose();
        router.push("/login");
    };

    const getInitials = (email: string) => {
        return email.charAt(0).toUpperCase();
    };

    return (
        <AppBar position="static" elevation={1}>
            <Toolbar>
                {/* Logo / Title */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
                    <MapPin size={24} />
                    <Typography variant="h6" fontWeight={700}>
                        GeoPhotos
                    </Typography>
                </Box>

                {/* User menu or login button */}
                {userEmail ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ display: { xs: "none", sm: "block" } }}
                        >
                            {userEmail}
                        </Typography>
                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            sx={{ ml: 1 }}
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: "primary.dark",
                                    fontSize: "0.875rem",
                                }}
                            >
                                {getInitials(userEmail)}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">
                                    {userEmail}
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <LogOut size={16} />
                                    Logout
                                </Box>
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Button color="inherit" variant="outlined" href="/login">
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

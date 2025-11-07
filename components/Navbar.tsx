"use client"
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from '@mui/material'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { LogOut, MapPin } from 'lucide-react'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const supabase = createBrowserSupabaseClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }: any) => {
            setUser(user)
        })

        // Écouter les changements
        // const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        //   setUser(session?.user ?? null)
        // })

        // return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const getInitials = (email: string) => {
        return email.charAt(0).toUpperCase()
    }

    return (
        <AppBar position="sticky" elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin size={24} />
                    <Typography variant="h6" fontWeight={700}>
                        GeoPhotos
                    </Typography>
                </Box>

                {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                        label="Connected"
                        color="success"
                        size="small"
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* <Typography
                            variant="body2"
                            sx={{ display: { xs: 'none', md: 'block' } }}
                        >
                            {user.email}
                        </Typography> */}

                        <Button
                            onClick={handleMenuOpen}
                            sx={{
                                minWidth: 'auto',
                                p: 0.5,
                                borderRadius: '50%'
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'primary.dark',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {user.email && getInitials(user.email)}
                            </Avatar>
                        </Button>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                            {user.email}
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
                            <LogOut size={16} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
                ) : (
                <Button
                    color="inherit"
                    href="/login"
                    variant="outlined"
                >
                    Login
                </Button>
                )}
            </Toolbar>
        </AppBar>
    )
}

"use client";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import Link from "next/link";

export default function AppBarNav() {
    return (
        <AppBar position="static">
            <Toolbar sx={{ gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Button component={Link} href="/" color="inherit">Map</Button>
                    <Button component={Link} href="/upload" color="inherit">Upload</Button>
                </Box>
                <Button component={Link} href="/login" color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    );
}

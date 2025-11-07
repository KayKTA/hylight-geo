"use client";
import { useState } from "react";
import { Container, TextField, Button, Stack, Typography } from "@mui/material";

export default function LoginPage() {
    const [email, setEmail] = useState("");

    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h5" mb={2}>Sign in</Typography>
            <Stack direction="row" spacing={2}>
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value) } />
                <Button variant="contained" >Login</Button>
            </Stack>
        </Container>
    );
}

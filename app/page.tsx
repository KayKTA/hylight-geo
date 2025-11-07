import { Container, Stack, Typography, Button } from "@mui/material";
import AppBarNav from "@/components/AppBarNav";

export default function HomePage() {
    return (
        <>
            <AppBarNav />
            <Container sx={{ py: 6 }}>
                <Stack spacing={2}>
                    <Typography variant="h4" fontWeight={700}>
                        Exercise - Picture on the map visualisation
                    </Typography>
                    <Typography color="text.secondary">
                        MUI connected
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" color="primary">Primary</Button>
                        <Button variant="outlined" color="secondary">Secondary</Button>
                    </Stack>
                </Stack>
            </Container>
        </>
    );
}

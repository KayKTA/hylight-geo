import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#6ee7ff" },
        secondary: { main: "#ffd166" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(","),
    },
});

export default theme;

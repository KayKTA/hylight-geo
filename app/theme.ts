import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
  }
  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

export default createTheme({
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      "Inter", "system-ui", "-apple-system", "Segoe UI",
      "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"
    ].join(","),
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 800, letterSpacing: -0.4 },
    h3: { fontWeight: 700, letterSpacing: -0.2 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
  },
  shadows: [
    "none",
    "0 2px 10px rgba(0,0,0,.12)",
    "0 6px 20px rgba(0,0,0,.14)",
    "0 12px 30px rgba(0,0,0,.18)",
    ...Array(21).fill("0 12px 30px rgba(0,0,0,.18)")
  ] as any,
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 16 },
        contained: { boxShadow: "0 6px 20px rgba(0,0,0,.18)" }
      },
    },
    MuiTextField: { defaultProps: { size: "small", variant: "outlined" } },
    MuiChip: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: "saturate(1.2) blur(10px)",
          backgroundImage: "none",
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { opacity: 0.24 } } },
  },
  palette: {
    mode: "dark",
    primary: { main: "#F5B301" },           // solar amber (accent for CTAs)
    secondary: { main: "#5C99FF" },         // cool link/secondary
    accent: { main: "#F5B301" },
    background: { default: "#0E1116", paper: "#151923" },
    text: { primary: "#EDEFF4", secondary: "#A8B0BF" },
    divider: "rgba(255,255,255,.12)",
    success: { main: "#4CAF50" },
    error: { main: "#FF5A64" },
    warning: { main: "#F6C945" },
    info: { main: "#7BC4FF" },
  },
});

// export const lightTheme = createTheme({
//   palette: {
//     mode: "light",
//     primary: { main: "#E0A400" },
//     secondary: { main: "#2B6BFF" },
//     accent: { main: "#E0A400" },
//     background: { default: "#FAFBFE", paper: "#FFFFFF" },
//     text: { primary: "#141823", secondary: "#4B5568" },
//     divider: "rgba(20,24,35,.12)",
//     success: { main: "#2E7D32" },
//     error: { main: "#D32F2F" },
//     warning: { main: "#EDB200" },
//     info: { main: "#1565C0" },
//   },
// });

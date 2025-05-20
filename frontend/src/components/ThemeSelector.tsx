import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import type { Theme } from "shared/types";
import axios from "axios";

interface ThemeSelectorProps {
    onThemeChange: (theme: Theme) => void;
}

const ThemeSelector = ({ onThemeChange }: ThemeSelectorProps) => {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>("default");

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3001/api/themes"
                );
                setThemes(response.data.themes);
            } catch (error) {
                console.error("Error fetching themes:", error);
            }
        };

        fetchThemes();
    }, []);

    const handleThemeChange = (themeId: string) => {
        const theme = themes.find((t) => t.id === themeId);
        if (theme) {
            setSelectedTheme(themeId);
            onThemeChange(theme);
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: 1,
                flex: 1,
            }}
        >
            <Typography variant="h6" gutterBottom>
                Theme
            </Typography>

            <FormControl fullWidth>
                <InputLabel>Select Theme</InputLabel>
                <Select
                    value={selectedTheme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                >
                    {themes.map((theme) => (
                        <MenuItem key={theme.id} value={theme.id}>
                            {theme.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default ThemeSelector;

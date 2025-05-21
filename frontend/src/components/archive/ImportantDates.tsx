import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
} from "@mui/material";
import { format, isToday, isTomorrow } from "date-fns";
import type { ImportantDate } from "shared/types";
import axios from "axios";

const ImportantDates = () => {
    const [dates, setDates] = useState<ImportantDate[]>([]);

    useEffect(() => {
        const fetchDates = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3001/api/dates"
                );
                setDates(response.data.dates);
            } catch (error) {
                console.error("Error fetching dates:", error);
            }
        };

        fetchDates();
    }, []);

    const getDateStatus = (date: string) => {
        const eventDate = new Date(date);
        if (isToday(eventDate)) return "Today";
        if (isTomorrow(eventDate)) return "Tomorrow";
        return format(eventDate, "MMM d");
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "birthday":
                return "primary";
            case "holiday":
                return "secondary";
            default:
                return "default";
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
                Important Dates
            </Typography>
            <List>
                {dates.map((date) => (
                    <ListItem key={date.id}>
                        <ListItemText
                            primary={date.title}
                            secondary={date.description}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                            }}
                        >
                            <Chip
                                label={date.type}
                                color={getTypeColor(date.type)}
                                size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                                {getDateStatus(date.date)}
                            </Typography>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default ImportantDates;

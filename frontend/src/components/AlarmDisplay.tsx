import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Switch } from '@mui/material';
import type { Alarm } from "shared/types";
import axios from 'axios';

const AlarmDisplay = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/alarms');
        setAlarms(response.data.alarms);
      } catch (error) {
        console.error('Error fetching alarms:', error);
      }
    };

    fetchAlarms();
  }, []);

  const handleToggleAlarm = async (alarmId: string, enabled: boolean) => {
    try {
      await axios.patch(`http://localhost:3001/api/alarms/${alarmId}`, {
        enabled,
      });
      setAlarms(alarms.map(alarm =>
        alarm.id === alarmId ? { ...alarm, enabled } : alarm
      ));
    } catch (error) {
      console.error('Error updating alarm:', error);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        flex: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Alarms
      </Typography>
      <List>
        {alarms.map((alarm) => (
          <ListItem
            key={alarm.id}
            secondaryAction={
              <Switch
                edge="end"
                checked={alarm.enabled}
                onChange={(e) => handleToggleAlarm(alarm.id, e.target.checked)}
              />
            }
          >
            <ListItemText
              primary={alarm.label || `Alarm ${alarm.id}`}
              secondary={`${alarm.time} - ${alarm.days.join(', ')}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AlarmDisplay; 
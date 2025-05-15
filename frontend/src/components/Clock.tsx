import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace' }}>
        {format(time, 'HH:mm:ss')}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {format(time, 'EEEE, MMMM d, yyyy')}
      </Typography>
    </Box>
  );
};

export default Clock; 
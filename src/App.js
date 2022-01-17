import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={10}>
      <Grid item xs={4}>
          <Item><Button variant="outlined">Prints</Button></Item>
        </Grid>
        <Grid item xs={4}>
          <Item><Button variant="outlined">Canvases</Button></Item>
        </Grid>
        <Grid item xs={4}>
          <Item><Button variant="outlined">Prints</Button></Item>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;

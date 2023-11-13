import React, { useState } from 'react';
import { CustomCard } from './CustomCard';
import {
    Typography,
    FormControl,
    Button,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';

interface SwapComponentProps {
    onSwap: (amountIn: string, tokenIn: string, tokenOut: string, marketType: string) => void;
    exchangeRate: number;
}

export const Swap: React.FC<SwapComponentProps> = ({ onSwap, exchangeRate }) => {
    const [amountIn, setAmountIn] = useState('');
    const [tokenIn, setTokenIn] = useState('META');
    const [tokenOut, setTokenOut] = useState('USDC');
    const [marketType, setMarketType] = useState('pass'); // 'pass' or 'fail'

    const handleAmountInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmountIn(event.target.value);
        // Add the logic to calculate the estimated amount out based on the current market rate
    };

    const handleTokenSwap = () => {
        const newTokenIn = tokenOut;
        const newTokenOut = tokenIn;
        setTokenIn(newTokenIn);
        setTokenOut(newTokenOut);
        // Add logic to recalculate the amount based on the new tokens
    };

    const handleSwap = () => {
        onSwap(amountIn, tokenIn, tokenOut, marketType);
        // Reset the input or perform additional actions after swap
    };

    return (
        <CustomCard>
            <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                Swap Tokens
            </Typography>
            <FormControl fullWidth style={{ marginTop: 16 }}>
                <InputLabel>Market Type</InputLabel>
                <Select value={marketType} onChange={(e) => setMarketType(e.target.value)}>
                    <MenuItem value="pass">Conditional-on-Pass</MenuItem>
                    <MenuItem value="fail">Conditional-on-Fail</MenuItem>
                </Select>
            </FormControl>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                    <TextField
                        label="From (amount)"
                        value={amountIn}
                        onChange={handleAmountInChange}
                        type="number"
                        fullWidth
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{tokenIn}</InputAdornment>,
                        }}
                        // Reduced margin top for the 'From' box
                        sx={{ mt: 1 }}
                    />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: -2 }}>
                    <IconButton onClick={handleTokenSwap} color="primary">
                        <SwapVertIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="To (estimated)"
                        value={amountIn && (parseFloat(amountIn) * exchangeRate).toFixed(2)} // Replace with real conversion logic
                        InputProps={{
                            readOnly: true,
                            endAdornment: <InputAdornment position="end">{tokenOut}</InputAdornment>,
                        }}
                        fullWidth
                        // Reduced margin top for the 'To' box
                        sx={{ mt: 1 }}
                    />
                </Grid>
            </Grid>
            <Button variant="contained" color="primary" onClick={handleSwap} fullWidth sx={{ mt: 2 }}>
                Swap
            </Button>
        </CustomCard>
    );
};

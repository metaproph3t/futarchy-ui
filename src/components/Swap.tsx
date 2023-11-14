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

import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';

import { OpenbookTwap } from '../idl/openbook_twap';
const OpenbookTwapIDL: OpenbookTwap = require('../idl/openbook_twap.json');
const OPENBOOK_TWAP_PROGRAM_ID = new anchor.web3.PublicKey('TWAPrdhADy2aTKN5iFZtNnkQYXERD9NvKjPFVPMSCNN');

import { OpenbookV2, IDL as OpenbookV2IDL } from '../idl/openbook_v2';
import * as anchor from '@coral-xyz/anchor';
const OPENBOOK_PROGRAM_ID = new anchor.web3.PublicKey(
  'opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb',
);

interface SwapComponentProps {
    onSwap: (amountIn: string, tokenIn: string, tokenOut: string, marketType: string) => void;
    exchangeRate: number;
}

export const Swap = ({ onSwap, passTwapMarket, failTwapMarket }) => {
    const [amountIn, setAmountIn] = useState('');
    const [tokenIn, setTokenIn] = useState('META');
    const [tokenOut, setTokenOut] = useState('USDC');
    const [marketType, setMarketType] = useState('pass'); // 'pass' or 'fail'
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

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

    const simulateSwap = async (inputAmount) => {
        if (!inputAmount || isNaN(inputAmount)) return;

        const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {});

        // const openbook = new OpenBookV2Client(provider);
        const openbookTwap = new anchor.Program<OpenbookTwap>(
            OpenbookTwapIDL,
            OPENBOOK_TWAP_PROGRAM_ID,
            provider
        );
        const openbook = new anchor.Program<OpenbookV2>(
            OpenbookV2IDL,
            OPENBOOK_PROGRAM_ID,
            provider
        );

        let twapMarket = marketType == 'pass' ? passTwapMarket : failTwapMarket;
        const storedTwapMarket = await openbookTwap.account.twapMarket.fetch(twapMarket);

        console.log(await openbook.account.market.fetch(storedTwapMarket.market));



        // console.log(twapMarket.toBase58());
        // console.log(await openbookTwap.account.twapMarket.fetch(twapMarket));
        // console.log(await openbook.account.market.fetch(twapMarket));

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
            <Button variant="contained" color="primary" onClick={() => simulateSwap(1)} fullWidth sx={{ mt: 2 }}>
                Swap
            </Button>
        </CustomCard>
    );
};

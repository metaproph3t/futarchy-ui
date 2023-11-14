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
import * as token from '@solana/spl-token';
export type PlaceOrderArgs = anchor.IdlTypes<OpenbookV2>['PlaceOrderArgs'];

declare const Side: {
    Bid: {
        bid: {};
    };
    Ask: {
        ask: {};
    };
};
declare const OrderType: {
    Limit: {
        limit: {};
    };
    ImmediateOrCancel: {
        immediateOrCancel: {};
    };
    PostOnly: {
        postOnly: {};
    };
    Market: {
        market: {};
    };
    PostOnlySlide: {
        postOnlySlide: {};
    };
};
declare const SelfTradeBehavior: {
    DecrementTake: {
        decrementTake: {};
    };
    CancelProvide: {
        cancelProvide: {};
    };
    AbortTransaction: {
        abortTransaction: {};
    };
};

const OPENBOOK_PROGRAM_ID = new anchor.web3.PublicKey('opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb');

interface SwapComponentProps {
    onSwap: (amountIn: string, tokenIn: string, tokenOut: string, marketType: string) => void;
    exchangeRate: number;
}

export const Swap = ({ onSwap, passTwapMarket, failTwapMarket }) => {
    const [amountIn, setAmountIn] = useState('');
    const [tokenIn, setTokenIn] = useState('META');
    const [amountOut, setAmountOut] = useState(''); // New state for estimated amount out
    const [tokenOut, setTokenOut] = useState('USDC');
    const [marketType, setMarketType] = useState('pass'); // 'pass' or 'fail'
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const handleAmountInChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmountIn = event.target.value;
        setAmountIn(newAmountIn);

        // Call simulateSwap and update amountOut
        const estimatedAmountOut = await simulateSwap(newAmountIn);
        setAmountOut(estimatedAmountOut); // Update the estimated amount out
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
        if (wallet && connection) {
            if (!inputAmount || isNaN(inputAmount)) return;

            let isBuying = tokenIn === 'USDC' && tokenOut === 'META';
            let side = isBuying ? { bid: {} } : { ask: {} }; // Determine side based on buy or sell

            const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {});

            // const openbook = new OpenBookV2Client(provider);
            const openbookTwap = new anchor.Program<OpenbookTwap>(OpenbookTwapIDL, OPENBOOK_TWAP_PROGRAM_ID, provider);
            const openbook = new anchor.Program<OpenbookV2>(OpenbookV2IDL, OPENBOOK_PROGRAM_ID, provider);

            let twapMarket = marketType == 'pass' ? passTwapMarket : failTwapMarket;
            const storedTwapMarket = await openbookTwap.account.twapMarket.fetch(twapMarket);

            const storedMarket = await openbook.account.market.fetch(storedTwapMarket.market);

            let buyArgs: PlaceOrderArgs = {
                side,
                priceLots: new anchor.BN(13_00), // 1 USDC for 1 META
                maxBaseLots: new anchor.BN(inputAmount),
                maxQuoteLotsIncludingFees: new anchor.BN(1_000_000_000), // 10 USDC
                clientOrderId: new anchor.BN(1),
                orderType: { market: {} },
                expiryTimestamp: new anchor.BN(0),
                selfTradeBehavior: { decrementTake: {} },
                limit: 255,
            };

            let preInstructions = [];

            const userQuoteAccount = token.getAssociatedTokenAddressSync(storedMarket.quoteMint, wallet.publicKey);
            let userQuoteBalanceBefore = 0;

            if ((await connection.getBalance(userQuoteAccount)) == 0) {
                preInstructions.push(
                    token.createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        userQuoteAccount,
                        wallet.publicKey,
                        storedMarket.quoteMint
                    )
                );
            } else {
                userQuoteBalanceBefore = Number((await token.getAccount(connection, userQuoteAccount)).amount);
            }

            const userBaseAccount = token.getAssociatedTokenAddressSync(storedMarket.baseMint, wallet.publicKey);
            let userBaseBalanceBefore = 0;

            if ((await connection.getBalance(userBaseAccount)) == 0) {
                preInstructions.push(
                    token.createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        userBaseAccount,
                        wallet.publicKey,
                        storedMarket.baseMint
                    )
                );
            } else {
                userBaseBalanceBefore = Number((await token.getAccount(connection, userBaseAccount)).amount);
            }

            let tx = await openbookTwap.methods
                .placeTakeOrder(buyArgs)
                .accounts({
                    asks: storedMarket.asks,
                    bids: storedMarket.bids,
                    eventHeap: storedMarket.eventHeap,
                    market: storedTwapMarket.market,
                    marketAuthority: storedMarket.marketAuthority,
                    marketBaseVault: storedMarket.marketBaseVault,
                    marketQuoteVault: storedMarket.marketQuoteVault,
                    userQuoteAccount,
                    userBaseAccount,
                    twapMarket,
                    openbookProgram: OPENBOOK_PROGRAM_ID,
                })
                .preInstructions(preInstructions)
                .transaction();

            tx.feePayer = wallet.publicKey;

            const sim = await provider.connection.simulateTransaction(tx, undefined, [
                userBaseAccount,
                userQuoteAccount,
            ]);

            const userBaseBalanceAfter = token.unpackAccount(userBaseAccount.address, {
                data: Buffer.from(
                    Buffer.from(sim.value.accounts[0].data[0], sim.value.accounts[0].data[1] as BufferEncoding)
                ),
                executable: false,
                lamports: 0,
                owner: token.TOKEN_PROGRAM_ID,
            }).amount;

            const userQuoteBalanceAfter = token.unpackAccount(userQuoteAccount.address, {
                data: Buffer.from(
                    Buffer.from(sim.value.accounts[1].data[0], sim.value.accounts[1].data[1] as BufferEncoding)
                ),
                executable: false,
                lamports: 0,
                owner: token.TOKEN_PROGRAM_ID,
            }).amount;

            let simulatedAmountAfterTransaction = isBuying
                ? ((Number(userBaseBalanceAfter) - userBaseBalanceBefore) / 1_000_000_000).toFixed(2)
                : ((Number(userQuoteBalanceAfter) - userQuoteBalanceBefore) / 1_000_000).toFixed(2);

            return simulatedAmountAfterTransaction;
        }
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
                        value={amountOut} // Replace with real conversion logic
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
            <Button
                variant="contained"
                color="primary"
                onClick={() => simulateSwap(parseInt(amountIn))}
                fullWidth
                sx={{ mt: 2 }}
            >
                Swap
            </Button>
        </CustomCard>
    );
};

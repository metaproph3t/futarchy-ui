import {
    Accordion,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Link,
    Table,
    TextField,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Container,
    CardContent,
    Button,
    Grid,
    Card,
} from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import pkg from '../../package.json';
import { useAutoConnect } from '../components/AutoConnectProvider';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SwapVertIcon from '@mui/icons-material/SwapVert';

const MaterialUIWalletConnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletConnectButton,
    { ssr: false }
);
const MaterialUIWalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletDisconnectButton,
    { ssr: false }
);
const MaterialUIWalletDialogButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletDialogButton,
    { ssr: false }
);
const MaterialUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);
const RequestAirdropDynamic = dynamic(async () => (await import('../components/RequestAirdrop')).RequestAirdrop, {
    ssr: false,
});
const SendLegacyTransactionDynamic = dynamic(
    async () => (await import('../components/SendLegacyTransaction')).SendLegacyTransaction,
    { ssr: false }
);
const SendTransactionDynamic = dynamic(async () => (await import('../components/SendTransaction')).SendTransaction, {
    ssr: false,
});
const SendV0TransactionDynamic = dynamic(
    async () => (await import('../components/SendV0Transaction')).SendV0Transaction,
    { ssr: false }
);
const SignInDynamic = dynamic(async () => (await import('../components/SignIn')).SignIn, { ssr: false });
const SignMessageDynamic = dynamic(async () => (await import('../components/SignMessage')).SignMessage, { ssr: false });
const SignTransactionDynamic = dynamic(async () => (await import('../components/SignTransaction')).SignTransaction, {
    ssr: false,
});

interface SwapComponentProps {
    onSwap: (amountIn: string, tokenIn: string, tokenOut: string, marketType: string) => void;
    exchangeRate: number;
}

const CustomCard = ({ children }) => {
    return (
        <Card
            variant="outlined"
            style={{
                marginBottom: 20,
                borderColor: '#1976d2',
            }}
        >
            <CardContent style={{ padding: '16px' }}>{children}</CardContent>
        </Card>
    );
};

const SwapComponent: React.FC<SwapComponentProps> = ({ onSwap, exchangeRate }) => {
    const [amountIn, setAmountIn] = useState('');
    const [tokenIn, setTokenIn] = useState('META');
    const [tokenOut, setTokenOut] = useState('USDC');
    const [marketType, setMarketType] = useState('pass'); // 'pass' or 'fail'

    const handleAmountInChange = (event) => {
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
                        value={amountIn && (amountIn * exchangeRate).toFixed(2)} // Replace with real conversion logic
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

const Index: NextPage = () => {
    const { autoConnect, setAutoConnect } = useAutoConnect();

    const proposals = [
        {
            number: 0,
            descriptionUrl: 'https://www.eff.org/cyberspace-independence',
            slotEnqueued: 1039209302,
            state: 'pending',
            conditionalBalances: { passMETA: 100, failMETA: 50, passUSDC: 200, failUSDC: 100 },
            marketPrices: { passMETA: 1.2, failMETA: 0.8 },
            // Add other necessary fields
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'yellow';
            case 'passed':
                return 'green';
            case 'failed':
                return 'red';
            default:
                return 'grey'; // Default color if status is unknown
        }
    };

    const userBalances = {
        USDC: 1000, // Replace with real data
        META: 500, // Replace with real data
    };

    return (
        <>
            <Container maxWidth="md">
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h2" gutterBottom>
                            Proposals
                        </Typography>
                    </Grid>
                    <Grid item>
                        <MaterialUIWalletMultiButtonDynamic />
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                    <Grid item xs={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">USDC Balance</Typography>
                                <Typography variant="body1">{userBalances.USDC} USDC</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">META Balance</Typography>
                                <Typography variant="body1">{userBalances.META} META</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                {proposals.map((proposal) => (
                    <Accordion key={proposal.number}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{'Proposal ' + proposal.number}</Typography>

                            {/* Status label */}
                            <Typography
                                variant="body1"
                                style={{
                                    marginLeft: 'auto',
                                    color: getStatusColor(proposal.state),
                                    fontWeight: 'bold',
                                }}
                            >
                                {proposal.state.toUpperCase()}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <CardContent>
                                <CustomCard>
                                    <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                        Proposal Details
                                    </Typography>

                                    <Typography
                                        variant="subtitle1"
                                        color="textSecondary"
                                        style={{ fontWeight: 'medium' }}
                                    >
                                        Description
                                    </Typography>
                                    <Typography variant="body1" style={{ marginTop: 4, marginBottom: 12 }}>
                                        <Link
                                            href={proposal.descriptionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                textDecoration: 'none',
                                                color: '#1976d2',
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            {proposal.descriptionUrl}
                                        </Link>
                                    </Typography>

                                    <Typography
                                        variant="subtitle1"
                                        color="textSecondary"
                                        style={{ fontWeight: 'medium' }}
                                    >
                                        Slot Enqueued
                                    </Typography>
                                    <Typography variant="body1" style={{ marginTop: 4 }}>
                                        {proposal.slotEnqueued}
                                    </Typography>
                                </CustomCard>

                                <Grid container spacing={2}>
                                    {/* META Balance Card */}
                                    <Grid item xs={6}>
                                        <CustomCard>
                                            <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                                Conditional META Balances
                                            </Typography>
                                            <Typography>
                                                Conditional-on-Pass: {proposal.conditionalBalances.passMETA} META
                                            </Typography>
                                            <Typography>
                                                Conditional-on-Fail: {proposal.conditionalBalances.failMETA} META
                                            </Typography>
                                            <Grid container spacing={1} alignItems="center" style={{ marginTop: 16 }}>
                                                <Grid item xs>
                                                    <TextField
                                                        fullWidth
                                                        label="Amount"
                                                        variant="outlined"
                                                        type="number"
                                                        // Optional: Add a state to handle the input value
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        //   onClick={() => handleDepositMeta(proposal.id, /* amount from state */)}
                                                    >
                                                        Deposit META
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </CustomCard>
                                    </Grid>

                                    {/* USDC Balance Card */}
                                    <Grid item xs={6}>
                                        <CustomCard>
                                            <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                                Conditional USDC Balances
                                            </Typography>
                                            <Typography>
                                                Conditional-on-Pass: {proposal.conditionalBalances.passUSDC} USDC
                                            </Typography>
                                            <Typography>
                                                Conditional-on-Fail: {proposal.conditionalBalances.failUSDC} USDC
                                            </Typography>
                                            <Grid container spacing={1} alignItems="center" style={{ marginTop: 16 }}>
                                                <Grid item xs>
                                                    <TextField
                                                        fullWidth
                                                        label="Amount"
                                                        variant="outlined"
                                                        type="number"
                                                        // Optional: Add a state to handle the input value
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        //   onClick={() => handleDepositUsdc(proposal.id, /* amount from state */)}
                                                    >
                                                        Deposit USDC
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </CustomCard>
                                    </Grid>
                                </Grid>

                                <SwapComponent onSwap={null} exchangeRate={1} />

                                {/* Additional buttons and functionality */}
                                <Button variant="contained" color="primary" style={{ marginTop: 16 }}>
                                    Deposit META/USDC
                                </Button>
                                {/* Swap functionality */}
                            </CardContent>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </>
    );
};

export default Index;

import { Accordion, FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Container, CardContent, Button, Grid, Card } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import pkg from '../../package.json';
import { useAutoConnect } from '../components/AutoConnectProvider';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

const Index: NextPage = () => {
    const { autoConnect, setAutoConnect } = useAutoConnect();

    const proposals = [
        { id: 1, title: "Proposal One", description: "Description for Proposal One", url: "#" },
        { id: 2, title: "Proposal Two", description: "Description for Proposal Two", url: "#" },
        // Add more proposals as needed
    ];

    const userBalances = {
        USDC: 1000, // Replace with real data
        META: 500  // Replace with real data
    };

    return (
        <>
        <Container maxWidth="md">
            <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                <Typography variant="h2">Proposals</Typography>
                </Grid>
                <Grid item>
                <MaterialUIWalletMultiButtonDynamic />
                </Grid>
            </Grid>
            {/* <Typography variant="h2" gutterBottom>
                Proposals
            </Typography> */}
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
            {proposals.map(proposal => (
                <Accordion key={proposal.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{proposal.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <CardContent>
                    <Typography gutterBottom variant="body1">
                        {proposal.description}
                    </Typography>
                    <Button variant="contained" color="primary">
                        Deposit META/USDC
                    </Button>
                    {/* Additional buttons and functionality can be added here */}
                    </CardContent>
                </AccordionDetails>
                </Accordion>
            ))}
          </Container>
        </>
    );
};

export default Index;

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
import React, { useState, useEffect } from 'react';
import pkg from '../../package.json';
import { useAutoConnect } from '../components/AutoConnectProvider';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import * as token from '@solana/spl-token';

import { AutocratV0 } from '../idl/autocrat_v0';
import { Proposal } from '../components/Proposal';

const AutocratIDL: AutocratV0 = require('../idl/autocrat_v0.json');
// const OpenbookTwapIDL: OpenbookTwap = require("../tests/fixtures/openbook_twap.json");

const AUTOCRAT_PROGRAM_ID = new anchor.web3.PublicKey('meta3cxKzFBmWYgCVozmvCQAS3y9b3fGxrG9HkHL7Wi');

const [daoAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode('WWCACOTMICMIBMHAFTTWYGHMB')],
    AUTOCRAT_PROGRAM_ID
);

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
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    console.log(wallet?.publicKey.toBase58());

    const [dao, setDAO] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [userMetaBalance, setUserMetaBalance] = useState(0);
    const [userUsdcBalance, setUserUsdcBalance] = useState(0);

    useEffect(() => {
        if (wallet && connection) {
            const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {});
            const autocrat = new anchor.Program(AutocratIDL, AUTOCRAT_PROGRAM_ID, provider);

            // Fetch and set proposals
            autocrat.account.proposal
                .all()
                .then((fetchedProposals) => {
                    console.log(fetchedProposals.map((p) => p.account));
                    setProposals(fetchedProposals.map((p) => p.account));
                })
                .catch((err) => {
                    console.error('Failed to fetch proposals:', err);
                });
        }
    }, [wallet, connection]); // Dependencies array

    useEffect(() => {
        if (wallet && connection) {
            const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {});
            const autocrat = new anchor.Program(AutocratIDL, AUTOCRAT_PROGRAM_ID, provider);

            autocrat.account.dao
                .fetch(daoAddress)
                .then((dao) => {
                    console.log(dao);
                    setDAO(dao);
                })
                .catch((err) => {
                    console.error('Failed to fetch dao:', err);
                });
        }
    }, [wallet, connection]); // Dependencies array

    useEffect(() => {
        if (wallet && connection && dao) {
            const associatedMetaAcc = token.getAssociatedTokenAddressSync(dao.metaMint, wallet.publicKey);
            const associatedUsdcAcc = token.getAssociatedTokenAddressSync(dao.usdcMint, wallet.publicKey);

            token
                .getAccount(connection, associatedMetaAcc)
                .then((metaAcc) => {
                    setUserMetaBalance(Number(metaAcc.amount));
                })
                .catch((err) => {
                    console.error("User doesn't have a META account");
                });

            token
                .getAccount(connection, associatedUsdcAcc)
                .then((usdcAcc) => {
                    setUserUsdcBalance(Number(usdcAcc.amount));
                })
                .catch((err) => {
                    console.error("User doesn't have a USDC account");
                });
        }
    }, [wallet, connection, dao]);

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
                        <SendLegacyTransactionDynamic />
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
                                <Typography variant="body1">{userUsdcBalance / 1_000_000} USDC</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">META Balance</Typography>
                                <Typography variant="body1">{userMetaBalance / 1_000_000_000} META</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                {proposals.map((proposal) => (
                    <Proposal proposal={proposal} />
                ))}
            </Container>
        </>
    );
};

export default Index;

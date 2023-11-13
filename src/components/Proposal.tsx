import {
    Accordion,
    AccordionSummary,
    Typography,
    AccordionDetails,
    Link,
    CardContent,
    Grid,
    TextField,
    Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Swap } from './Swap';
import { CustomCard } from './CustomCard';
import { useState, useEffect } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';

import * as anchor from '@coral-xyz/anchor';
import * as token from '@solana/spl-token';

import { AutocratV0 } from '../idl/autocrat_v0';
const AutocratIDL: AutocratV0 = require('../idl/autocrat_v0.json');
const AUTOCRAT_PROGRAM_ID = new anchor.web3.PublicKey('meta3cxKzFBmWYgCVozmvCQAS3y9b3fGxrG9HkHL7Wi');

import { ConditionalVault } from '../idl/conditional_vault';
const ConditionalVaultIDL: ConditionalVault = require('../idl/conditional_vault.json');
const CONDITIONAL_VAULT_PROGRAM_ID = new anchor.web3.PublicKey('vaU1tVLj8RFk7mNj1BxqgAsMKKaL8UvEUHvU3tdbZPe');

const getStatusColor = (status: string) => {
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

export const Proposal = ({ proposal }) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const [userConditionalOnPassMetaBalance, setUserConditionalOnPassMetaBalance] = useState(0);
    const [userConditionalOnFailMetaBalance, setUserConditionalOnFailMetaBalance] = useState(0);
    
    const [userConditionalOnPassUsdcBalance, setUserConditionalOnPassUsdcBalance] = useState(0);
    const [userConditionalOnFailUsdcBalance, setUserConditionalOnFailUsdcBalance] = useState(0);

    useEffect(() => {
        if (wallet && connection) {
            const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {});
            const autocrat = new anchor.Program(AutocratIDL, AUTOCRAT_PROGRAM_ID, provider);
            const conditionalVault = new anchor.Program(ConditionalVaultIDL, CONDITIONAL_VAULT_PROGRAM_ID, provider);

            conditionalVault.account.conditionalVault.fetch(proposal.baseVault).then((vault) => {
                let conditionalOnPassMetaMint = vault.conditionalOnFinalizeTokenMint;
                let conditionalOnFailMetaMint = vault.conditionalOnRevertTokenMint;

                const passAcc = token.getAssociatedTokenAddressSync(conditionalOnPassMetaMint, wallet.publicKey);
                const failAcc = token.getAssociatedTokenAddressSync(conditionalOnFailMetaMint, wallet.publicKey);

                token
                    .getAccount(connection, passAcc)
                    .then((metaAcc) => {
                        setUserConditionalOnPassMetaBalance(Number(metaAcc.amount));
                    })
                    .catch((err) => {
                        console.error("User doesn't have a conditional-on-pass META account");
                    });

                token
                    .getAccount(connection, failAcc)
                    .then((metaAcc) => {
                        setUserConditionalOnFailMetaBalance(Number(metaAcc.amount));
                    })
                    .catch((err) => {
                        console.error("User doesn't have a conditional-on-fail META account");
                    });
            })

            conditionalVault.account.conditionalVault.fetch(proposal.quoteVault).then((vault) => {
                let conditionalOnPassUsdcMint = vault.conditionalOnFinalizeTokenMint;
                let conditionalOnFailUsdcMint = vault.conditionalOnRevertTokenMint;

                const passAcc = token.getAssociatedTokenAddressSync(conditionalOnPassUsdcMint, wallet.publicKey);
                const failAcc = token.getAssociatedTokenAddressSync(conditionalOnFailUsdcMint, wallet.publicKey);

                token
                    .getAccount(connection, passAcc)
                    .then((usdcAcc) => {
                        setUserConditionalOnPassUsdcBalance(Number(usdcAcc.amount));
                    })
                    .catch((err) => {
                        console.error("User doesn't have a conditional-on-pass USDC account");
                    });

                token
                    .getAccount(connection, failAcc)
                    .then((usdcAcc) => {
                        setUserConditionalOnFailUsdcBalance(Number(usdcAcc.amount));
                    })
                    .catch((err) => {
                        console.error("User doesn't have a conditional-on-fail USDC account");
                    });
            })
        }
    })

    return (
        <Accordion key={proposal.number}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{'Proposal ' + proposal.number}</Typography>

                {/* Status label */}
                <Typography
                    variant="body1"
                    style={{
                        marginLeft: 'auto',
                        color: getStatusColor(Object.keys(proposal.state)[0]),
                        fontWeight: 'bold',
                    }}
                >
                    {Object.keys(proposal.state)[0].toUpperCase()}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <CardContent>
                    <CustomCard>
                        <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                            Proposal Details
                        </Typography>

                        <Typography variant="subtitle1" color="textSecondary" style={{ fontWeight: 'medium' }}>
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

                        <Typography variant="subtitle1" color="textSecondary" style={{ fontWeight: 'medium' }}>
                            Slot Enqueued
                        </Typography>
                        <Typography variant="body1" style={{ marginTop: 4 }}>
                            {proposal.slotEnqueued.toString()}
                        </Typography>
                    </CustomCard>

                    <Grid container spacing={2}>
                        {/* META Balance Card */}
                        <Grid item xs={6}>
                            <CustomCard>
                                <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                                    Conditional META Balances
                                </Typography>
                                <Typography>Conditional-on-Pass: {userConditionalOnPassMetaBalance / 1_000_000_000} META</Typography>
                                <Typography>Conditional-on-Fail: {userConditionalOnFailMetaBalance /  1_000_000_000} META</Typography>
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
                                <Typography>Conditional-on-Pass: {userConditionalOnPassUsdcBalance / 1_000_000} USDC</Typography>
                                <Typography>Conditional-on-Fail: {userConditionalOnFailUsdcBalance / 1_000_000} USDC</Typography>
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

                    <Swap onSwap={() => {}} exchangeRate={1} />
                </CardContent>
            </AccordionDetails>
        </Accordion>
    );
};

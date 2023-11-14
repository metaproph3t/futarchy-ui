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
import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useNotify } from './notify';

import * as anchor from '@coral-xyz/anchor';
import * as token from '@solana/spl-token';

import { AutocratV0 } from '../idl/autocrat_v0';
const AutocratIDL: AutocratV0 = require('../idl/autocrat_v0.json');
const AUTOCRAT_PROGRAM_ID = new anchor.web3.PublicKey('meta3cxKzFBmWYgCVozmvCQAS3y9b3fGxrG9HkHL7Wi');

import { ConditionalVault } from '../idl/conditional_vault';
import { TransactionSignature } from '@solana/web3.js';
const ConditionalVaultIDL: ConditionalVault = require('../idl/conditional_vault.json');
const CONDITIONAL_VAULT_PROGRAM_ID = new anchor.web3.PublicKey('vaU1tVLj8RFk7mNj1BxqgAsMKKaL8UvEUHvU3tdbZPe');

export const ConditionalTokenDeposit = ({ vault, tokenSymbol, scaleDecimals }) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { sendTransaction } = useWallet();
    const notify = useNotify();

    const [userConditionalOnPassBalance, setUserConditionalOnPassBalance] = useState(0);
    const [userConditionalOnFailBalance, setUserConditionalOnFailBalance] = useState(0);

    const [depositAmount, setDepositAmount] = useState(0);

    useEffect(() => {
        if (wallet && connection) {
            const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {});
            const conditionalVault = new anchor.Program(ConditionalVaultIDL, CONDITIONAL_VAULT_PROGRAM_ID, provider);

            conditionalVault.account.conditionalVault.fetch(vault).then((storedVault) => {
                let conditionalOnPassMetaMint = storedVault.conditionalOnFinalizeTokenMint;
                let conditionalOnFailMetaMint = storedVault.conditionalOnRevertTokenMint;

                const passAcc = token.getAssociatedTokenAddressSync(conditionalOnPassMetaMint, wallet.publicKey);
                const failAcc = token.getAssociatedTokenAddressSync(conditionalOnFailMetaMint, wallet.publicKey);

                token
                    .getAccount(connection, passAcc)
                    .then((storedPassAcc) => {
                        setUserConditionalOnPassBalance(Number(storedPassAcc.amount));
                    })
                    .catch((err) => {
                        console.error(`User doesn't have a conditional-on-pass ${tokenSymbol} account`);
                    });

                token
                    .getAccount(connection, failAcc)
                    .then((storedPassAcc) => {
                        setUserConditionalOnFailBalance(Number(storedPassAcc.amount));
                    })
                    .catch((err) => {
                        console.error(`User doesn't have a conditional-on-fail ${tokenSymbol} account`);
                    });
            });
        }
    });

    // Handle Deposit META
    const handleDeposit = async (amount) => {
        let signature: TransactionSignature | undefined = undefined;
        if (!wallet) {
            console.error('Wallet not connected');
            return;
        }

        try {
            const provider = new anchor.AnchorProvider(connection, wallet, {});
            const program = new anchor.Program(ConditionalVaultIDL, CONDITIONAL_VAULT_PROGRAM_ID, provider);

            const {
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const storedVault = await program.account.conditionalVault.fetch(vault);

            const userUnderlyingTokenAccount = token.getAssociatedTokenAddressSync(
                storedVault.underlyingTokenMint,
                wallet.publicKey
            );

            console.log(userUnderlyingTokenAccount.toBase58());

            let preInstructions = [];

            const userConditionalOnFinalizeTokenAccount = token.getAssociatedTokenAddressSync(
                storedVault.conditionalOnFinalizeTokenMint,
                wallet.publicKey
            );

            if ((await connection.getBalance(userConditionalOnFinalizeTokenAccount)) == 0) {
                preInstructions.push(
                    token.createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        userConditionalOnFinalizeTokenAccount,
                        wallet.publicKey,
                        storedVault.conditionalOnFinalizeTokenMint
                    )
                );
            }

            const userConditionalOnRevertTokenAccount = token.getAssociatedTokenAddressSync(
                storedVault.conditionalOnRevertTokenMint,
                wallet.publicKey
            );

            if ((await connection.getBalance(userConditionalOnRevertTokenAccount)) == 0) {
                preInstructions.push(
                    token.createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        userConditionalOnRevertTokenAccount,
                        wallet.publicKey,
                        storedVault.conditionalOnRevertTokenMint
                    )
                );
            }

            console.log(await connection.getBalance(userConditionalOnFinalizeTokenAccount));

            const bnAmount = new anchor.BN(amount);

            const mintTx = await program.methods
                .mintConditionalTokens(bnAmount)
                .accounts({
                    authority: wallet.publicKey,
                    vault,
                    vaultUnderlyingTokenAccount: storedVault.underlyingTokenAccount,
                    userUnderlyingTokenAccount,
                    conditionalOnFinalizeTokenMint: storedVault.conditionalOnFinalizeTokenMint,
                    userConditionalOnFinalizeTokenAccount,
                    conditionalOnRevertTokenMint: storedVault.conditionalOnRevertTokenMint,
                    userConditionalOnRevertTokenAccount,
                })
                .preInstructions(preInstructions)
                .transaction();

            signature = await sendTransaction(mintTx, connection);
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
        }
    };

    return (
        <CustomCard>
            <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                Conditional {tokenSymbol} Balances
            </Typography>
            <Typography>Conditional-on-Pass: {userConditionalOnPassBalance / scaleDecimals} {tokenSymbol}</Typography>
            <Typography>Conditional-on-Fail: {userConditionalOnFailBalance / scaleDecimals} {tokenSymbol}</Typography>
            <Grid container spacing={1} alignItems="center" style={{ marginTop: 16 }}>
                <Grid item xs>
                    <TextField
                        fullWidth
                        label="Amount"
                        variant="outlined"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => handleDeposit(depositAmount * scaleDecimals)}>
                        Deposit {tokenSymbol}
                    </Button>
                </Grid>
            </Grid>
        </CustomCard>
    );
};

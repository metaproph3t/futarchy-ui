import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { blue, red, deepPurple, pink } from '@mui/material/colors';
import { WalletModalProvider as AntDesignWalletModalProvider } from '@solana/wallet-adapter-ant-design';
import type { Adapter, WalletError } from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletDialogProvider as MaterialUIWalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider as ReactUIWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { type SolanaSignInInput } from '@solana/wallet-standard-features';
import { verifySignIn } from '@solana/wallet-standard-util';
import { clusterApiUrl } from '@solana/web3.js';
import { SnackbarProvider, useSnackbar } from 'notistack';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: blue[700],
        },
        secondary: {
            main: red[700],
        },
    },
    components: {
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    justifyContent: 'flex-start',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    padding: '12px 16px',
                },
                startIcon: {
                    marginRight: 8,
                },
                endIcon: {
                    marginLeft: 8,
                },
            },
        },
    },
});

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();

    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const endpoint = "https://sudden-jocelyn-fast-mainnet.helius-rpc.com/";

    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/solana-labs/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new SolflareWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new PhantomWalletAdapter(),
            new LedgerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError, adapter?: Adapter) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error, adapter);
        },
        [enqueueSnackbar]
    );

    const autoSignIn = useCallback(async (adapter: Adapter) => {
        if (!('signIn' in adapter)) return true;

        const input: SolanaSignInInput = {
            domain: window.location.host,
            address: adapter.publicKey ? adapter.publicKey.toBase58() : undefined,
            statement: 'Please sign in.',
        };
        const output = await adapter.signIn(input);

        if (!verifySignIn(input, output)) throw new Error('Sign In verification failed!');

        return false;
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect && autoSignIn}>
                <MaterialUIWalletDialogProvider>
                    <AntDesignWalletModalProvider>
                        <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
                    </AntDesignWalletModalProvider>
                </MaterialUIWalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <AutoConnectProvider>
                        <WalletContextProvider>{children}</WalletContextProvider>
                    </AutoConnectProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

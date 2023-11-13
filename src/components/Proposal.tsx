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
                                <Typography>Conditional-on-Pass: 100 META</Typography>
                                <Typography>Conditional-on-Fail: 329 META</Typography>
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
                                <Typography>Conditional-on-Pass: 100 USDC</Typography>
                                <Typography>Conditional-on-Fail: 203 USDC</Typography>
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

import { Card, CardContent } from '@mui/material';

interface CustomCardProps {
    children: React.ReactNode;
}

export const CustomCard: React.FC<CustomCardProps> = ({ children }) => {
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

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Stack,
} from '@mui/material';

type Policy = {
  id: number;
  title: string;
  description: string;
  category: string;
};

const mockPolicies: Policy[] = [
  { id: 1, title: 'Carbon Tax Reform', description: 'Taxing carbon emissions to curb pollution.', category: 'Environment' },
  { id: 2, title: 'Green Subsidy', description: 'Government incentives for clean energy.', category: 'Economy' },
  { id: 3, title: 'Renewable Mandate', description: 'Mandating energy providers to shift to renewable sources.', category: 'Energy' },
  { id: 4, title: 'Plastic Ban', description: 'Regulations to ban single-use plastics.', category: 'Environment' },
  { id: 5, title: 'Emission Trading', description: 'Carbon trading market for emissions control.', category: 'Economy' },
  { id: 6, title: 'Smart Grid Act', description: 'Policy to modernize the electrical grid with smart tech.', category: 'Energy' },
  { id: 7, title: 'Eco Labeling Law', description: 'Mandating product transparency for eco impact.', category: 'Environment' },
  { id: 8, title: 'EV Incentives', description: 'Tax credits for electric vehicle purchases.', category: 'Economy' },
  { id: 9, title: 'Carbon Tax Reform', description: 'Taxing carbon emissions to curb pollution.', category: 'Environment' },
  { id: 10, title: 'Green Subsidy', description: 'Government incentives for clean energy.', category: 'Economy' },
  { id: 11, title: 'Renewable Mandate', description: 'Mandating energy providers to shift to renewable sources.', category: 'Energy' },
  { id: 12, title: 'Plastic Ban', description: 'Regulations to ban single-use plastics.', category: 'Environment' },
  { id: 13, title: 'Emission Trading', description: 'Carbon trading market for emissions control.', category: 'Economy' },
  { id: 14, title: 'Smart Grid Act', description: 'Policy to modernize the electrical grid with smart tech.', category: 'Energy' },
  { id: 15, title: 'Eco Labeling Law', description: 'Mandating product transparency for eco impact.', category: 'Environment' },
  { id: 16, title: 'EV Incentives', description: 'Tax credits for electric vehicle purchases.', category: 'Economy' },
];

const PolicyList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filteredPolicies = mockPolicies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === '' || policy.category === category)
  );

  return (
    <Box sx={{ bgcolor: '#edf5ed', pb: 6 }}>
      {/* Sticky Filter Bar (aligned with rest of content) */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#e3f2e1',
          borderBottom: '1px solid #c8dcc4',
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Search Policies"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Environment">Environment</MenuItem>
                <MenuItem value="Economy">Economy</MenuItem>
                <MenuItem value="Energy">Energy</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Container>
      </Box>

      {/* Policies Grid */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={3}
        >
          {filteredPolicies.map((policy) => (
            <Card
              key={policy.id}
              sx={{
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {policy.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {policy.category}
                </Typography>
                <Typography variant="body1">{policy.description}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {filteredPolicies.length === 0 && (
          <Typography variant="body1" mt={3}>
            No policies found.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default PolicyList;

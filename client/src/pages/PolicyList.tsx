import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  _id: string;
  policy_title: string;
  policy_description: string;
  sector: string;
  policy_type: string;
};

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    axios.get<Policy[]>('http://localhost:3001/api/policies')
      .then((res) => setPolicies(res.data))
      .catch((err) => console.error('❌ Failed to fetch policies:', err));
  }, []);

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policy_title?.toLowerCase().includes(search.toLowerCase()) &&
      (category === '' || policy.sector === category)
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
            <Card key={policy._id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {policy.policy_title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {policy.sector}
                </Typography>
                <Typography variant="body1">
                  {policy.policy_description}a
                </Typography>
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

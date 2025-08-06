import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

interface Policy {
  _id: string;
  name: string;
  description: string;
  summary?: string;
  country: string;
  date: string;
}

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    fetch('/api/policies')
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch((err) => console.error('Failed to fetch policies:', err));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Climate Policies
      </Typography>
      <Grid container spacing={2}>
        {policies.map((policy) => (
          <Grid item xs={12} sm={6} md={4} key={policy._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{policy.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {policy.country} — {new Date(policy.date).toLocaleDateString()}
                </Typography>
                {policy.summary ? (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      Summary:
                    </Typography>
                    <Typography variant="body2">{policy.summary}</Typography>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    No summary available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PolicyList;

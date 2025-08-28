import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";

export type Policy = {
  _id: string;
  policy_id?: number;
  country_iso?: string;
  policy_name?: string;
  policy_title?: string;
  jurisdiction?: string;
  supranational_region?: string;
  country?: string;
  subnational_region?: string;
  policy_city_or_local?: string;
  policy_instrument?: string;
  sector?: string;
  policy_description?: string;
  policy_type?: string;
  stringency?: string;
  policy_status?: string;
  decision_date?: string;
  start_date?: string;
  end_date?: string;
  high_impact?: string;
  policy_objective?: string;
  reference?: string;
  impact_indicators?: string;
  last_update?: string;
};

const label = (t: string) => (
  <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 180 }}>
    {t}
  </Typography>
);

const row = (t: string, v?: React.ReactNode) => (
  <Stack direction="row" spacing={2} sx={{ py: 1 }}>
    {label(t)}
    <Typography variant="body1" sx={{ flex: 1 }}>
      {v || "—"}
    </Typography>
  </Stack>
);

const PolicyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // If you set axios.defaults.baseURL = "http://localhost:3001/api", you can just use `/policies/${id}`
        const res = await axios.get<Policy>(`http://localhost:3001/api/policies/${id}`);
        if (!cancelled) setData(res.data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.response?.data?.message || "Failed to load policy");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading policy…</Typography>
        </Stack>
      </Container>
    );
  }

  if (err || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {err || "Policy not found"}
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined">
          Back to list
        </Button>
      </Container>
    );
  }

  const sectors = (data.sector || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box sx={{ bgcolor: "#edf5ed", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 2, gap: 2 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {data.policy_title || data.policy_name || "Policy"}
          </Typography>
          <Button component={RouterLink} to="/" variant="outlined">
            Back to list
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {data.policy_description || "—"}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Meta
                </Typography>
                {row("Policy Type", data.policy_type)}
                {row("Instrument", data.policy_instrument)}
                {row("Stringency", data.stringency)}
                {row("Status", data.policy_status)}
                {row("High Impact", data.high_impact)}
                {row("Objective", data.policy_objective)}
                {row("Impact Indicators", data.impact_indicators)}
                {row("Reference", data.reference)}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Jurisdiction
                </Typography>
                {row("Country", data.country)}
                {row("ISO", data.country_iso)}
                {row("Jurisdiction", data.jurisdiction)}
                {row("Supranational Region", data.supranational_region)}
                {row("Subnational Region", data.subnational_region)}
                {row("City/Local", data.policy_city_or_local)}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Dates
                </Typography>
                {row("Decision Date", data.decision_date)}
                {row("Start Date", data.start_date)}
                {row("End Date", data.end_date)}
                {row("Last Update", data.last_update)}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Sectors
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {sectors.length ? (
                    sectors.map((s) => <Chip key={s} label={s} size="small" />)
                  ) : (
                    <Typography variant="body2">—</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PolicyDetails;

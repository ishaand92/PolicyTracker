import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import PolicyIcon from "@mui/icons-material/Policy";
import PublicIcon from "@mui/icons-material/Public";
import InsightsIcon from "@mui/icons-material/Insights";
import SearchIcon from "@mui/icons-material/Search";
import SpeedIcon from "@mui/icons-material/Speed";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import VerifiedIcon from "@mui/icons-material/Verified";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShieldIcon from "@mui/icons-material/Shield";
import { Link as RouterLink } from "react-router-dom";

const SectionDivider = () => (
  <Divider sx={{ my: { xs: 4, md: 6 } }}>
    <Chip label="• • •" variant="outlined" />
  </Divider>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
}> = ({ icon, title, desc }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      bgcolor: "#ffffff",
      border: "1px solid rgba(0,0,0,0.06)",
      transition: "transform 120ms ease, box-shadow 120ms ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      },
      height: "100%",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "#e9f5eb",
          border: "1px solid #d0e7d3",
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
    <Typography variant="body2" color="text.secondary">
      {desc}
    </Typography>
  </Paper>
);

const Home: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px - 53px)",
        overflowY: "auto",
        background:
          "linear-gradient(135deg, rgb(244,248,241) 0%, rgb(248,243,243) 100%)",
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 10 },
          textAlign: "center",
          background:
            "radial-gradient(1000px 300px at 50% -10%, rgba(147, 197, 114, 0.18), transparent)",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center">
            <Chip
              icon={<VerifiedIcon />}
              label="Built for real policy work"
              color="success"
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{ lineHeight: 1.1, letterSpacing: "-0.5px" }}
              gutterBottom
            >
              Policy Tracker
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              maxWidth="md"
              sx={{ mb: 2 }}
            >
              Search, compare, and analyze climate policies and related news with
              a clean, data-driven interface.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={1}>
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
              >
                Browse Policies
              </Button>
              <Button
                component={RouterLink}
                to="/methodology"
                variant="outlined"
                size="large"
                startIcon={<InsightsIcon />}
              >
                View Methodology
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              mt={2}
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ShieldIcon fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Transparent sources
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SpeedIcon fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Fast filtering
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimelineIcon fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Always improving
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <SectionDivider />

      {/* About */}
      <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                About the Platform
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                Policy Tracker helps students, policymakers, and researchers cut
                through noise and focus on what matters: the policies themselves
                and how they evolve. We aggregate curated policy records and
                classify policy-relevant news, then present it in a way that’s
                fast to browse and simple to compare.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip icon={<PolicyIcon />} label="Policy-first" />
                <Chip icon={<PublicIcon />} label="Global scope" />
                <Chip icon={<InsightsIcon />} label="Actionable insights" />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  What’s inside
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5}>
                    <CompareArrowsIcon />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Structured policy records
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Filter by sector, type, and jurisdiction; drill down to
                        policy details.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <SpeedIcon />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Fast search & filtering
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Optimized list and detail views to get you answers
                        quickly.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <InsightsIcon />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Policy-relevant news
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        LLM-assisted relevance checks surface policy actions over
                        generic climate headlines.
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <SectionDivider />

      {/* Features */}
      <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            gutterBottom
          >
            Key Features
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={4}
            maxWidth="md"
            sx={{ mx: "auto" }}
          >
            Explore policies across sectors and regions, validate sources, and
            stay current on policy-focused developments.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<SearchIcon />}
                title="Smart Search"
                desc="Search by title and sector with instant filtering and clean, scannable cards."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<CompareArrowsIcon />}
                title="Compare Quickly"
                desc="Side-by-side exploration via consistent schema and well-structured details."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<InsightsIcon />}
                title="Policy News"
                desc="Classifier-filtered headlines emphasize real legislative or regulatory action."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<PolicyIcon />}
                title="Deep Policy Records"
                desc="Policy type, sector, jurisdiction, dates, and status — all in one view."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<TimelineIcon />}
                title="Evolving Dataset"
                desc="News refresh cadence plus periodic policy dataset updates keep things current."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<ShieldIcon />}
                title="Transparent Sources"
                desc="NewsAPI for headlines and Climate Policy Database for policy records."
              />
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            mt={4}
          >
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
            >
              Start Browsing
            </Button>
            <Button
              component={RouterLink}
              to="/methodology"
              variant="outlined"
              size="large"
              startIcon={<InsightsIcon />}
            >
              Read Methodology
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

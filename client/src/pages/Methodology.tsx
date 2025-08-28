import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip,
  Button,
  IconButton,
  Divider,
  Tooltip,
  Collapse,
  Link,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PolicyIcon from "@mui/icons-material/Policy";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorageIcon from "@mui/icons-material/Storage";
import ArticleIcon from "@mui/icons-material/Article";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DnsIcon from "@mui/icons-material/Dns";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Footer from "../components/Footer";
import { motion, useMotionValue, useTransform } from "framer-motion";

// ------------------------------------------
// Small helpers
// ------------------------------------------
const CodeChip: React.FC<{ text: string }> = ({ text }) => (
  <Box
    component="code"
    sx={{
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      px: 1,
      py: 0.5,
      bgcolor: "#f7f7f7",
      border: "1px solid #e6e6e6",
      borderRadius: 1,
      wordBreak: "break-all",
    }}
  >
    {text}
  </Box>
);

const CopyBtn: React.FC<{ text: string; label?: string }> = ({
  text,
  label,
}) => (
  <Tooltip title="Copy to clipboard">
    <IconButton
      size="small"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      <ContentCopyIcon fontSize="small" />
      {label}
    </IconButton>
  </Tooltip>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
    {children}
  </Typography>
);

// ------------------------------------------
// Main page
// ------------------------------------------
const Methodology: React.FC = () => {
  // Base URL hint for display
  const baseUrlHint = useMemo(() => {
    // @ts-ignore
    const base = axios.defaults?.baseURL as string | undefined;
    return base || "http://localhost:3001/api";
  }, []);

  const ENDPOINTS = {
    policies: "/policies",
    policyNews: "/policy-news",
  };

  // Expand toggles
  const [openNews, setOpenNews] = useState(true);
  const [openPolicies, setOpenPolicies] = useState(true);

  
  const rowVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ bgcolor: "#edf5ed" }}>
      {/* Hero */}
      <Box
        component={motion.section}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          py: { xs: 5, md: 8 },
          background:
            "radial-gradient(1200px 360px at 50% -10%, rgba(147, 197, 114, 0.18), transparent)",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Chip icon={<VerifiedIconShim />} label="Transparent & Reproducible" color="success" variant="outlined" />
            <Typography variant="h3" fontWeight={900}>
              Methodology
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md">
              Exactly how we source, filter, and serve policy data — with a clear,
              auditable pipeline.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Data Sources (interactive cards) */}
      <Box component="section" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <SectionTitle>Data Sources</SectionTitle>
          <Grid container spacing={3}>
            {/* NewsAPI */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#e9f5eb",
                        border: "1px solid #d0e7d3",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ArticleIcon />
                    </Box>
                  }
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        Policy News
                      </Typography>
                      <Chip label="NewsAPI" size="small" />
                    </Stack>
                  }
                  subheader="Topic queries such as “climate policy”, “carbon tax”, “ETS”, “renewable subsidy”."
                  action={
                    <IconButton onClick={() => setOpenNews((s) => !s)}>
                      {openNews ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                  }
                />
                <Collapse in={openNews} timeout="auto" unmountOnExit>
                  <CardContent sx={{ pt: 0 }}>
                    <Stack spacing={1.25}>
                      <Typography variant="body2" color="text.secondary">
                        Normalized fields: <em>title</em>, <em>description</em>, <em>content</em>, <em>author</em>, <em>source</em>, <em>url</em>, <em>urlToImage</em>, <em>publishedAt</em>.
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <CodeChip text={`${baseUrlHint}${ENDPOINTS.policyNews}`} />
                        <CopyBtn text={`${baseUrlHint}${ENDPOINTS.policyNews}`} />
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          href={`${baseUrlHint}${ENDPOINTS.policyNews}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </Button>
                      </Stack>
                      <Typography variant="body2">
                        Source:{" "}
                        <Link href="https://newsapi.org/" target="_blank" rel="noreferrer">
                          newsapi.org
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>

            {/* Climate Policy Database */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 }}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#e9f5eb",
                        border: "1px solid #d0e7d3",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <PolicyIcon />
                    </Box>
                  }
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        List of Climate Policies
                      </Typography>
                      <Chip label="Climate Policy Database" size="small" />
                    </Stack>
                  }
                  subheader="Structured records: title, description, sector, type, jurisdiction, dates, status, stringency, etc."
                  action={
                    <IconButton onClick={() => setOpenPolicies((s) => !s)}>
                      {openPolicies ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                  }
                />
                <Collapse in={openPolicies} timeout="auto" unmountOnExit>
                  <CardContent sx={{ pt: 0 }}>
                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <CodeChip text={`${baseUrlHint}${ENDPOINTS.policies}`} />
                        <CopyBtn text={`${baseUrlHint}${ENDPOINTS.policies}`} />
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          href={`${baseUrlHint}${ENDPOINTS.policies}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </Button>
                      </Stack>
                      <Typography variant="body2">
                        Source:{" "}
                        <Link
                          href="https://climatepolicydatabase.org/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          climatepolicydatabase.org
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Pipeline (1 row, animated steps, no arrows) */}
      <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: "#f7faf7" }}>
        <Container maxWidth="lg">
          <SectionTitle>Processing Pipeline</SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Articles flow through four sequential stages.
          </Typography>

          <Stack
            component={motion.div}
            variants={rowVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
          >
            <PipelineStep
              step="1"
              title="Fetch"
              desc="Pull articles via NewsAPI. Normalize & canonicalize URLs to dedupe."
              icon={<ArticleIcon />}
            />
            <PipelineStep
              step="2"
              title="Classify"
              desc="Gemini model labels relevance to climate policy (laws, regulations, ETS, subsidies, diplomacy)."
              icon={<AutoAwesomeIcon />}
            />
            <PipelineStep
              step="3"
              title="Persist"
              desc="MongoDB upsert by canonical URL. Store scores, rationale, and ingestion time."
              icon={<StorageIcon />}
            />
            <PipelineStep
              step="4"
              title="Serve"
              desc="API endpoints provide relevant news and policy lists to the UI, with pagination and sorting."
              icon={<DnsIcon />}
            />
          </Stack>
        </Container>
      </Box>

      {/* API (hover-elevating cards) */}
      <Box component="section" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <SectionTitle>API Endpoints</SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ApiCard
                title="GET /api/policy-news"
                desc="Returns policy-relevant news (relevance=1), typically sorted by publishedAt DESC; supports pagination."
                url={`${baseUrlHint}${ENDPOINTS.policyNews}`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ApiCard
                title="GET /api/policies"
                desc="Returns the list of climate policies from the database, supporting client-side filtering and search."
                url={`${baseUrlHint}${ENDPOINTS.policies}`}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Assumptions & Controls */}
      <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: "#f7faf7" }}>
        <Container maxWidth="lg">
          <SectionTitle>Assumptions & Quality Controls</SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <BulletCard
                title="Quality & Bias"
                bullets={[
                  "Relevance threshold defaults to 0.6 (configurable).",
                  "Borderline content needs explicit policy linkage to pass.",
                  "Mix of outlets via NewsAPI; manual spot-checks recommended.",
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <BulletCard
                title="Reproducibility & Security"
                bullets={[
                  "Stable prompt/model for consistent outputs (store score + rationale).",
                  "Environment-based config: GEMINI_MODEL, RELEVANCE_THRESHOLD, MONGO_URI, DB_NAME, COLLECTION_NAME.",
                  "Never commit API keys; respect rate limits.",
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

// ------------------------------------------
// Subcomponents
// ------------------------------------------
const VerifiedIconShim = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2l2.39 4.84L20 8.27l-3.9 3.8L17.3 18 12 15.45 6.7 18l1.2-5.93L4 8.27l5.61-.43L12 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const PipelineStep: React.FC<{
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = ({ step, title, desc, icon }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [0, 1], [6, -6]);
  const rotateY = useTransform(mx, [0, 1], [-6, 6]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onMouseMove={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mx.set(x);
        my.set(y);
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.setProperty("--mx", "50%");
        el.style.setProperty("--my", "50%");
      }}
      // motion styles go on the wrapper (not the MUI Card)
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      } as any}  // framer's MotionValue types are fine; cast avoids CSSProperties complaints
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.995 }}
    >
      <Card
        sx={{
          position: "relative",
          flex: 1,
          minWidth: 220,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          p: 2.5,
          background: "#fff",
          overflow: "hidden",
          // soft glow that follows the cursor (uses --mx/--my from wrapper)
          "&:before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: 3,
            pointerEvents: "none",
            background:
              "radial-gradient(380px 180px at var(--mx, 50%) var(--my, 50%), rgba(56,142,60,0.14), transparent 60%)",
          },
        }}
      >
        <Box component={motion.div} style={{ transform: "translateZ(24px)" }}>
          <Stack spacing={1.25}>
            <Chip
              label={`Step ${step}`}
              size="small"
              color="success"
              sx={{ alignSelf: "flex-start" }}
              component={motion.div}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: 0.05 }}
            />
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                component={motion.div}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "#e9f5eb",
                  border: "1px solid #d0e7d3",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {icon}
              </Box>
              <Typography variant="h6" fontWeight={800}>
                {title}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {desc}
            </Typography>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};
const ApiCard: React.FC<{ title: string; desc: string; url: string }> = ({
  title,
  desc,
  url,
}) => (
  <Card
    component={motion.div}
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35 }}
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
    sx={{
      borderRadius: 3,
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <CardHeader
      avatar={
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "#e9f5eb",
            border: "1px solid #d0e7d3",
            display: "grid",
            placeItems: "center",
          }}
        >
          <DataObjectIcon />
        </Box>
      }
      title={<Typography variant="h6" fontWeight={700}>{title}</Typography>}
      subheader={desc}
    />
    <CardContent sx={{ pt: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <CodeChip text={url} />
        <CopyBtn text={url} />
        <Button
          size="small"
          variant="text"
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          Open
        </Button>
      </Stack>
    </CardContent>
  </Card>
);

const BulletCard: React.FC<{ title: string; bullets: string[] }> = ({
  title,
  bullets,
}) => (
  <Card
    component={motion.div}
    whileHover={{ y: -3 }}
    transition={{ duration: 0.2 }}
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid rgba(0,0,0,0.06)",
      background: "#fff",
      height: "100%",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "#e9f5eb",
          border: "1px solid #d0e7d3",
        }}
      >
        <InsightsIcon />
      </Box>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
    <Divider sx={{ mb: 1.5 }} />
    <Stack spacing={1}>
      {bullets.map((b, i) => (
        <Typography key={i} variant="body2" color="text.secondary">
          • {b}
        </Typography>
      ))}
    </Stack>
  </Card>
);

export default Methodology;

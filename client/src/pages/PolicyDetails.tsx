import React, { useEffect, useMemo, useState } from "react";
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
  Breadcrumbs,
  Link as MUILink,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useParams, Link as RouterLink, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PolicyIcon from "@mui/icons-material/Policy";
import { api } from "../services/api";

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
  impact_indicators?: string;
  reference?: string;
  last_update?: string;
};

// --- helpers ---
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

// Extract a usable date string from messy inputs (HTML, ISO, DD/MM/YYYY, etc.)
const extractDateString = (v?: string) => {
  if (!v) return undefined;

  // 1) If it’s an HTML <time ...> element, grab the datetime attr
  const m = v.match(/datetime\s*=\s*"([^"]+)"/i);
  if (m?.[1]) return m[1];

  // 2) Strip any HTML tags and trim
  const plain = v.replace(/<[^>]*>/g, "").trim();
  if (!plain) return undefined;

  // 3) If DD/MM/YYYY, convert to ISO-like for safe parsing
  const ddmmyyyy = plain.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyyRaw] = ddmmyyyy;
    const yyyy = yyyyRaw.length === 2 ? `20${yyyyRaw}` : yyyyRaw; // naive 2-digit year -> 20YY
    // Return ISO-ish string so new Date() is reliable in all browsers
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T00:00:00Z`;
  }

  // 4) Otherwise return as-is (handles ISO, RFC strings, etc.)
  return plain;
};

// Force stable dd/mm/yyyy output no matter the locale
const formatDate = (v?: string) => {
  const s = extractDateString(v);
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s; // fallback to original text if unparsable

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const isUrlLike = (s?: string) => !!s && /^https?:\/\//i.test(s);

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

const statusColor = (status?: string): ChipColor => {
  if (!status) return "default";
  const s = status.toLowerCase();
  if (s.includes("in force") || s.includes("active")) return "success";
  if (s.includes("draft") || s.includes("proposed")) return "warning";
  if (s.includes("expired") || s.includes("repealed")) return "default";
  return "info";
};

const chipList = (items: string[], emptyText = "—") =>
  items.length ? (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map((x) => (
        <Chip key={x} label={x} size="small" />
      ))}
    </Stack>
  ) : (
    <Typography variant="body2">{emptyText}</Typography>
  );

const sectionTitle = (text: string) => (
  <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1 }}>
    <InfoOutlinedIcon fontSize="small" />
    <Typography variant="h6">{text}</Typography>
  </Stack>
);

const PolicyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get<Policy>(`/policies/${id}`)
      .then((res) => !cancelled && setData(res.data))
      .catch((e) => !cancelled && setErr(e?.response?.data?.message || "Failed to load policy"))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [id]);

  const sectors = useMemo(
    () =>
      (data?.sector || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [data?.sector]
  );

  const instruments = useMemo(
    () =>
      (data?.policy_instrument || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [data?.policy_instrument]
  );

  const title = data?.policy_title || data?.policy_name || "Policy";
  const shareUrl =
    typeof window !== "undefined" ? window.location.origin + location.pathname : "";

  // Narrow the reference URL to a non-undefined string for <a> usage
  const refUrl = useMemo(() => {
    if (isUrlLike(data?.reference)) {
      return data!.reference as string;
    }
    return null;
  }, [data?.reference]);

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
        <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to list
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f7faf7", minHeight: "100vh", pb: 8 }}>
      {/* Hero Header */}
      <Box
        sx={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.00) 100%), #e8f3e8",
          borderBottom: "1px solid #dbe8d9",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }} separator="›">
            <MUILink component={RouterLink} to="/" underline="hover" color="inherit">
              Policies
            </MUILink>
            <Typography color="text.primary" noWrap maxWidth="60%">
              {title}
            </Typography>
          </Breadcrumbs>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <PolicyIcon fontSize="small" />
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {title}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data.country && (
                  <Chip
                    icon={<PlaceOutlinedIcon />}
                    label={data.country}
                    size="small"
                    variant="outlined"
                  />
                )}
                {data.country_iso && <Chip label={data.country_iso} size="small" />}
                {data.policy_status && (
                  <Chip
                    label={data.policy_status}
                    size="small"
                    color={statusColor(data.policy_status)}
                    variant="filled"
                  />
                )}
                {data.stringency && (
                  <Chip icon={<LocalOfferOutlinedIcon />} label={data.stringency} size="small" />
                )}
                {data.policy_type && (
                  <Chip icon={<CategoryOutlinedIcon />} label={data.policy_type} size="small" />
                )}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              {refUrl && (
                <Button
                  component="a"
                  href={refUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                >
                  Open Reference
                </Button>
              )}
              <Tooltip title="Copy link">
                <IconButton
                  onClick={() => {
                    try {
                      navigator.clipboard?.writeText(shareUrl);
                    } catch (_) {
                      /* no-op */
                    }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                component={RouterLink}
                to="/"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Left: Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #e5efe4" }}>
              <CardContent>
                {sectionTitle("Overview")}
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {data.policy_description || "—"}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {sectionTitle("Objectives & Impacts")}
                {row("Objective", data.policy_objective)}
                {row("Impact Indicators", data.impact_indicators)}
                {row("High Impact", data.high_impact)}

                <Divider sx={{ my: 3 }} />

                {sectionTitle("Instruments & Sectors")}
                {row("Instruments", chipList(instruments))}
                {row("Sectors", chipList(sectors))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Sticky Meta */}
          <Grid item xs={12} md={4}>
            <Stack position={{ md: "sticky" }} top={{ md: 16 }} spacing={2}>
              <Card sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #e5efe4" }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <EventOutlinedIcon fontSize="small" />
                    <Typography variant="h6">Dates</Typography>
                  </Stack>
                  {row("Decision Date", formatDate(data.decision_date))}
                  {row("Start Date", formatDate(data.start_date))}
                  {row("End Date", formatDate(data.end_date))}
                  {row("Last Update", formatDate(data.last_update))}
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #e5efe4" }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <PlaceOutlinedIcon fontSize="small" />
                    <Typography variant="h6">Jurisdiction</Typography>
                  </Stack>
                  {row("Country", data.country)}
                  {row("ISO", data.country_iso)}
                  {row("Jurisdiction", data.jurisdiction)}
                  {row("Supranational Region", data.supranational_region)}
                  {row("Subnational Region", data.subnational_region)}
                  {row("City/Local", data.policy_city_or_local)}
                </CardContent>
              </Card>

              {refUrl ? (
                <Button
                  fullWidth
                  component="a"
                  href={refUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                >
                  Open Source / Reference
                </Button>
              ) : (
                <Button fullWidth variant="outlined" disabled>
                  No External Reference
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PolicyDetails;

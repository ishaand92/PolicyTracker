import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Box, Card, CardContent, Typography, TextField, MenuItem, Select,
  InputLabel, FormControl, Container, Stack, CardActions, Button,
  CardActionArea, Skeleton, Pagination, IconButton, Tooltip, Paper, Divider
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { Link as RouterLink } from "react-router-dom";

export type Policy = {
  _id: string;
  policy_title: string;
  policy_description: string;
  sector: string;
  policy_type?: string;
  policy_reference?: string;
};

type PolicyResponse = {
  items: Policy[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

type ViewMode = "grid" | "list";

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (category) params.set("sector", category);
    params.set("page", String(page));
    params.set("limit", "24");
    params.set("sort", "last_update:-1");

    api.get<PolicyResponse>(`/policies?${params.toString()}`)
      .then(res => {
        if (cancelled) return;
        const payload = res.data;
        setPolicies(payload.items || []);
        setTotalPages(payload.totalPages || 1);

        const unique = Array.from(
          new Set(
            (payload.items || []).flatMap((p) =>
              p.sector ? p.sector.split(",").map((s) => s.trim()).filter(Boolean) : []
            )
          )
        ).sort((a, b) => a.localeCompare(b));
        setCategories(prev => {
          const merged = Array.from(new Set([...prev, ...unique]));
          return merged.sort((a, b) => a.localeCompare(b));
        });
      })
      .catch(err => {
        if (!cancelled) console.error("❌ Failed to fetch policies:", err);
      })
      .then(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQ, category, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category]);

  const firstRefUrl = (s?: string) => {
    if (!s) return null;
    const m = s.match(/https:\/\/[^\s"]+/);
    return m ? m[0] : null;
  };

  return (
    <Box sx={{ bgcolor: "#edf5ed", pb: 6, minHeight: "100vh" }}>
      {/* Sticky Filter Bar */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#e3f2e1", borderBottom: "1px solid #c8dcc4", py: 2 }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              label="Search Policies"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              size="small"
            />
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* View toggle on the right */}
            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <Tooltip title="Grid view">
                <IconButton
                  onClick={() => setView("grid")}
                  color={view === "grid" ? "primary" : "default"}
                  aria-label="grid view"
                  size="small"
                >
                  <GridViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="List view">
                <IconButton
                  onClick={() => setView("list")}
                  color={view === "list" ? "primary" : "default"}
                  aria-label="list view"
                  size="small"
                >
                  <TableRowsIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {view === "grid" ? (
          // -------- GRID VIEW (your current cards) --------
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
            gap={3}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}><CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={72} sx={{ mt: 1 }} />
                  </CardContent></Card>
                ))
              : policies.map((policy) => (
                  <Card key={policy._id} sx={{ display: "flex", flexDirection: "column" }}>
                    <CardActionArea component={RouterLink} to={`/policies/${policy._id}`}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {policy.policy_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1} noWrap>
                          {policy.sector}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {policy.policy_description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions sx={{ mt: "auto", pt: 0, px: 2, pb: 2 }}>
                      <Button component={RouterLink} to={`/policies/${policy._id}`} size="small" variant="outlined">
                        View details
                      </Button>
                      {(() => {
                        const url = firstRefUrl(policy.policy_reference);
                        return url ? (
                          <Button
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                          >
                            Open Source / Reference
                          </Button>
                        ) : null;
                      })()}
                    </CardActions>
                  </Card>
                ))
            }
          </Box>
        ) : (
          // -------- LIST VIEW (compact rows) --------
          <Paper variant="outlined">
            {loading ? (
              <Box p={2}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Box key={i}>
                    <Stack direction="row" spacing={2} alignItems="center" py={1.25}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box flex={1}>
                        <Skeleton variant="text" width="40%" height={22} />
                        <Skeleton variant="text" width="70%" />
                      </Box>
                    </Stack>
                    <Divider />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box>
                {policies.map((p) => (
                  <Box key={p._id}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      px={2}
                      py={1.25}
                    >
                      <Box flex={1} minWidth={0}>
                        <Typography
                          component={RouterLink}
                          to={`/policies/${p._id}`}
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            textDecoration: "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                          title={p.policy_title}
                        >
                          {p.policy_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {p.sector}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.policy_description}
                        </Typography>
                      </Box>

                      {(() => {
                        const url = firstRefUrl(p.policy_reference);
                        return url ? (
                          <Button
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                          >
                            Open Source / Reference
                          </Button>
                        ) : null;
                      })()}
                      <Button
                        component={RouterLink}
                        to={`/policies/${p._id}`}
                        size="small"
                        variant="contained"
                      >
                        View details
                      </Button>
                    </Stack>
                    <Divider />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        )}

        {!loading && policies.length === 0 && (
          <Typography variant="body1" mt={3}>No policies found.</Typography>
        )}

        {!loading && totalPages > 1 && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_, p) => setPage(p)}
              variant="outlined"
              shape="rounded"
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default PolicyList;

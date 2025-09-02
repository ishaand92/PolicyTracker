import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Box, Card, CardContent, Typography, TextField, MenuItem, Select,
  InputLabel, FormControl, Container, Stack, CardActions, Button,
  CardActionArea, Skeleton, Pagination
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export type Policy = {
  _id: string;
  policy_title: string;
  policy_description: string;
  sector: string;
  policy_type?: string;
};

type PolicyResponse = {
  items: Policy[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQ, category, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category]);

  return (
    <Box sx={{ bgcolor: "#edf5ed", pb: 6, minHeight: "100vh" }}>
      {/* Sticky Filter Bar */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#e3f2e1", borderBottom: "1px solid #c8dcc4", py: 2 }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} flexWrap="wrap">
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
          </Stack>
        </Container>
      </Box>

      {/* Policies Grid */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
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
                  </CardActions>
                </Card>
              ))
          }
        </Box>

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

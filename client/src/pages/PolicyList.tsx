import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  CardActions,
  Button,
  CardActionArea,
  Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export type Policy = {
  _id: string;
  policy_title: string;
  policy_description: string;
  sector: string; // comma-separated
  policy_type?: string;
};

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // If you set axios.defaults.baseURL = "http://localhost:3001/api", you can just use `/policies`
        const res = await axios.get<Policy[]>("http://localhost:3001/api/policies");
        if (cancelled) return;

        const data = res.data || [];
        setPolicies(data);

        const unique = Array.from(
          new Set(
            data.flatMap((p) =>
              p.sector ? p.sector.split(",").map((s) => s.trim()).filter(Boolean) : []
            )
          )
        ).sort((a, b) => a.localeCompare(b));
        setCategories(unique);
      } catch (err) {
        console.error("❌ Failed to fetch policies:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPolicies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return policies.filter((policy) => {
      const matchesTitle = (policy.policy_title || "")
        .toLowerCase()
        .includes(q);
      const hasCategory =
        category === "" ||
        (policy.sector || "")
          .split(",")
          .map((s) => s.trim())
          .includes(category);
      return matchesTitle && hasCategory;
    });
  }, [policies, search, category]);

  return (
    <Box sx={{ bgcolor: "#edf5ed", pb: 6, minHeight: "100vh" }}>
      {/* Sticky Filter Bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#e3f2e1",
          borderBottom: "1px solid #c8dcc4",
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
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
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
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={3}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={72} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))
            : filteredPolicies.map((policy) => (
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
                    <Button
                      component={RouterLink}
                      to={`/policies/${policy._id}`}
                      size="small"
                      variant="outlined"
                    >
                      View details
                    </Button>
                  </CardActions>
                </Card>
              ))}
        </Box>

        {!loading && filteredPolicies.length === 0 && (
          <Typography variant="body1" mt={3}>
            No policies found.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default PolicyList;

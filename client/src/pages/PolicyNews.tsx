import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Stack,
  Skeleton,
  CardActionArea,
  CardMedia,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { rootApi } from "../services/api";

type NewsArticle = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  url?: string;
  urlToImage?: string;
  // server may return these if you used the DTO:
  publishedAt?: string | Date | null;
  publishedDate?: string | Date | null;
  publishedAtDisplay?: string; // optional: if controller already formats
};

type ArticleResponse =
  | { items: NewsArticle[]; total: number; page: number; totalPages: number; limit: number }
  | NewsArticle[];

// ---- Date helpers (same spirit as your policy fix) ----
const extractDateString = (v?: string | Date | null) => {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString();
  if (typeof v !== "string") return undefined;

  const m = v.match(/datetime\s*=\s*"([^"]+)"/i);
  if (m?.[1]) return m[1];

  const plain = v.replace(/<[^>]*>/g, "").trim();
  if (!plain) return undefined;

  const ddmmyyyy = plain.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyyRaw] = ddmmyyyy;
    const yyyy = yyyyRaw.length === 2 ? `20${yyyyRaw}` : yyyyRaw;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T00:00:00Z`;
  }
  return plain;
};

const toDate = (v?: string | Date | null): Date | undefined => {
  const s = extractDateString(v);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

// Force stable dd/mm/yyyy
const formatDate = (v?: string | Date | null) => {
  // if server already sent a display string, use it verbatim
  if (typeof v === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;

  const d = toDate(v);
  if (!d) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const PolicyNews: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setPrevIndex(activeIndex);
      setAnimating(true);
      setTimeout(() => {
        setActiveIndex(index);
        setAnimating(false);
      }, 500);
    },
    [activeIndex]
  );

  useEffect(() => {
      let cancelled = false;

      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await rootApi.get<ArticleResponse>("/news", {
            params: { page: 1, limit: 25 },
          });

          if (cancelled) return;
          const items = Array.isArray(res.data) ? res.data : res.data.items;
          setArticles(items || []);
          setActiveIndex(0);
          setPrevIndex(0);
        } catch (e: any) {
          if (!cancelled) setError(e?.message || "Failed to fetch news");
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      load();
      return () => { cancelled = true; };
    }, []);

  useEffect(() => {
    if (!articles.length) return;
    const interval = setInterval(() => {
      goToSlide((activeIndex + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, goToSlide, articles]);

  const isForward = useMemo(
    () => (articles.length ? activeIndex === (prevIndex + 1) % articles.length : true),
    [activeIndex, prevIndex, articles.length]
  );

  // Render states
  if (loading) {
    return (
      <Box sx={{ bgcolor: "#f3f7f3", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={220} sx={{ mb: 4, borderRadius: 2 }} />
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ height: 220 }}>
                  <CardContent>
                    <Skeleton variant="text" height={28} width="80%" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || articles.length === 0) {
    return (
      <Box sx={{ bgcolor: "#f3f7f3", minHeight: "100vh", py: 8 }}>
        <Container maxWidth="lg">
          <Typography color="error" variant="body1">
            {error || "No articles found."}
          </Typography>
        </Container>
      </Box>
    );
  }

  const featured = articles[activeIndex];

  return (
    <Box
      sx={{
        bgcolor: "#f3f7f3",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {/* Headline Carousel */}
        <Box
          sx={{
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            mb: 4,
            minHeight: 260,
            background:
              featured?.urlToImage
                ? "#000"
                : "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0))",
          }}
        >
          {/* Background image if present */}
          {featured?.urlToImage && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${featured.urlToImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.65)",
              }}
            />
          )}

          {/* Sliding text panel */}
          <Box
            key={activeIndex}
            sx={{
              position: "relative",
              p: { xs: 3, md: 5 },
              color: featured?.urlToImage ? "#fff" : "inherit",
              transform: animating
                ? `translateX(${isForward ? "100%" : "-100%"})`
                : "translateX(0%)",
              animation: animating
                ? `${isForward ? "slideInFromRight" : "slideInFromLeft"} 0.5s ease-out forwards`
                : "none",
            }}
          >
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              {featured?.source || "News"}
            </Typography>

            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }} gutterBottom>
              {featured?.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                maxWidth: 900,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                opacity: 0.95,
              }}
            >
              {featured?.description}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {formatDate((featured as any).publishedAtDisplay || featured?.publishedAt || featured?.publishedDate)}
              </Typography>
              {featured?.url && (
                <Button
                  component="a"
                  href={featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                  sx={{ color: featured?.urlToImage ? "#000" : undefined, bgcolor: "#fff" }}
                >
                  Read full story
                </Button>
              )}
            </Stack>
          </Box>

          {/* Dot Navigation */}
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
            }}
          >
            {articles.map((_, i) => (
              <IconButton
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
                sx={{
                  width: 10,
                  height: 10,
                  p: 0,
                  borderRadius: "50%",
                  backgroundColor: i === activeIndex ? "#333" : "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* News Grid (rest of articles) */}
        <Grid container spacing={3}>
          {articles
            .map((a, idx) => ({ a, idx }))
            .filter(({ idx }) => idx !== activeIndex)
            .slice(0, 12)
            .map(({ a }) => {
              const dateStr = formatDate(
                (a as any).publishedAtDisplay || a.publishedAt || a.publishedDate
              );
              return (
                <Grid item xs={12} sm={6} md={4} key={a._id}>
                  <Card
                    sx={{
                      height: 280,
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: "#ffffff",
                      borderRadius: 2,
                    }}
                  >
                    <CardActionArea
                      component={a.url ? "a" : "div"}
                      href={a.url}
                      target={a.url ? "_blank" : undefined}
                      rel={a.url ? "noopener noreferrer" : undefined}
                      sx={{ height: "100%", alignItems: "stretch", display: "flex", flexDirection: "column", textAlign: "left" }}
                    >
                      {a.urlToImage && (
                        <CardMedia
                          component="img"
                          image={a.urlToImage}
                          alt={a.title}
                          sx={{
                            height: 120,
                            objectFit: "cover",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                          }}
                        />
                      )}
                      <CardContent sx={{ flex: 1, width: "100%" }}>
                        <Typography variant="overline" sx={{ opacity: 0.7 }}>
                          {a.source || "News"}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                          {a.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 40,
                          }}
                        >
                          {a.description}
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {dateStr}
                          </Typography>
                          {a.url && (
                            <Typography
                              variant="caption"
                              color="primary"
                              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                            >
                              Open <OpenInNewIcon fontSize="inherit" />
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </Container>

      {/* Slide Animations */}
      <style>
        {`
          @keyframes slideInFromRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0%); opacity: 1; }
          }
          @keyframes slideInFromLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0%); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default PolicyNews;

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  CardActionArea,
  CardMedia,
} from '@mui/material';
import { api } from '../services/api';

type Article = {
  _id: string;
  title: string;
  description?: string | null;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string | null;
  publishedAtDisplay?: string | null;
  source?: string | null;
};

type ApiResponse = {
  items: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const PolicyNews: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (index === activeIndex) return;
    setPrevIndex(activeIndex);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setAnimating(false);
    }, 500);
  }, [activeIndex]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse>('/articles', {
          params: { page: 1, limit: 25 },
        });

        if (cancelled) return;

        const items = (res.data?.items ?? []).map((d: any) => {
          const source =
            typeof d.source === 'string'
              ? d.source
              : d?.source?.name ?? d?.source?.id ?? '';

          return {
            _id: String(d._id),
            title: d.title ?? '(untitled)',
            description: d.description ?? '',
            url: d.url ?? '',
            urlToImage: typeof d.urlToImage === 'string' ? d.urlToImage : undefined,
            publishedAt: d.publishedAt ?? null,
            publishedAtDisplay: d.publishedAtDisplay ?? '',
            source,
          } as Article;
        });

        setArticles(items);
        setActiveIndex(0);
        setPrevIndex(0);
      } catch (e: any) {
        if (!cancelled) {
          const detail = e?.response
            ? `${e.response.status} ${e.response.statusText}`
            : e?.message || 'Network error';
          setErrMsg(`Failed to fetch articles: ${detail}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      goToSlide((activeIndex + 1) % articles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, goToSlide, articles]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (errMsg) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{errMsg}</Alert>
      </Container>
    );
  }
  if (articles.length === 0) return null;

  const isForward = activeIndex === (prevIndex + 1) % articles.length;
  const featured = articles[activeIndex];

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
        {/* Featured Headline Carousel */}
        <Card
          sx={{
            mb: 5,
            borderRadius: 3,
            boxShadow: 3,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            minHeight: { xs: 260, md: 320 },
          }}
          onClick={() => featured.url && window.open(featured.url, '_blank')}
        >
          {featured.urlToImage && (
            <CardMedia
              component="img"
              src={featured.urlToImage}
              alt={featured.title}
              sx={{ height: { xs: 180, md: 240 }, objectFit: 'cover' }}
            />
          )}
          <CardContent
            key={activeIndex}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              bgcolor: 'rgba(0,0,0,0.55)',
              color: '#fff',
              p: 3,
              transform: animating
                ? `translateX(${isForward ? '100%' : '-100%'})`
                : 'translateX(0%)',
              animation: animating
                ? `${isForward ? 'slideInFromRight' : 'slideInFromLeft'} 0.5s ease-out forwards`
                : 'none',
            }}
          >
            <Typography variant="overline">
              {(featured.source ? String(featured.source) : '')}
              {featured.source ? ' • ' : ''}{featured.publishedAtDisplay ?? ''}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {featured.title}
            </Typography>
            <Typography variant="body2" mt={1} sx={{ display: { xs: 'none', sm: '-webkit-box' }, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {featured.description}
            </Typography>
          </CardContent>

          {/* Dot Navigation */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
            }}
          >
            {articles.map((_, i) => (
              <IconButton
                key={i}
                size="small"
                onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.6)',
                  border: '1px solid #ddd',
                  '&:hover': { backgroundColor: '#ccc' },
                }}
              />
            ))}
          </Box>
        </Card>

        {/* Grid of more articles */}
        <Grid container spacing={3}>
          {articles.slice(1).map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              >
                <CardActionArea
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  onClick={() => a.url && window.open(a.url, '_blank')}
                >
                  {a.urlToImage && (
                    <CardMedia
                      component="img"
                      src={a.urlToImage}
                      alt={a.title}
                      sx={{ height: 160, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="overline" display="block" gutterBottom>
                      {a.source} • {a.publishedAtDisplay ?? ''}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      noWrap
                      title={a.title}
                    >
                      {a.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {a.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Slide Animations */}
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0%); opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0%); opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default PolicyNews;

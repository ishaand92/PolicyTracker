import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';

type NewsArticle = {
  id: number;
  title: string;
  summary: string;
};

const topNews: NewsArticle[] = [
  {
    id: 1,
    title: 'Carbon Policy Reform Announced',
    summary: 'Sweeping new national policy imposes taxes on carbon emissions to meet net-zero targets by 2040.',
  },
  {
    id: 2,
    title: 'EV Incentives Boost Market',
    summary: 'New subsidies and tax credits are driving record-high electric vehicle adoption rates.',
  },
  {
    id: 3,
    title: 'Plastic Ban Extended Nationwide',
    summary: 'The government expands its single-use plastic ban with strict enforcement and new incentives.',
  },
];

const moreNews: NewsArticle[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 4,
  title: `Sustainable Reform #${i + 4}`,
  summary: `Detailed update on progress of policy initiative #${i + 4}, with wide-ranging sector impacts.`,
}));

const PolicyNews: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goToSlide = React.useCallback((index: number) => {
    if (index === activeIndex) return;
    setPrevIndex(activeIndex);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setAnimating(false);
    }, 500);
  }, [activeIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((activeIndex + 1) % topNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, goToSlide]);

  const isForward = activeIndex === (prevIndex + 1) % topNews.length;

  return (
    <Box
      sx={{
        bgcolor: '#f3f7f3',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {/* Headline Carousel */}
        <Box
          sx={{
            bgcolor: '#e0e0e0',
            p: 5,
            mb: 4,
            borderRadius: 2,
            minHeight: 220,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            key={activeIndex}
            sx={{
              position: 'absolute',
              width: '100%',
              top: 0,
              left: 0,
              p: 5,
              transform: animating
                ? `translateX(${isForward ? '100%' : '-100%'})`
                : 'translateX(0%)',
              animation: animating
                ? `${isForward ? 'slideInFromRight' : 'slideInFromLeft'} 0.5s ease-out forwards`
                : 'none',
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Featured Article: {topNews[activeIndex].title}
            </Typography>
            <Typography variant="body1" mt={2}>
              {topNews[activeIndex].summary}
            </Typography>
          </Box>

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
            {topNews.map((_, i) => (
              <IconButton
                key={i}
                onClick={() => goToSlide(i)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: i === activeIndex ? '#333' : '#bbb',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: '#777',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* News Grid */}
        <Grid container spacing={3}>
          {moreNews.map((news) => (
            <Grid item xs={12} sm={6} md={4} key={news.id}>
              <Card
                sx={{
                  height: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  bgcolor: '#ffffff',
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {news.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {news.summary}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  _id: string;
  title: string;
  description: string;
};

const PolicyNews: React.FC = () => {
  const [news, setArticles] = useState<NewsArticle[]>([]);
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
    axios.get<NewsArticle[]>('/server/scripts/articles.json')
      .then(response => {
        setArticles(response.data);
      })
      .catch(error => {
        console.error('Error fetching news:', error);
      });
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      goToSlide((activeIndex + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, goToSlide, news]);

  if (news.length === 0) {
    return null;
  }

  const isForward = activeIndex === (prevIndex + 1) % news.length;

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
              Featured Article: {news[activeIndex].title}
            </Typography>
            <Typography variant="body1" mt={2}>
              {news[activeIndex].description}
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
            {news.map((_, i) => (
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
          {news.slice(1).map((news) => (
            <Grid item xs={12} sm={6} md={4} key={news._id}>
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
                    {news.description}
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

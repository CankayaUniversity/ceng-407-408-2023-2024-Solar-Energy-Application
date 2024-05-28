import * as React from 'react';
import { useState } from 'react';
import { Box, Grid, Typography, Card, CardActionArea, CardContent, CardMedia, Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { styled } from '@mui/system';
import moresolar from '../../assets/images/moresolar.png';
import moresolarss from '../../assets/images/moresolar.jpeg'; 
import card1 from '../../assets/images/card1.jpeg';
import model2 from '../../assets/images/panelandcard-image/solardeneme2.jpg'; 
import model4 from '../../assets/images/panelandcard-image/solardeneme.jpg'

const cards = [
  {
    title: 'Panels',
    description: 'Find out more >',
    image: moresolar,
  },
  {
    title: 'Solar Academy',
    description: 'Find out more >',
    image: card1,
  },
  {
    title: 'Why SolarApp',
    description: 'Find out more >',
    image: moresolarss,
  },
];

const images = [
  {
    src: model2,
    alt: 'Image 1',
    text: 'Model1 ',
  },
  {
    src: model4,
    alt: 'Image 2',
    text: 'Model2 ',
  },
];

const CardBlog = styled(Card)(({ theme }) => ({
  width: 300,
  height: 300,
  margin: theme.spacing(2),
}));

export default function PostBlog() {
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [thirdCardOpen, setThirdCardOpen] = useState(false);

  const handleOpenDialog = (card) => {
    setSelectedCard(card);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleOpenThirdCard = () => {
    setThirdCardOpen(true);
  };

  const handleCloseThirdCard = () => {
    setThirdCardOpen(false);
  };

  const handleNavigate = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {cards.map((card, index) => (
          <Grid item key={index}>
            <CardBlog>
              <CardActionArea onClick={() => index === 1 ? handleNavigate('https://github.com/CankayaUniversity/ceng-407-408-2023-2024-Solar-Energy-Application/wiki/User-Manual') : index === 2 ? handleOpenThirdCard() : handleOpenDialog(card)}>
                <CardMedia component="img" height="200" image={card.image} alt={card.title} />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </CardBlog>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCard?.title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <img src={image.src} alt={image.alt} style={{ width: '100%', height: 'auto' }} />
                <Typography variant="body1">{image.text}</Typography>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <Button onClick={handleCloseDialog} color="primary">
          Close
        </Button>
      </Dialog>

      <Dialog open={thirdCardOpen} onClose={handleCloseThirdCard} maxWidth="md" fullWidth>
        <DialogTitle>Why SolarApp</DialogTitle>
        <DialogContent>
          <Typography variant="body1">...</Typography>
        </DialogContent>
        <Button onClick={handleCloseThirdCard} color="primary">
          Close
        </Button>
      </Dialog>
    </Box>
  );
}

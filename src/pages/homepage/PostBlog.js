import * as React from 'react';
import { useState } from 'react';
import { Box, Grid, Typography, Card, CardActionArea, CardContent, CardMedia, Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { styled } from '@mui/system';
import image1 from '../../assets/images/cardblog1.png';
import image2 from '../../assets/images/cardblog2.png';
import moresolar from '../../assets/images/moresolar.png';
import moresolarss from '../../assets/images/moresolar.jpeg'; 
import card1 from '../../assets/images/card1.jpeg';
import model1 from '../../assets/images/model1.jpeg'; 
import model2 from '../../assets/images/model2.jpeg'; 

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
    src: model1,
    alt: 'Image 1',
    text: 'Model1 buraya yazı yazılacak',
  },
  {
    src: model2,
    alt: 'Image 2',
    text: 'model2 yazı yazılacak',
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

  const handleOpenDialog = (card) => {
    setSelectedCard(card);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
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
              <CardActionArea onClick={() => index === 1 ? handleNavigate('https://github.com/CankayaUniversity/ceng-407-408-2023-2024-Solar-Energy-Application/wiki/User-Manual') : handleOpenDialog(card)}>
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
    </Box>
  );
}

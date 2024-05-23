import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, IconButton, Grow } from '@mui/material';
import { styled } from '@mui/system';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SecurityIcon from '@mui/icons-material/Security';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import image1 from '../../assets/images/cardblog1.png';
import image2 from '../../assets/images/cardblog2.png';
import image3 from '../../assets/images/panelandcard-image/image3.jpeg';
import image4 from '../../assets/images/panelandcard-image/image4.jpeg';
import image5 from '../../assets/images/panelandcard-image/image5.jpeg';
import image6 from '../../assets/images/panelandcard-image/image6.jpeg';

const data = [
  {
    icon: BatteryChargingFullIcon,
    title: 'More Power',
    description: 'The SolarApp Home Inverters and Power Optimizers deliver more solar energy and more savings.',
    image: image1,
    color: 'red',
  },
  {
    icon: FlashOnIcon,
    title: 'Grid Off. Lights On.',
    description: 'Store more excess energy in your SolarApp Home Battery, and keep the power on during an outage with the Backup Interface.',
    image: image6,
    color: 'blue',
  },
  {
    icon: SecurityIcon,
    title: 'Maximum Safety',
    description: 'Ensure the highest level of safety with advanced protection features integrated into your SolarApp system.',
    image: image3,
    color: 'purple',
  },
  {
    icon: SolarPowerIcon,
    title: 'Smart Battery',
    description: 'Optimize your energy usage with a smart battery that stores solar energy for later use.',
    image: image4,
    color: 'orange',
  },
];

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'left',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const CardBlog = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, []);

  const handleClick = (index) => {
    setSelectedIndex(index);
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {data.map((item, index) => (
            <Grow in={true} timeout={600} key={index}>
              <Item
                onClick={() => handleClick(index)}
                sx={{
                  backgroundColor: selectedIndex === index ? 'white' : 'white',
                  borderColor: selectedIndex === index ? 'primary.main' : 'grey.300',
                  borderWidth: selectedIndex === index ? 2 : 1,
                  borderStyle: 'solid',
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <IconButton>
                    <item.icon fontSize="large" style={{ color: item.color }} />
                  </IconButton>
                  <Typography variant="h6" color={selectedIndex === index ? 'primary' : 'textPrimary'} ml={1}>
                    {item.title}
                  </Typography>
                </Box>
                {selectedIndex === index && (
                  <Typography variant="body1" color="textSecondary" pl={4}>
                    {item.description}
                  </Typography>
                )}
              </Item>
            </Grow>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          {selectedIndex !== null && (
            <Grow in={true} timeout={600}>
              <Box component="img" src={data[selectedIndex].image} alt={data[selectedIndex].title} sx={{ width: '100%', height: 'auto', borderRadius: 1 }} />
            </Grow>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CardBlog;

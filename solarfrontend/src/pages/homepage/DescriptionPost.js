import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/system';
import backgroundImage from '../../assets/images/solar-panels-isolated-from-background-with-copy-space_629685-3221.avif';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.common.white,
}));

function DescriptionPost(props) {
  const { post } = props;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={12}>
        <StyledCard>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 2 }}>
            <Typography component="h2" variant="h4" gutterBottom>
              {post.title}
            </Typography>
            <Typography variant="subtitle1" paragraph>
              {post.description}
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
}

DescriptionPost.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageLabel: PropTypes.string.isRequired,
  }).isRequired,
};

export default DescriptionPost;

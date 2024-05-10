import * as React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { motion } from 'framer-motion';

function Sidebar({ archives, description, social, title }) {
  const linkVariants = {
    hover: { scale: 1.05, color: '#007bff' },
  };

  return (
    <Grid item xs={12} md={4}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.200' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </Paper>
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {/* Archives Grid */}
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            Archives
          </Typography>
          {archives.map((archive) => (
            <motion.div
              whileHover="hover"
              variants={linkVariants}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              key={archive.title}
            >
              <Link
                display="block"
                variant="body1"
                href={archive.url}
                sx={{ textDecoration: 'none', mb: 1, cursor: 'pointer' }}
              >
                {archive.title}
              </Link>
            </motion.div>
          ))}
        </Grid>
        {/* Social Grid */}
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            Social
          </Typography>
          {social.map((network) => (
            <motion.div
              whileHover="hover"
              variants={linkVariants}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              key={network.name}
            >
              <Link
                display="block"
                variant="body1"
                href="#"
                sx={{ mb: 0.5, textDecoration: 'none', cursor: 'pointer' }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <network.icon />
                  <span>{network.name}</span>
                </Stack>
              </Link>
            </motion.div>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

Sidebar.propTypes = {
  archives: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  description: PropTypes.string.isRequired,
  social: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
};

export default Sidebar;

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './Header';
import MainFeaturedPost from './MainFeaturedPost';
import FeaturedPost from './FeaturedPost';
//import Main from './Main';
import Sidebar from './Sidebar';
import Footer from './Footer';
import DescriptionPost from "./DescriptionPost";
import solarPanelImage from '../../assets/images/Solar-panels-on-residential-roof-2.png';
import photo from '../../assets/images/indir.jpeg'
import {CUSTOMERS} from '../../api/api'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";


const sections = [
  { title: 'Technology', url: '#' },
  { title: 'Design', url: '#' },
  { title: 'Culture', url: '#' },
  { title: 'Business', url: '#' },
  { title: 'Politics', url: '#' },
  { title: 'Opinion', url: '#' },
  { title: 'Science', url: '#' },
  { title: 'Health', url: '#' },
  { title: 'Style', url: '#' },
  { title: 'Travel', url: '#' },
];

const mainFeaturedPost = {
  title: "Welcome to SolarApplication",
  description:
    "Solar Application is a website that allows businesses to draw and view maps.",
  image: solarPanelImage,
  imageText: "main image description",
};

const featuredPosts = [
  {
    title: "Contributors",
    description:
      "Berkay Avcı / Yunus Emre Görgü / Erhan Özalp / Yunus Emre Arslan",
    image: photo,
    imageLabel: "Image Text",
  },
];

const descriptionPost = [
  {
    title: "About Us",
    description:
      "In the dynamic landscape of sustainable energy, our innovative solar energy app web page stands as a beacon of progress and efficiency. As the world increasingly pivots towards eco-friendly solutions, harnessing the power of the sun has never been more crucial. Our platform takes center stage, offering a sophisticated and user-friendly experience in the realm of solar panel placement simulations" +
      "Unveiling the Power of Simulation:"+
       "Embark on a journey of precision and optimization with our state-of-the-art solar panel placement simulations. Designed as an effective tool for both novices and experts in the field, our platform allows you to visualize, plan, and perfect your solar energy projects with unparalleled accuracy." +
      "The Green Revolution Unleashed:"+
       "As the demand for clean and natural energy skyrockets, our web-based simulation tool emerges as a game-changer in the realm of sustainable energy. We understand the pivotal role solar energy plays across various sectors, and our simulation technology empowers you to contribute to the green revolution seamlessly."+
       "Key Features That Set Us Apart:Intuitive Design: Navigate effortlessly through our user-friendly interface, tailored to meet the needs of both seasoned professionals and those new to solar energy projects.Optimization Capabilities: Maximize the efficiency of your solar energy projects by experimenting with various panel placements and configurations, ensuring you harness the sun's power to its fullest potential.Data-Driven Insights: Benefit from in-depth analyses and comprehensive reports generated by our simulations. Make informed decisions backed by reliable data to elevate the success of your projects.Real-Time Visualization: Witness the impact of different parameters on solar panel performance in real-time. Our platform allows you to see the immediate effects of your choices, enabling swift adjustments for optimal results.Why Choose Our Solar Energy App Web Page?Commitment to Sustainability: Join us in our commitment to a sustainable future. By utilizing our platform, you actively contribute to reducing the carbon footprint and advancing environmentally friendly practices.Versatility Across Industries: Whether you're a researcher, a professional in the solar energy sector, or an environmental sustainability advocate, our platform caters to a diverse audience, making it a valuable resource for all.Innovation at Your Fingertips: Stay ahead of the curve with our cutting-edge technology. We continuously update our platform to incorporate the latest advancements in solar energy, ensuring you always have access to the most innovative tools.In conclusion, our solar energy app web page is not just a simulation platform; it's a gateway to a sustainable future. Join us in revolutionizing the way solar energy projects are designed and optimized. Empower yourself with the tools needed to make a lasting impact in the field of clean energy production.Experience the future of solar energy simulation—where precision meets sustainability. Visit our website today and be a part of the green energy revolution!",
    image: "images/indir.jpeg",
    imageLabel: "Image Text",
  },
];



const sidebar = {
  title: 'About',
  description:
    'Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.',
  archives: [
    { title: 'March 2020', url: '#' },
    { title: 'February 2020', url: '#' },
    { title: 'January 2020', url: '#' },
    { title: 'November 1999', url: '#' },
    { title: 'October 1999', url: '#' },
    { title: 'September 1999', url: '#' },
    { title: 'August 1999', url: '#' },
    { title: 'July 1999', url: '#' },
    { title: 'June 1999', url: '#' },
    { title: 'May 1999', url: '#' },
    { title: 'April 1999', url: '#' },
  ],
  social: [
    { name: 'GitHub', icon: GitHubIcon },
    { name: 'Twitter', icon: TwitterIcon },
    { name: 'Facebook', icon: FacebookIcon },
  ],
};

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();



export default function Blog() {
  const navigate = useNavigate();

    useEffect(()=>{
      const accestoken = localStorage.getItem("accessToken");
      if (accestoken) {
        console.log("Token alındı:", accestoken); // Konsolda token'ı log'la
        navigate("/paperbase"); // Giriş başarılıysa, kullanıcıyı paperbase sayfasına yönlendir
      }
    },[])

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="Blog" sections={sections} />
        <main>
        <MainFeaturedPost post={mainFeaturedPost} />
          <Grid container spacing={4}>
            {/* Featured Post */}
            <Grid item xs={12} md={12}>
              <FeaturedPost post={featuredPosts[0]} />
            </Grid>

            {/* Description Post */}
            <Grid item xs={12} md={12}>
              <DescriptionPost post={descriptionPost[0]} />
            </Grid>
          </Grid>
          <Grid container spacing={5} sx={{ mt: 3 }}>
            {/* <Main title="From the firehose" posts={posts} /> */}
            <Sidebar
              title={sidebar.title}
              description={sidebar.description}
              archives={sidebar.archives}
              social={sidebar.social}
            />
          </Grid>
        </main>
      </Container>
      <Footer
        title="Footer"
        description="Something here to give the footer a purpose!"
      />
    </ThemeProvider>
  );
}
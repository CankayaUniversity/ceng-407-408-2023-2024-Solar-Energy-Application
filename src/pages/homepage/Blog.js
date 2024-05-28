import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "./Header";
import MainFeaturedPost from "./MainFeaturedPost";
import Footer from "./Footer";
import solarPanelImage from "../../assets/images/Solar-panels-on-residential-roof-2.png";
import photo from "../../assets/images/indir.jpeg";
import { CUSTOMERS } from "../../api/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlogLink from "./BlogLink";
import CardBlog from "./CardBlog";
import VideoBlog from "./VideoBlog";
import PostBlog from "./PostBlog";

const mainFeaturedPost = {
  title: "Welcome to SolarApplication",
  description:
    "Solar Application is a website that allows businesses to draw and view maps.",
  image: solarPanelImage,
  imageText: "main image description",
};

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Blog() {
  const navigate = useNavigate();

  useEffect(() => {
    const accestoken = localStorage.getItem("accessToken");
    if (accestoken) {
      console.log("Token alındı:", accestoken);
      navigate("/paperbase");
    }
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="Blog" />
        <main>
          <MainFeaturedPost post={mainFeaturedPost} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <PostBlog></PostBlog>
            </Grid>
            <Grid item xs={12} md={12}></Grid>
          </Grid>
        </main>
      </Container>
      <VideoBlog></VideoBlog>
      <Container maxWidth="lg">
        <main>
          <Grid item xs={12} md={12}>
            <CardBlog></CardBlog>
          </Grid>
          <Grid item xs={12} md={12}>
            <BlogLink></BlogLink>
          </Grid>
        </main>
      </Container>
      <Footer title="Solar App" />
    </ThemeProvider>
  );
}
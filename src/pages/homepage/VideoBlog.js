import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

// Video dosyasını import edin
import backgroundVideo from "../../assets/images/video.mp4";

const VideoContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100vh",
  overflow: "hidden",
});

const VideoBackground = styled("video")({
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: "translate(-50%, -50%)",
  zIndex: -1,
});

const OverlayText = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "white",
  textAlign: "center",
});

const VideoBlog = () => {
  return (
    <VideoContainer>
      <VideoBackground autoPlay loop muted>
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </VideoBackground>
      <OverlayText>
        <Typography variant="h2" component="div" gutterBottom>
          Better Solar System
        </Typography>
        <Typography variant="h4" component="div">
          SOLAR <span style={{ color: "red" }}>APP</span> Home/Business
        </Typography>
      </OverlayText>
    </VideoContainer>
  );
};
export default VideoBlog;

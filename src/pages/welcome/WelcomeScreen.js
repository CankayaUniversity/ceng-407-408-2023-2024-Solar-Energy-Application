import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import loginCover from "../../assets/images/solarr.webp";
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    height: 100%; // Ensures full height
    width: 100%; // Ensures full width
    overflow: hidden; // Prevents scrollbars
  }
`;
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Icon = styled(animated.div)`
  width: 80px;
  height: 80px;
  background-color: yellow;
  border-radius: 50%;
  box-shadow: 0 0 20px 5px yellow;
  animation: ${pulse} 2s infinite;
`;

const SolarPanelIcon = styled(animated.div)`
  width: 120px; /* wider to resemble a panel */
  height: 60px; /* shorter height */
  background-color: darkslategray; /* darker color for the panel */
  border-radius: 4px; /* slight rounding of corners */
  box-shadow: 0 0 20px 5px darkslategray;
  animation: ${pulse} 2s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* Needed for the lines inside */
  &:before, &:after { /* Adding decorative lines to simulate solar cells */
    content: '';
    position: absolute;
    top: 10%;
    bottom: 10%;
    width: 2px;
    background: silver; /* lighter lines */
  }
  &:before {
    left: 33%;
  }
  &:after {
    left: 66%;
  }
`;

const WelcomeContainer = styled(animated.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-image: url(${loginCover});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  cursor: pointer;
  color: white;
`;

const TextContent = styled.div`
  text-align: center;
  animation: ${fadeIn} 2s ease-out;
`;

const Tagline = styled.h2`
  margin: 20px 0;
  font-size: 24px;
  text-shadow: 2px 2px 4px black;
`;

const ClickToContinue = styled(animated.p)`
  margin-top: 20px;
  font-size: 18px;
  animation: ${pulse} 1.5s ease-in-out infinite;
  cursor: pointer;
`;

const DeveloperInfo = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 14px;
  opacity: 0.8;
`;

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [styles, api] = useSpring(() => ({
    from: { opacity: 1 },
    config: { duration: 3000 }
  }));

  const handleClick = () => {
    api.start({
      to: { opacity: 0 },
      onRest: () => navigate('/blog')
    });
  };

  return (
    <>
    <GlobalStyle />
    <WelcomeContainer style={styles} onClick={handleClick}>
      <Icon color="yellow" /> {/* Sun Icon */}
      
      <TextContent>
        <h1>Welcome to Solar Energy App</h1>
        <Tagline>Powering the Future, One Panel at a Time</Tagline>
        <p>Total Solar Power Generated: 123,456 kWh</p>
        <p>CO2 Emissions Reduced: 78,910 kg</p>
        <p>Learn more about the benefits of solar energy!</p>
        {/* Add more content here */}
      </TextContent>
      
      <ClickToContinue onClick={handleClick}>Click to continue</ClickToContinue>
      
      <DeveloperInfo>Developed by INFINITY INK</DeveloperInfo>
    </WelcomeContainer>
    </>
  );
};

export default WelcomeScreen;

import React, { useState, useEffect } from "react";

import Backdrop from "@material-ui/core/Backdrop";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: "3.5rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#ffffff",
    fontFamily: "'Montserrat', 'Poppins', 'Arial', sans-serif",
    textTransform: "uppercase",
    display: "flex",
    gap: "0.08em",
    marginBottom: "1.5rem",
  },
  letter: {
    opacity: 0,
    transform: "translateY(20px) scale(0.9)",
    animation: "$fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
    display: "inline-block",
  },
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(20px) scale(0.9)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
  },
  "@keyframes fadeOut": {
    "0%": {
      opacity: 1,
      transform: "scale(1)",
    },
    "100%": {
      opacity: 0,
      transform: "scale(0.9) translateY(-10px)",
    },
  },
  letterFadeOut: {
    animation: "$fadeOut 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
  },
  subtitle: {
    fontSize: "0.875rem",
    fontWeight: 300,
    letterSpacing: "0.05em",
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "'Montserrat', 'Poppins', 'Arial', sans-serif",
    textTransform: "uppercase",
    opacity: 0,
    animation: "$subtitleFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.5s forwards",
  },
  "@keyframes subtitleFadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const BackdropLoading = () => {
  const classes = useStyles();
  const text = "LOGICBOX";
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isFadingOut) {
      const fadeOutTimer = setTimeout(() => {
        setDisplayedText("");
        setCurrentIndex(0);
        setIsFadingOut(false);
      }, 700);
      return () => clearTimeout(fadeOutTimer);
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length) {
      const pauseTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000);
      return () => clearTimeout(pauseTimer);
    }
  }, [currentIndex, text, isFadingOut]);

  return (
    <Backdrop className={classes.backdrop} open={true}>
      <div className={classes.loadingContainer}>
        <div className={classes.loadingText}>
          {displayedText.split("").map((letter, index) => (
            <span
              key={index}
              className={`${classes.letter} ${isFadingOut ? classes.letterFadeOut : ""}`}
              style={{
                animationDelay: isFadingOut ? `${index * 0.05}s` : `${index * 0.1}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className={classes.subtitle}>
          Carregando aplicação...
        </div>
      </div>
    </Backdrop>
  );
};

export default BackdropLoading;
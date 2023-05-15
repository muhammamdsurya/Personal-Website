// All options can be found here: https://particles.js.org/docs/interfaces/Options_Interfaces_IOptions.IOptions.html
// The slim version doesn't have the following plugins:
// Absorbers, Emitters, PolygonMask, Interactivity Trail
const options = {
  background: {
    color: "#040404", // the canvas background color
  },
  interactivity: {
    events: {
      onHover: {
        // this handles the mouse hover event
        enable: true,
        mode: "repulse", // this make particles move away from the mouse
      },
    },
    modes: {
      repulse: {
        distance: 100, // the distance of the particles from the mouse
      },
    },
  },
  particles: {
    move: {
      enable: true, // this makes particles move
      speed: { min: 1, max: 3 }, // this is the speed of the particles
    },
    opacity: {
      value: { min: 0.3, max: 0.7 }, // this sets the opacity of the particles
    },
    size: {
      value: { min: 1, max: 3 }, // this sets the size of the particles
    },
    color: {
      value: "#2196f3",
    },
    shape: {
      type: "star",
    },
  },
};

// tsParticles.load has two parameters, the first one is the id of the container, the second one is an object with the options
tsParticles.load("tsparticles", options);

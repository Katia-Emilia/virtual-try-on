# Virtual Glasses Try-On System


  
## Problem Statement

In the current retail environment, consumers face challenges when shopping for eyewear online. Traditional online shopping lacks the tactile experience of trying on glasses, which leads to uncertainty about the fit, style, and overall appearance. This gap between online shopping and physical try-on experiences often results in lower consumer confidence, increased return rates, and dissatisfaction.

## Architecture

### 2.1 User
- Represents the person interacting with the system. Their head movements are captured and fed into the tracking system.

### 2.2 Tracking System
- Receives head movement data from the user.
- Processes this data to extract relevant movement parameters.
- Transmits these parameters to the 3D head model for updating its position and orientation.

**Movement Parameters:**  
Encapsulate the information about the user's head movement, such as position, rotation, and possibly other relevant metrics.

### 2.3 Face Reconstruction
- Takes an image or video input of the user's face.
- Processes this input to generate a 3D model of the user's head.
- This 3D head model serves as the foundation for virtual glasses placement.

### 2.4 3D Head Model of User
- A digital representation of the user's head in three dimensions.
- Updated in real-time based on the head movement parameters received from the tracking system.
- Serves as the canvas for virtual glasses placement.

### 2.5 Display
- The output device where the user views the virtual try-on experience.
- Renders the 3D head model with the virtually placed glasses.
- A digital representation of the glasses being tried on.
- Contains geometric information about the glasses' frame and lenses.

### 2.6 Glasses Fitting System
- Responsible for accurately positioning/rendering the 3D glasses model onto the 3D head model.
- Considers factors like face shape, size, and head orientation for proper fit.

## Data Flow

1. The user's head movements are captured by the tracking system.
2. The tracking system extracts movement parameters and sends them to the 3D head model.
3. The 3D head model is updated based on the received parameters.
4. The glasses fitting system positions the 3D glasses model onto the updated 3D head model.
5. The final scene, including the user's head with the virtually fitted glasses, is rendered on the display.

## Libraries and Dependencies

### TensorFlow.js & FaceMesh

- **TensorFlow.js:** A library for machine learning in JavaScript, enabling the use of models directly in the browser.
- **FaceMesh:** A model by TensorFlow.js specifically for detecting facial landmarks in real-time, such as eyes, nose, and mouth.
  
  In the project, FaceMesh is used to detect the person's face and position the spectacles based on landmarks.

### Three.js

- **Three.js:** A cross-browser JavaScript library and application programming interface used to create and display animated 3D computer graphics in a web browser using WebGL.
  
  Three.js is used to create a 3D scene where virtual glasses are rendered.

## Implementation Steps

   - [Include JavaScript Libraries]
   - [Camera Setup]
   - [Load FaceMesh Model]
   - [Face Detection in Video Stream]
   - [Set Up 3D Glasses Model with Three.js]
   - [Positioning and Manual Rotation of Spectacles]
   - [Render Virtual Try-On]
     
## Prerequisites

Browser that supports WebGL 1.0


## Instructions

Open index.html in your preferred web browser. You can do this by:
Double-clicking the index.html file, which should open it in your default web browser.
Or, right-clicking the index.html file and selecting "Open with" to choose a specific browser.
Alternatively, you can use a local development server to view the site.

## Conclusion

By combining **TensorFlow.js**, the **FaceMesh** model, and **Three.js**, we can develop an engaging virtual glasses try-on web app that offers users a highly immersive and lifelike experience. This technology paves the way for new opportunities in online shopping, enabling customers to virtually try on glasses before making a purchase. As web technologies advance, we can anticipate even more groundbreaking applications that utilize similar technologies.

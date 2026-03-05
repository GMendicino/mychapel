import React from 'react';

export const Panorama: React.FC = () => {
  // Text to Speech
  // const speakText = (elementId: string) => {
  //   const text = document.getElementById(elementId)?.textContent;
  //   if (text) {
  //     const synth = window.speechSynthesis;
  //     synth.cancel(); // Cancel previous speech, if any
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     synth.speak(utterance);
  //   }
  // };

  // //Stop text to speech
  // const stopSpeech = () => {
  //   window.speechSynthesis.cancel();
  // };


  return (
    <div>
      <p style={{ maxWidth: "400px", alignContent: "middle", transform: "translateY(-50%)", marginLeft: "auto", marginRight: "auto" }}>
        This is where the panoramic tour will be displayed. 
      </p>
    </div>
);
}  
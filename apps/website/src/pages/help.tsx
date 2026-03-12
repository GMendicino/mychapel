import React from 'react';
import '../styles/help.css';
import { Footer } from '../components/Footer';

export const HelpPage : React.FC = () => {
  return (
    <div>

      <div className="help-container">
        <main>
          <h1>Help & Support</h1>
          <p>
            Welcome to our help page for the University Chapel!
            Below we will describe how to use our app for anybody struggling.

            <ul> <li>To move to the next room, simply click on the directional arrow—it will seamlessly guide you forward through the space.</li> <li>To learn more about specific artifacts, click on the blue information icons to reveal interesting facts and historical details.</li> </ul>
          </p>

          <section className="tour-image-section">
            <img src={"/images/tutorial.png"} alt="Panoramic tour walkthrough" className="tour-image" />
            <p className="image-caption">
              Step inside the app with our panoramic tutorial view – scroll, click, and interact to explore.
            </p>
          </section>

          <section>
            <h2>Starting Your Journey</h2>
            <p>
              Begin your tour at the Home Screen by pressing the 'Start Tour' Button.
            </p>
          </section>

          <section>
            <h2>Navigating the Website</h2>
            <p>
              At the top right corner of your screen (For Mobiles) there will be 3 lines which will give you a contents page. For Desktops there is a naviagtion bar as displayed in the above photo.
            </p>
          </section>

          <section>
            <h2>Connecting with Your Guide</h2>
            <p>
              Need a helping hand along the way? Reach out to our support team by sending a message to <a href="hans.hones@abdn.ac.uk">hans.hones@abdn.ac.uk</a>—we’re always here to assist.
            </p>
          </section>

          <section>
            <h2>Still Got Questions?</h2>
            <p>
              If your question isn’t answered during the tour, Please leave feedback and we will try our best to fix this issue.
            </p>
          </section>
        </main>
      </div>
      <Footer />
    </div >
  );
};




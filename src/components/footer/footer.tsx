import React from 'react';
import { Link } from 'react-router-dom';
import styles from './footer.module.scss';

const Footer: React.FC  = () => {

  return (
    <>

    <div className={styles.bottomFooter}>
      <div className={styles.container}>
        <div className={styles.footerRow}>
          <div className={styles.footerClm}>
            <h2>Customer Service</h2>
            <ul className={styles.footerMenu}>
              <li>
                <Link to={'https://www.smartliner-usa.com/pages/help-center'}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to={'https://www.smartliner-usa.com/pages/frequently-asked-questions'}>
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to={'https://www.smartliner-usa.com/pages/contact-us'}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className={styles.footerClm}>
            <h2>Information</h2>
            <ul className={styles.footerMenu}>
              <li>
                <Link to={'https://www.smartliner-usa.com/products/floor-liners'}>
                  Information
                </Link>
              </li>
              <li>
                <Link to={'https://www.smartliner-usa.com/pages/our-story'}>
                  Our Story
                </Link>
              </li>
              <li>
                <Link to={'https://www.smartliner-usa.com/pages/our-policies'}>
                  Policies & Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className={`${styles.footerClm} ${styles.footerSocialMediaClm}`}>
            <h2>Follow Us</h2>
            <ul className={styles.footerSocialMedia}>
              <li>
                <Link to={'https://www.facebook.com/SmartlinerUSA/'} target='_blank'>
                  <img src='images/facebook-icon.svg' alt='facebook icon' />
                </Link>
              </li>
              <li>
                <Link to={'https://www.instagram.com/smartlinerusa/?hl=en'} target='_blank'>
                  <img src='images/instagram-icon.svg' alt='instagram icon' />
                </Link>
              </li>
              <li>
                <Link to={'https://www.youtube.com/@smartliner'} target='_blank'>
                  <img src='images/youtube-icon.svg' alt='youtube icon' />
                </Link>
              </li>
              <li>
                <Link to={'https://www.tiktok.com/@smartliner'} target='_blank'>
                  <img src='images/tiktok-icon.svg' alt='tiktok icon' />
                </Link>
              </li>
            </ul>
          </div>
          <div className={`${styles.footerClm} ${styles.footerNewsLetterClm}`}>
            <h2>Sign up for our newsletter</h2>
            <div className={styles.footerNewsLetter}>
              <p>Your Weekly/Monthly Dose of Knowledge and Inspiration</p>
                <form>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter Your Email Address"
                  />
                  <button
                    type="button"
                    className={styles.submitBtn}
                  >
                    Submit
                  </button>
                </form>
            </div>
          </div>
        </div>        
      </div>      
    </div>

    <div className={styles.copyrightPrt}>
      <div className={styles.container}>
        <p>Copyright &copy; {new Date().getFullYear()}, Tour & Travel Pvt. Ltd</p>
      </div>
    </div>

    </>
  );

};

export default Footer;
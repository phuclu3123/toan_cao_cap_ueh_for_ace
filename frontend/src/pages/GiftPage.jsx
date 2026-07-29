import { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Heart, X, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/GiftPage.css';

export default function GiftPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [phase, setPhase] = useState(1); // 1 = Rose Drawing, 2 = Envelope & Heart
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Letter content typing states
  const [typedTitle, setTypedTitle] = useState('');
  const [typedBody, setTypedBody] = useState('');

  const titleText = t.giftPage.letterTitle;
  const bodyText = t.giftPage.letterBody;

  // Typing effect trigger
  useEffect(() => {
    if (!isModalOpen) return undefined;

    let titleIndex = 0;
    let bodyInterval;
    let titleInterval = setInterval(() => {
      if (titleIndex < titleText.length) {
        setTypedTitle((prev) => prev + titleText[titleIndex]);
        titleIndex++;
      } else {
        clearInterval(titleInterval);
        
        // Start typing body
        let bodyIndex = 0;
        bodyInterval = setInterval(() => {
          if (bodyIndex < bodyText.length) {
            setTypedBody((prev) => prev + bodyText[bodyIndex]);
            bodyIndex++;
          } else {
            clearInterval(bodyInterval);
          }
        }, 50); // Speed of body text typing
      }
    }, 100); // Speed of title typing

    return () => {
      clearInterval(titleInterval);
      clearInterval(bodyInterval);
    };
  }, [isModalOpen, titleText, bodyText]);

  const openLetter = () => {
    setTypedTitle('');
    setTypedBody('');
    setIsModalOpen(true);
  };

  // Rose auto-timer fallback to display Click Me
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowClickPrompt(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`gift-page-wrapper phase-${phase}`}>
      {/* Back button */}
      <Link to="/" className="gift-btn-back">
        <ArrowLeft size={16} />
        <span>{t.giftPage.btnBack}</span>
      </Link>

      {/* PHASE 1: THE GROWING ROSE */}
      {phase === 1 && (
        <div className="rose-phase-container container">
          <div className="rose-svg-wrapper" onClick={() => setPhase(2)}>
            <svg viewBox="0 0 512 512" className="rose-svg">
              <path 
                className="leafOne animate-path" 
                d="M124.302,328.222c-2.466-2.901-5.036-5.334-7.648-7.212c-1.884-1.354-4.49-1.207-6.201,0.36
                   c-32.608,29.866-18.892,84.017,24.01,94.752c2.251,0.563,4.612-0.548,5.624-2.636c0.407-0.841,0.781-1.732,1.138-2.648
                   C111.438,394.378,103.302,355.204,124.302,328.222z" 
              />
              <path 
                className="stickLine animate-path"
                d="M337.625,212.314c2.37-3.44,1.501-8.149-1.939-10.519c-3.44-2.369-8.15-1.501-10.519,1.939
                   c-19.493,28.304-43.492,60.076-72.147,92.853l-2.542-30.875c-0.343-4.163-4-7.261-8.158-6.917c-4.163,0.343-7.26,3.995-6.917,8.158
                   l3.721,45.196C172.176,385.546,93.558,449.444,4.053,496.37c-3.699,1.94-5.127,6.512-3.187,10.211
                   c1.352,2.579,3.983,4.054,6.705,4.054c1.183,0,2.385-0.279,3.505-0.867c63.84-33.47,124.784-76.962,181.511-129.479
                   c5.891-2.031,32.15-10.225,68.671-8.819c4.156,0.167,7.689-3.09,7.85-7.266c0.161-4.174-3.092-7.689-7.267-7.849
                   c-18.678-0.721-34.824,0.89-47.384,3.036C259.688,314.785,301.126,265.31,337.625,212.314z" 
              />
              <path 
                className="leafTwo animate-path" 
                d="M329.58,413.715c30.055,1.827,57.188-13.413,71.993-37.343c1.738-2.81,1.253-6.495-1.142-8.771
                   c-13.04-12.394-37.78-21.675-66.625-23.428s-54.527,4.464-68.972,15.187c-2.653,1.969-3.581,5.568-2.196,8.568
                   C274.438,393.475,299.525,411.888,329.58,413.715z" 
              />
              <path 
                className="leafS1 animate-path" 
                d="M370.677,231.945c-8.984-2.411-17.479-7.138-24.516-14.205c-5.085-5.106-8.742-10.981-11.143-17.242
                   c-6.645,0.902-13.554,0.516-20.475-1.491c-9.578-2.778-17.805-7.959-24.234-14.68c-12.216,1.01-22.611,4.593-28.859,9.642
                   c-1.416,1.145-1.839,3.149-0.999,4.772c7.157,13.821,21.478,23.41,38.131,23.745c11.548,0.232,22.109-4.035,30.031-11.178
                   c-2.461,10.379-1.13,21.692,4.621,31.709c8.293,14.445,23.583,22.401,39.142,22.039c1.826-0.042,3.382-1.376,3.705-3.168
                   C377.509,253.982,375.658,243.144,370.677,231.945z" 
              />
              <path 
                className="rose1 animate-path" 
                d="M508.212,99.848c-2.666-4.581-27.324-44.843-71.558-48.206c-4.268-0.223-8.58-0.164-12.816,0.176
                   l-1.148,0.092l0.471,1.051c7.005,15.648,9.002,31.447,7.106,48.307l0.877,0.04c11.782,0.538,23.679,3.513,35.362,8.841l0.367,0.168
                   l0.355-0.188c10.841-5.728,22.445-6.783,35.477-3.225C506.927,108.058,510.397,103.599,508.212,99.848z" 
              />
              <path 
                className="rose2 animate-path" 
                d="M418.642,40.96c-24.19-37.169-71.346-39.455-76.643-39.593c-4.34-0.114-6.582,5.071-3.543,8.22
                   c9.38,9.721,14.029,20.406,14.212,32.665l0.005,0.402l0.324,0.242c13.637,10.194,23.714,22.558,29.944,36.731
                   c4.198,10.201,6.37,19.468,7.545,29.411l0.996-0.402c8.962-3.617,18.525-6.008,28.405-7.105c3.688-0.322,7.481-0.397,11.274-0.223
                   l0.762,0.035C434.378,79.498,430.171,59.623,418.642,40.96z" 
              />
              <path 
                className="rose3 animate-path" 
                d="M343.8,146.676c13.018-17.726,29.06-30.524,47.682-38.039l0.576-0.232
                   c-1.161-9.857-3.49-19.395-7.611-29.408c-20.694-47.084-74.317-58.577-80.363-59.731c-4.853-0.927-8.31,4.471-5.489,8.546
                   c21.533,31.149,7.895,59.383-14.633,90.009l0.071,0.029c-16.953,26.497-7.863,61.237,18.513,76.865
                   c3.932,2.33,8.219,4.207,12.806,5.537c6.757,1.959,13.752,2.469,20.787,1.514l1.017-0.138l-0.367-0.959
                   C330.327,183.817,333.08,162.625,343.8,146.676z" 
              />
              <path 
                className="rose4 animate-path" 
                d="M510.726,141.7c-3.917-4.747-39.75-46.26-91.009-41.792c-21.664,2.405-52.653,12.308-77.277,45.856
                   c-13.392,19.922-16.495,52.272,4.132,72.986c3.371,3.385,7.075,6.243,11.008,8.573c26.325,15.597,61.186,6.961,76.309-20.683
                   l0.077,0.062c15.307-34.399,34.961-59.933,71.9-56.082C510.802,151.136,513.867,145.507,510.726,141.7z" 
              />
            </svg>
            
            {showClickPrompt && (
              <p className="click-prompt-text animate-pulse">
                <Gift className="icon-gift" />
                <span>{t.giftPage.rosePrompt}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: VALENTINE ENVELOPE AND TYPING SVG HEART */}
      {phase === 2 && (
        <div className="envelope-phase-container">
          
          {/* Animated SVG path with typed text on it */}
          <div className="typing-svg-container">
            <svg viewBox="-120 -30 240 180" className="heart-text-svg">
              <defs>
                {/* Standard SVG heart path */}
                <path 
                  id="shape" 
                  d="M0, 21.054 
                     C0, 21.054 24.618, -15.165 60.750, 8.554 
                     C93.249, 29.888 57.749, 96.888 0, 117.388
                     C-57.749, 96.888  -93.249, 29.888 -60.750, 8.554
                     C-24.618, -15.165  -0, 21.054 -0, 21.054z" 
                />
              </defs>
              <text dy="-2">
                <textPath xlinkHref="#shape" className="text-path-animate" startOffset="0%">
                  🌹 Happy Women's Day 🌹 ........................................................................................................ 🌹 From With Love 20/10! 🌹
                </textPath>
              </text>
            </svg>
          </div>

          {/* Envelope Card */}
          <div className="valentines-envelope-wrapper">
            <div 
              className={`valentines-card ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Outer Envelope styling */}
              <div className="envelope-back"></div>
              <div className="envelope-flap"></div>
              <div className="envelope-front"></div>
              
              {/* Floating inner card */}
              <div className="letter-inner-card" onClick={openLetter}>
                <div className="card-message">
                  <span>Happy</span>
                  <br />
                  <span>Women's</span>
                  <br />
                  <span>Day!</span>
                </div>
                <div className="card-heart-icon">
                  <Heart fill="currentColor" size={20} />
                </div>
              </div>
              
              {/* Micro hearts floating up */}
              <div className="floating-hearts">
                <span className="mini-heart h1">❤️</span>
                <span className="mini-heart h2">💖</span>
                <span className="mini-heart h3">💝</span>
                <span className="mini-heart h4">🌸</span>
                <span className="mini-heart h5">🌹</span>
              </div>
            </div>
            <div className="envelope-shadow"></div>
            <p className="envelope-tip-text">{t.giftPage.envelopeTip}</p>
          </div>
        </div>
      )}

      {/* DETAILED LETTER POPUP MODAL */}
      {isModalOpen && (
        <div className="letter-modal-overlay">
          <div className="letter-modal-box glass-panel">
            <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </button>
            
            <div className="letter-modal-dashed-border">
              <div className="heart-stamp stamp-tl"><Heart fill="currentColor" size={14} /></div>
              <div className="heart-stamp stamp-br"><Heart fill="currentColor" size={14} /></div>
              
              <div className="letter-modal-content">
                <h2 className="letter-title">{typedTitle}</h2>
                <p className="letter-body-text">{typedBody}</p>
                
                {/* Cute GIFs and animations inside the letter */}
                <div className="letter-animations-grid">
                  <div className="cat-gif-container left-cat">
                    <img src="/images/mewmew.gif" alt="Cute Cat" className="cat-gif" />
                  </div>
                  
                  <div className="heart-gif-container center-heart animate-float">
                    <img src="/images/heartanimation.gif" alt="Love Heart" className="heart-gif" />
                  </div>
                  
                  <div className="cat-gif-container right-cat">
                    <img src="/images/mewmew.gif" alt="Cute Cat" className="cat-gif" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

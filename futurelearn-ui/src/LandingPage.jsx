import { useState, useEffect, useRef } from 'react';
import React from 'react';

const MODAL_DATA = {
  sessions:   { title: "Gestion de Sessions Temporaires",   body: "L'enseignant peut générer en un clic un espace de cours éphémère. Cela permet de séparer les flux d'interaction par séance, garantissant une organisation claire et un archivage automatique des échanges à la fin de chaque cours." },
  quiz:       { title: "Quiz Interactifs Synchrone",         body: "Inspiré de Kahoot, ce module permet de tester les connaissances en direct. Les étudiants répondent simultanément, et un podium s'affiche après chaque question pour stimuler l'engagement et identifier les notions à réexpliquer." },
  sondages:   { title: "Sondages en Temps Réel",             body: "Idéal pour recueillir l'opinion de la classe ou vérifier le climat d'apprentissage. Les résultats s'affichent sous forme de graphiques dynamiques, permettant à l'enseignant d'ajuster son discours instantanément." },
  anonyme:    { title: "Mur de Questions Anonymes",          body: "La peur de se tromper est le premier frein à l'apprentissage. Notre système permet aux étudiants de poser des questions complexes de manière anonyme, libérant ainsi la parole et favorisant une communication inclusive." },
  stats:      { title: "Analyses Pédagogiques",              body: "Toutes les interactions sont transformées en données exploitables. L'enseignant reçoit un rapport détaillé identifiant les lacunes collectives, permettant une remédiation ciblée et efficace." },
  temps_reel: { title: "La Puissance du Temps Réel",         body: "Contrairement aux forums classiques, LiveInteract utilise la technologie WebSocket pour une réactivité immédiate. L'information circule sans rechargement de page, créant une véritable immersion." },
  autonome:   { title: "Démo de l'Application",              body: "Notre plateforme est Progressive Web App. Elle s'adapte aux connexions limitées et ne nécessite aucun téléchargement sur les stores, facilitant son adoption immédiate en milieu universitaire." },
  simplicite: { title: "Contactez le Support",               body: "Besoin d'une assistance pour déployer LiveInteract dans votre établissement ? Notre équipe vous accompagne pour l'installation technique et la formation des enseignants. Contactez-nous à support@liveinteract.com" },
  securite:   { title: "Sécurité & RGPD",                    body: "Nous appliquons les normes de sécurité les plus strictes. Les données sont cryptées, et nous respectons la vie privée des étudiants en ne collectant que le strict nécessaire pour le suivi pédagogique." },
  universite: { title: "Expertise Enseignement Supérieur",   body: "Conçu spécifiquement pour les grands effectifs des universités, notre outil gère des centaines de connexions simultanées sans ralentissement, idéal pour les amphithéâtres." },
};

const TESTIMONIALS = [
  { img: "/user_elizabeth_smith.jpg", name: "Elizabeth AKANHOU",  role: "Directrice Pédagogique, Alpha School",           quote: "LiveInteract a révolutionné l'engagement de nos étudiants. La plateforme est intuitive et les retours en temps réel sont inestimables pour nos enseignants." },
  { img: "/user_alex_johnson.jpg",    name: "Alex DOSSOU",         role: "Étudiant en Master, Université de Lyon",          quote: "Grâce à LiveInteract, les cours sont beaucoup plus interactifs. Je peux poser mes questions en direct et obtenir des réponses immédiates. C'est génial !" },
  { img: "/user_sophie_martin.jpg",   name: "Sophie AHANDJINOU",   role: "Professeure de Mathématiques, Lycée Condorcet",   quote: "La fonctionnalité de quiz en temps réel est incroyable. Elle me permet de sonder rapidement la compréhension de mes élèves et d'adapter mon enseignement." },
  { img: "/user_david_chen.jpg",      name: "David KOUAME",        role: "Développeur Pédagogique, EdTech Solutions",       quote: "J'apprécie la simplicité d'intégration et la robustesse de LiveInteract. C'est un outil puissant pour créer des expériences d'apprentissage immersives." },
  { img: "/user_maria_gonzales.jpg",  name: "Maria Gonzales",      role: "Responsable Formation, Entreprise Innovante",     quote: "Nos employés sont plus engagés que jamais grâce aux sondages interactifs. LiveInteract nous aide à mesurer l'efficacité de nos formations en direct." },
  { img: "/user_thomas_dupont.jpg",   name: "Thomas KPONDEDJI",    role: "Doctorant en Sciences Sociales, Paris Descartes", quote: "Le système de questions anonymes a libéré la parole dans nos séminaires. Cela encourage la participation de tous, même les plus timides." },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimCard({ children, delay = 0, className = '', style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [modal,          setModal]          = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [counter,        setCounter]        = useState(0);
  const [videoError,     setVideoError]     = useState(false);
  const counterRef  = useRef(null);
  const counterDone = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!counterRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counterDone.current) {
        counterDone.current = true;
        let start = null;
        const animate = (ts) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / 2000, 1);
          setCounter(Math.floor(progress * 15000));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    });
    obs.observe(counterRef.current);
    return () => obs.disconnect();
  }, []);

  const [form,    setForm]    = useState({ nom:'', email:'', message:'' });
  const [sending, setSending] = useState(false);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.message) { alert("Veuillez remplir tous les champs."); return; }
    setSending(true);
    try {
      const res = await fetch('contact_handler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nom=${encodeURIComponent(form.nom)}&email=${encodeURIComponent(form.email)}&message=${encodeURIComponent(form.message)}`
      });
      const result = await res.json();
      if (result.status === 'success') { alert(result.message); setForm({ nom:'', email:'', message:'' }); }
      else alert("Erreur: " + result.message);
    } catch { alert("Une erreur technique est survenue."); }
    finally { setSending(false); }
  };

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };
  const heroTitle = "LIVEINTERACT";

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>
      <style>{`
        :root { --primary:#7b52c8; --primary-dark:#5c3d9e; --primary-lt:#a87de8; --dark2:#525154; --card-bg:#747277; --shadow:0 5px 20px rgba(0,0,0,0.4); --radius:15px; }
        *{box-sizing:border-box;margin:0;padding:0;}
        body,#landing-root{font-family:'Montserrat',sans-serif;line-height:1.6;color:#fff;background:#2d1b69;overflow-x:hidden;}
        a{text-decoration:none;color:#fff;}
        a:hover{text-decoration:underline;}
        ul{list-style:none;padding:0;margin:0;}

        /* PARTICULES */
        .li-particle{position:absolute;border-radius:50%;background:rgba(168,125,232,0.3);animation:floatP linear infinite;}
        @keyframes floatP{0%{transform:translateY(110%) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-10%) rotate(720deg);opacity:0}}

        /* NAVBAR */
        .li-navbar{position:fixed;top:0;left:0;width:100%;background:rgba(20,10,50,0.88);backdrop-filter:blur(18px);border-bottom:1px solid rgba(168,125,232,0.25);z-index:1000;height:70px;display:flex;align-items:center;padding:10px 20px;transition:all .4s;}
        .li-navbar.scrolled{background:rgba(10,5,30,0.97);box-shadow:0 4px 30px rgba(92,61,158,0.5);}
        .li-nav-container{max-width:1200px;margin:0 auto;width:100%;display:flex;justify-content:space-between;align-items:center;}
        .li-nav-logo{height:55px;width:auto;}
        .li-nav-links{display:flex;align-items:center;}
        .li-nav-links li{margin-left:28px;}
        .li-nav-links a{color:rgba(255,255,255,0.85);font-weight:500;font-size:.95rem;padding:5px 0;position:relative;transition:color .25s;}
        .li-nav-links a:hover{color:#fff;text-decoration:none;}
        .li-nav-links a::after{content:'';position:absolute;left:0;bottom:-5px;width:0;height:2px;background:var(--primary-lt);transition:width .3s;}
        .li-nav-links a:hover::after{width:100%;}
        .li-nav-btn{border:2px solid rgba(255,255,255,0.7)!important;padding:6px 16px;border-radius:50px;font-weight:bold;color:#fff!important;background:rgba(255,255,255,0.05);transition:all .25s;}
        .li-nav-btn:hover{background:var(--primary);border-color:var(--primary)!important;text-decoration:none;}
        .li-menu-toggle{display:none;background:none;border:none;font-size:1.8rem;color:#fff;cursor:pointer;}

        /* HERO */
        .li-hero{position:relative;width:100%;min-height:100vh;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;color:white;padding:20px;margin-top:70px;}
        .li-hero-fallback{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#1e1b4b 0%,#3b1f6e 40%,#0f0720 100%);z-index:0;}
        .li-hero-content{position:relative;z-index:2;max-width:900px;}
        .li-hero-title{font-size:5rem;font-weight:900;margin-bottom:20px;display:flex;justify-content:center;flex-wrap:wrap;}
        .li-hero-letter{display:inline-block;opacity:0;transform:translateY(-40px) rotate(-10deg);animation:letterDrop .5s ease forwards;text-shadow:0 0 30px rgba(168,125,232,.8),2px 2px 10px rgba(0,0,0,.8);}
        @keyframes letterDrop{to{opacity:1;transform:translateY(0) rotate(0deg)}}
        .li-hero-subtitle{font-size:1.6rem;font-weight:300;color:rgba(255,255,255,.9);margin-bottom:40px;opacity:0;animation:fadeUp 1s ease 1.4s forwards;}
        .li-hero-btns{margin-top:30px;display:flex;gap:25px;justify-content:center;flex-wrap:wrap;opacity:0;animation:fadeUp 1s ease 1.8s forwards;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

        /* Scroll indicator */
        .li-scroll-indicator{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;animation:fadeUp 1s ease 2.5s forwards;color:rgba(255,255,255,.7);font-size:13px;}
        .li-scroll-mouse{width:26px;height:40px;border:2px solid rgba(255,255,255,.5);border-radius:13px;display:flex;justify-content:center;padding-top:6px;}
        .li-scroll-dot{width:4px;height:8px;background:#fff;border-radius:2px;animation:scrollDot 1.8s ease-in-out infinite;}
        @keyframes scrollDot{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(12px);opacity:.3}}

        /* BTN HERO */
        .li-btn-hero{display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:18px 35px;border-radius:50px;font-weight:800;font-size:1.1rem;text-transform:uppercase;letter-spacing:1px;color:#fff!important;min-width:240px;border:none;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:all .3s cubic-bezier(.175,.885,.32,1.275);cursor:pointer;text-decoration:none;position:relative;overflow:hidden;}
        .li-btn-hero::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,.1);opacity:0;transition:opacity .3s;}
        .li-btn-hero:hover::after{opacity:1;}
        .li-btn-hero:hover{transform:translateY(-6px) scale(1.05);box-shadow:0 20px 50px rgba(92,61,158,.7);text-decoration:none;}
        .li-btn-student{background:linear-gradient(135deg,#5c3d9e,#7b52c8);}
        .li-btn-teacher{background:linear-gradient(135deg,#1e1b4b,#3b2e8f);}
        .li-btn-hero i{font-size:1.4rem;}

        /* SECTIONS */
        .li-section{padding:90px 20px;text-align:center;}
        .li-section>.li-inner{max-width:1200px;margin:0 auto;}
        .li-light{background:rgba(0,0,0,.35);}
        .li-sec-header{margin-bottom:60px;}
        .li-sec-header h2{font-size:3rem;font-weight:bold;margin-bottom:15px;color:#fff;}
        .li-sec-header h2::after{content:'';display:block;width:70px;height:4px;background:linear-gradient(90deg,var(--primary-lt),transparent);border-radius:2px;margin:12px auto 0;}
        .li-sec-header p{font-size:1.2rem;color:rgba(255,255,255,.85);max-width:800px;margin:0 auto;}

        /* CARDS FONCTIONNALITES */
        .li-course-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:26px;text-align:left;}
        .li-course-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:var(--radius);padding:28px;transition:transform .35s,box-shadow .35s,border-color .35s,background .35s;position:relative;overflow:hidden;}
        .li-course-card::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(168,125,232,.12),transparent 60%);opacity:0;transition:opacity .4s;}
        .li-course-card:hover::before{opacity:1;}
        .li-course-card:hover{transform:translateY(-10px) scale(1.02);box-shadow:0 25px 60px rgba(92,61,158,.5);border-color:rgba(168,125,232,.6);}
        .li-course-card h3{font-size:1.4rem;font-weight:bold;color:#fff;margin-bottom:18px;}
        .li-course-card ul{margin-bottom:24px;}
        .li-course-card ul li{font-size:1rem;color:#fff;margin-bottom:10px;position:relative;padding-left:26px;}
        .li-course-card ul li i{color:var(--primary-lt);position:absolute;left:0;top:3px;}
        .li-course-card .li-btn-primary{width:100%;padding:10px 15px;border-radius:8px;}

        /* BTNS */
        .li-btn-primary{display:inline-block;padding:12px 25px;border-radius:50px;font-weight:bold;font-size:1rem;background:linear-gradient(135deg,var(--primary-dark),var(--primary));color:white;border:none;cursor:pointer;transition:all .3s;box-shadow:0 4px 15px rgba(92,61,158,.4);}
        .li-btn-primary:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(92,61,158,.6);color:white;text-decoration:none;}
        .li-btn-secondary{display:inline-block;padding:12px 25px;border-radius:50px;font-weight:bold;font-size:1rem;background:transparent;border:2px solid rgba(255,255,255,.7);color:#fff;cursor:pointer;transition:all .3s;}
        .li-btn-secondary:hover{background:rgba(255,255,255,.15);border-color:#fff;color:white;text-decoration:none;transform:translateY(-3px);}

        /* TUILES */
        .li-tile-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:26px;}
        .li-tile-card{background:linear-gradient(135deg,rgba(92,61,158,.8),rgba(45,27,105,.9));border:1px solid rgba(168,125,232,.3);color:white;border-radius:var(--radius);padding:38px 26px;display:flex;flex-direction:column;align-items:center;transition:transform .35s,box-shadow .35s;box-shadow:0 8px 30px rgba(0,0,0,.3);position:relative;overflow:hidden;}
        .li-tile-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--primary-lt),transparent);transform:scaleX(0);transition:transform .4s;}
        .li-tile-card:hover::after{transform:scaleX(1);}
        .li-tile-card:hover{transform:translateY(-10px) scale(1.03);box-shadow:0 25px 60px rgba(92,61,158,.5);}
        .li-tile-card img{width:70px;height:70px;margin-bottom:20px;filter:invert(1) brightness(1.2);transition:transform .4s;}
        .li-tile-card:hover img{transform:scale(1.15) rotate(5deg);}
        .li-tile-card h3{font-size:1.4rem;font-weight:bold;color:#fff;margin-bottom:14px;text-align:center;}
        .li-tile-card p{font-size:1rem;color:rgba(255,255,255,.9);margin-bottom:22px;text-align:center;}

        /* ETAPES */
        .li-process-step{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:var(--radius);padding:35px 26px;text-align:center;transition:transform .35s,box-shadow .35s;position:relative;}
        .li-process-step:hover{transform:translateY(-10px);box-shadow:0 25px 60px rgba(92,61,158,.5);}
        .li-process-num{position:absolute;top:-16px;left:50%;transform:translateX(-50%);width:32px;height:32px;background:var(--primary-lt);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.95rem;color:white;box-shadow:0 4px 15px rgba(168,125,232,.5);}
        .li-icon-circle{width:76px;height:76px;background:linear-gradient(135deg,var(--primary-dark),var(--primary));border-radius:50%;display:flex;justify-content:center;align-items:center;margin:20px auto 20px;color:white;font-size:2rem;box-shadow:0 8px 24px rgba(92,61,158,.5);animation:pulseIcon 3s ease-in-out infinite;}
        @keyframes pulseIcon{0%,100%{box-shadow:0 8px 24px rgba(92,61,158,.5)}50%{box-shadow:0 8px 40px rgba(168,125,232,.8)}}
        .li-process-step h3{font-size:1.3rem;font-weight:bold;color:#fff;margin-bottom:10px;}
        .li-process-step p{color:rgba(255,255,255,.9);font-size:.95rem;}
        .li-step-arrow{font-size:2rem;color:var(--primary-lt);animation:arrowB 1.5s ease-in-out infinite;}
        @keyframes arrowB{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}

        /* COMPTEUR */
        .li-counter-wrap{margin-bottom:50px;}
        .li-counter-text{font-size:1.4rem;font-weight:300;margin-bottom:8px;color:#fff;}
        .li-counter-num{font-size:5rem;font-weight:900;color:#fff;display:inline-block;animation:counterGlow 2s ease-in-out infinite alternate;}
        @keyframes counterGlow{from{text-shadow:0 0 20px rgba(168,125,232,.5)}to{text-shadow:0 0 60px rgba(168,125,232,1),0 0 100px rgba(168,125,232,.4)}}

        /* TEMOIGNAGES */
        .li-testimonial-wrap{position:relative;max-width:820px;margin:0 auto;}
        .li-testimonial-slider{overflow:hidden;border-radius:20px;}
        .li-testimonial-inner{display:flex;transition:transform .6s cubic-bezier(.4,0,.2,1);}
        .li-testimonial-card{min-width:100%;padding:50px 40px;background:linear-gradient(135deg,rgba(92,61,158,.4),rgba(45,27,105,.6));border:1px solid rgba(168,125,232,.3);border-radius:20px;color:white;text-align:center;backdrop-filter:blur(10px);}
        .li-testimonial-card img{width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:18px;border:3px solid var(--primary-lt);box-shadow:0 0 25px rgba(168,125,232,.5);}
        .li-testimonial-card h3{font-size:1.5rem;font-weight:bold;margin-bottom:4px;color:#fff;}
        .li-testimonial-card .li-role{font-size:.95rem;color:rgba(255,255,255,.75);margin-bottom:22px;}
        .li-testimonial-card blockquote{font-size:1.1rem;line-height:1.8;color:rgba(255,255,255,.95);font-style:italic;}
        .li-carousel-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(168,125,232,.25);border:1px solid rgba(168,125,232,.4);color:white;font-size:1.2rem;width:46px;height:46px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;z-index:10;}
        .li-carousel-nav:hover{background:var(--primary);transform:translateY(-50%) scale(1.1);}
        .li-carousel-prev{left:-62px;}
        .li-carousel-next{right:-62px;}
        .li-carousel-dots{display:flex;justify-content:center;gap:8px;margin-top:18px;}
        .li-carousel-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.3);cursor:pointer;transition:all .3s;}
        .li-carousel-dot.active{background:#fff;transform:scale(1.3);}

        /* CONTACT */
        .li-contact-content{display:grid;grid-template-columns:1fr 1fr;gap:48px;text-align:left;margin-top:40px;align-items:flex-start;}
        .li-contact-info p{font-size:1.05rem;margin-bottom:16px;color:#fff;display:flex;align-items:center;gap:12px;}
        .li-contact-info p i{color:var(--primary-lt);font-size:1.3rem;flex-shrink:0;}
        .li-contact-info a{color:#fff;border-bottom:1px solid rgba(255,255,255,.4);}
        .li-contact-form{display:flex;flex-direction:column;gap:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:var(--radius);padding:34px;backdrop-filter:blur(10px);}
        .li-contact-form input,.li-contact-form textarea{padding:13px;border:1.5px solid rgba(255,255,255,.2);border-radius:10px;font-size:1rem;font-family:'Montserrat',sans-serif;resize:vertical;background:rgba(255,255,255,.06);color:#fff;transition:border-color .3s;}
        .li-contact-form input:focus,.li-contact-form textarea:focus{border-color:#fff;outline:none;box-shadow:0 0 0 3px rgba(255,255,255,.12);}
        .li-contact-form input::placeholder,.li-contact-form textarea::placeholder{color:rgba(255,255,255,.45);}

        /* FOOTER */
        .li-footer{background:#06030f;border-top:1px solid rgba(168,125,232,.2);color:#fff;padding:38px 20px;text-align:center;font-size:.9rem;}
        .li-footer-inner{max-width:1200px;margin:0 auto;}
        .li-footer p{margin-bottom:12px;color:rgba(255,255,255,.8);}
        .li-footer-nav a{color:rgba(255,255,255,.7);margin:0 13px;transition:color .2s;}
        .li-footer-nav a:hover{color:var(--primary-lt);text-decoration:none;}

        /* MODALE */
        .li-modal-overlay{display:none;position:fixed;z-index:3000;left:0;top:0;width:100%;height:100%;background:rgba(5,2,20,.88);backdrop-filter:blur(14px);}
        .li-modal-overlay.open{display:flex;align-items:center;justify-content:center;animation:mFade .3s ease;}
        @keyframes mFade{from{opacity:0}to{opacity:1}}
        .li-modal-box{background:rgba(25,12,60,.97);padding:44px;border-radius:22px;width:90%;max-width:580px;border:1px solid rgba(168,125,232,.35);border-top:4px solid var(--primary-lt);position:relative;box-shadow:0 30px 80px rgba(0,0,0,.7);animation:mSlide .4s cubic-bezier(.175,.885,.32,1.275);}
        @keyframes mSlide{from{transform:translateY(-30px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
        .li-modal-close{position:absolute;right:22px;top:14px;font-size:32px;cursor:pointer;color:rgba(255,255,255,.7);background:none;border:none;transition:color .2s,transform .2s;}
        .li-modal-close:hover{color:#fff;transform:rotate(90deg);}
        .li-modal-box h2{color:#fff;margin-bottom:16px;font-weight:700;font-size:1.5rem;}
        .li-modal-box p{line-height:1.7;color:rgba(255,255,255,.9);font-size:1rem;}

        /* RESPONSIVE */
        @media(max-width:992px){
          .li-nav-links{display:none;flex-direction:column;width:100%;background:rgba(10,5,30,.98);position:absolute;top:70px;left:0;padding-bottom:10px;}
          .li-nav-links.open{display:flex;}
          .li-nav-links li{margin:0;text-align:center;}
          .li-nav-links a{display:block;padding:14px 20px;border-bottom:1px solid rgba(168,125,232,.1);}
          .li-menu-toggle{display:block;}
          .li-hero-title{font-size:3.2rem!important;}
          .li-contact-content{grid-template-columns:1fr;}
          .li-carousel-prev{left:-26px;}
          .li-carousel-next{right:-26px;}
        }
        @media(max-width:768px){
          .li-hero-title{font-size:2.4rem!important;}
          .li-hero-subtitle{font-size:1.1rem!important;}
          .li-sec-header h2{font-size:2.1rem;}
          .li-section{padding:60px 14px;}
          .li-counter-num{font-size:3.5rem;}
          .li-testimonial-card{padding:28px 18px;}
        }
        @media(max-width:480px){
          .li-hero-title{font-size:1.9rem!important;}
          .li-btn-hero{min-width:180px;font-size:.88rem;padding:14px 16px;}
          .li-carousel-prev,.li-carousel-next{display:none;}
        }
      `}</style>

      <div id="landing-root" style={{ background: 'linear-gradient(180deg, #1a0a3e 0%, #2d1b69 30%, #1a0a3e 100%)', minHeight: '100vh' }}>

        {/* NAVBAR */}
        <nav className={`li-navbar${scrolled ? ' scrolled' : ''}`}>
          <div className="li-nav-container">
            <a href="#hero-section" onClick={() => scrollTo('hero-section')}>
              <img src="/logo.png" alt="Logo" className="li-nav-logo" />
            </a>
            <button className="li-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`}></i>
            </button>
            <ul className={`li-nav-links${menuOpen ? ' open' : ''}`}>
              {[['hero-section','Accueil'],['features','Fonctionnalités'],['why-us','Pourquoi nous ?'],['how-it-works','Comment ça fonctionne ?'],['contact-us','Contact']].map(([id, label]) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>{label}</a></li>
              ))}
              <li style={{ marginLeft:'15px' }}><a href="/login" className="li-nav-btn">Se connecter</a></li>
            </ul>
          </div>
        </nav>

        {/* HERO */}
        <header id="hero-section" className="li-hero">
          <div className="li-hero-fallback" />
          {!videoError && (
            <video autoPlay loop muted playsInline onError={() => setVideoError(true)}
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', filter:'blur(3px) brightness(0.28)', zIndex:1 }}>
              <source src="/video_home.mp4" type="video/mp4" />
              <source src="/video_home.webm" type="video/webm" />
            </video>
          )}
          {/* Particules */}
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'hidden', zIndex:1 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className="li-particle" style={{
                width: `${8 + Math.random()*22}px`, height: `${8 + Math.random()*22}px`,
                left: `${Math.random()*100}%`,
                animationDuration: `${9 + Math.random()*13}s`,
                animationDelay: `${Math.random()*9}s`,
                opacity: 0.25 + Math.random()*0.4,
              }}/>
            ))}
          </div>
          <div className="li-hero-content">
            <h1 className="li-hero-title">
              {heroTitle.split('').map((l, i) => (
                <span key={i} className="li-hero-letter" style={{ animationDelay:`${0.06*i}s` }}>{l}</span>
              ))}
            </h1>
            <p className="li-hero-subtitle">L'interaction au service de votre réussite pédagogique.</p>
            <div className="li-hero-btns">
              <a href="/login" className="li-btn-hero li-btn-student"><i className="fas fa-user-graduate"></i><span>Espace Étudiant</span></a>
              <a href="/login" className="li-btn-hero li-btn-teacher"><i className="fas fa-chalkboard-teacher"></i><span>Espace Enseignant</span></a>
            </div>
          </div>
          <div className="li-scroll-indicator">
            <span>Découvrir</span>
            <div className="li-scroll-mouse"><div className="li-scroll-dot"/></div>
          </div>
        </header>

        {/* FONCTIONNALITÉS */}
        <section id="features" className="li-section li-light">
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Fonctionnalités Clés</h2>
              <p>Découvrez les modules qui transforment l'apprentissage.</p>
            </div>
            <div className="li-course-grid">
              {[
                { key:'sessions', title:'Création de sessions',      icon:'fa-calendar-plus', items:['Interface intuitive','Gestion des participants','Accès sécurisé'] },
                { key:'quiz',     title:'Quiz Interactifs',          icon:'fa-gamepad',        items:['Questions à choix multiples','Feedback instantané','Suivi des performances'] },
                { key:'sondages', title:'Sondages en temps réel',    icon:'fa-poll',           items:['Création rapide','Résultats instantanés','Analyse des tendances'] },
                { key:'anonyme',  title:'Questions Anonymes',        icon:'fa-user-secret',    items:["Liberté d'expression",'Modération possible','Échange constructif'] },
                { key:'stats',    title:'Statistiques Pédagogiques', icon:'fa-chart-bar',      items:['Rapports détaillés','Suivi des progrès','Identification des lacunes'] },
              ].map((f, idx) => (
                <AnimCard key={f.key} delay={idx*0.1} className="li-course-card">
                  <div style={{ fontSize:'2rem', marginBottom:'14px', color:'var(--primary-lt)' }}><i className={`fas ${f.icon}`}></i></div>
                  <h3>{f.title}</h3>
                  <ul>{f.items.map(it => <li key={it}><i className="fas fa-check-circle"></i>{it}</li>)}</ul>
                  <button className="li-btn-primary" onClick={() => setModal(f.key)}>En savoir plus</button>
                </AnimCard>
              ))}
            </div>
          </div>
        </section>

        {/* POURQUOI NOUS */}
        <section id="why-us" className="li-section" style={{ background:'linear-gradient(135deg, rgba(45,27,105,.9), rgba(15,7,32,.95))' }}>
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Pourquoi choisir LiveInteract ?</h2>
              <p>Des avantages clés qui nous distinguent et favorisent votre réussite.</p>
            </div>
            <div className="li-tile-grid">
              {[
                { key:'temps_reel', img:'/icon_communication.png', title:'Interaction en temps réel',          desc:'Engagez vos étudiants avec des outils dynamiques et interactifs.' },
                { key:'autonome',   img:'/icon_responsive.png',    title:'Application autonome',               desc:'Fonctionne sans installation complexe, accessible partout.' },
                { key:'simplicite', img:'/icon_simplicity.png',    title:"Simplicité d'utilisation",           desc:'Une interface intuitive pour enseignants et étudiants.' },
                { key:'securite',   img:'/icon_security.png',      title:'Sécurité des données',               desc:'Vos informations sont protégées avec les meilleures pratiques.' },
                { key:'universite', img:'/icon_education.png',     title:"Adaptée à l'enseignement supérieur", desc:'Conçue pour répondre aux besoins spécifiques des universités.' },
              ].map((t, idx) => (
                <AnimCard key={t.key} delay={idx*0.12} className="li-tile-card">
                  <img src={t.img} alt={t.title} />
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                  <button className="li-btn-secondary" onClick={() => setModal(t.key)}>En savoir plus</button>
                </AnimCard>
              ))}
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section id="how-it-works" className="li-section li-light">
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Comment ça fonctionne ?</h2>
              <p>Trois étapes simples pour une expérience pédagogique améliorée.</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexWrap:'wrap', gap:'12px', marginTop:'40px' }}>
              {[
                { num:'1', icon:'fa-chalkboard-teacher', title:"L'enseignant crée une session",         desc:'Interface intuitive pour configurer vos cours et activités.' },
                { num:'2', icon:'fa-user-graduate',      title:'Les étudiants rejoignent avec un code', desc:'Un code unique permet une connexion rapide et sécurisée.' },
                { num:'3', icon:'fa-chart-line',         title:'Résultats analysés en temps réel',      desc:"Aperçu immédiat des performances et de l'engagement." },
              ].map((s, idx) => (
                <React.Fragment key={s.num}>
                  <AnimCard delay={idx*0.2} className="li-process-step" style={{ flex:'1', minWidth:'230px', maxWidth:'330px' }}>
                    <div className="li-process-num">{s.num}</div>
                    <div className="li-icon-circle"><i className={`fas ${s.icon}`}></i></div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </AnimCard>
                  {idx < 2 && <div style={{ fontSize:'2rem', color:'var(--primary-lt)', animation:'arrowB 1.5s ease-in-out infinite' }}>→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section id="testimonials" className="li-section" style={{ background:'linear-gradient(135deg, #0f0720, #1e1b4b)' }}>
          <div className="li-inner">
            <div className="li-sec-header">
              <div className="li-counter-wrap" ref={counterRef}>
                <p className="li-counter-text">Plus de</p>
                <div className="li-counter-num">{counter.toLocaleString('fr-FR')}</div>
                <p className="li-counter-text">Utilisateurs satisfaits nous font confiance !</p>
              </div>
              <h2>Ce que nos utilisateurs disent</h2>
              <p>Des retours positifs qui reflètent la qualité de notre plateforme.</p>
            </div>
            <div className="li-testimonial-wrap">
              <div className="li-testimonial-slider">
                <div className="li-testimonial-inner" style={{ transform:`translateX(-${testimonialIdx*100}%)` }}>
                  {TESTIMONIALS.map((t, i) => (
                    <div className="li-testimonial-card" key={i}>
                      <img src={t.img} alt={t.name} />
                      <h3>{t.name}</h3>
                      <p className="li-role">{t.role}</p>
                      <blockquote>"{t.quote}"</blockquote>
                    </div>
                  ))}
                </div>
              </div>
              <button className="li-carousel-nav li-carousel-prev" onClick={() => setTestimonialIdx(i => (i-1+TESTIMONIALS.length)%TESTIMONIALS.length)}><i className="fas fa-chevron-left"></i></button>
              <button className="li-carousel-nav li-carousel-next" onClick={() => setTestimonialIdx(i => (i+1)%TESTIMONIALS.length)}><i className="fas fa-chevron-right"></i></button>
              <div className="li-carousel-dots">
                {TESTIMONIALS.map((_,i) => <div key={i} className={`li-carousel-dot${i===testimonialIdx?' active':''}`} onClick={() => setTestimonialIdx(i)} />)}
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact-us" className="li-section li-light">
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Contactez-nous</h2>
              <p>Nous sommes là pour répondre à vos questions et discuter de vos besoins.</p>
            </div>
            <div className="li-contact-content">
              <AnimCard delay={0}>
                <div className="li-contact-info">
                  <p><i className="fas fa-envelope"></i><span>Email : <a href="mailto:info@iwajutech.com">info@iwajutech.com</a></span></p>
                  <p><i className="fas fa-map-marker-alt"></i><span>Rue en face Bar Galaxy, Quartier Finafa, Abomey-Calavi, Bénin</span></p>
                  <p><i className="fas fa-phone"></i><span>+229 01 63 39 99 96</span></p>
                </div>
              </AnimCard>
              <AnimCard delay={0.15}>
                <form className="li-contact-form" onSubmit={handleContact}>
                  <input type="text"  placeholder="Votre Nom"     value={form.nom}     onChange={e => setForm({...form, nom:e.target.value})}     required />
                  <input type="email" placeholder="Votre Email"   value={form.email}   onChange={e => setForm({...form, email:e.target.value})}   required />
                  <textarea           placeholder="Votre Message" value={form.message} onChange={e => setForm({...form, message:e.target.value})} rows="5" required />
                  <button type="submit" className="li-btn-primary" disabled={sending}>
                    {sending ? <><i className="fas fa-spinner fa-spin"></i> Envoi...</> : <><i className="fas fa-paper-plane"></i> Envoyer</>}
                  </button>
                </form>
              </AnimCard>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="li-footer">
          <div className="li-footer-inner">
            <p>© 2026 LiveInteract — L'excellence académique à portée de main.</p>
            <nav className="li-footer-nav">
              <a href="#about-us">À propos</a>
              <a href="confidentialite.php">Confidentialité</a>
              <a href="conditions.php">Conditions</a>
              <a href="#contact-us" onClick={e => { e.preventDefault(); scrollTo('contact-us'); }}>Contact</a>
            </nav>
          </div>
        </footer>

        {/* MODALE */}
        <div className={`li-modal-overlay${modal?' open':''}`} onClick={e => { if(e.target.classList.contains('li-modal-overlay')) setModal(null); }}>
          {modal && MODAL_DATA[modal] && (
            <div className="li-modal-box">
              <button className="li-modal-close" onClick={() => setModal(null)}>×</button>
              <h2>{MODAL_DATA[modal].title}</h2>
              <p>{MODAL_DATA[modal].body}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
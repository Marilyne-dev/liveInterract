import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MODAL_DATA = {
  sessions:   { title: "Gestion de Sessions Temporaires",   body: "L'enseignant peut générer en un clic un espace de cours éphémère. Cela permet de séparer les flux d'interaction par séance, garantissant une organisation claire et un archivage automatique des échanges à la fin de chaque cours." },
  quiz:       { title: "Quiz Interactifs Synchrone",         body: "Inspiré de Kahoot, ce module permet de tester les connaissances en direct. Les étudiants répondent simultanément, et un podium s'affiche après chaque question pour stimuler l'engagement et identifier les notions à réexpliquer." },
  sondages:   { title: "Sondages en Temps Réel",             body: "Idéal pour recueillir l'opinion de la classe ou vérifier le climat d'apprentissage. Les résultats s'affichent sous forme de graphiques dynamiques, permettant à l'enseignant d'ajuster son discours instantanément." },
  anonyme:    { title: "Mur de Questions Anonymes",          body: "La peur de se tromper est le premier frein à l'apprentissage. Notre système permet aux étudiants de poser des questions complexes de manière anonyme, libérant ainsi la parole et favorisant une communication inclusive." },
  stats:      { title: "Analyses Pédagogiques",              body: "Toutes les interactions sont transformées en données exploitables. L'enseignant reçoit un rapport détaillé identifiant les lacunes collectives, permettant une remédiation ciblée et efficace." },
  temps_reel: { title: "La Puissance du Temps Réel",         body: "Contrairement aux forums classiques, LiveInteract utilise la technologie WebSocket pour une réactivité immédiate. L'information circule sans rechargement de page, créant une véritable immersion." },
  autonome:   { title: "Démo de l'Application",              body: "Notre plateforme est 'Progressive Web App'. Elle s'adapte aux connexions limitées et ne nécessite aucun téléchargement sur les stores, facilitant son adoption immédiate en milieu universitaire." },
  simplicite: { title: "Contactez le Support",               body: "Besoin d'une assistance pour déployer LiveInteract dans votre établissement ? Notre équipe vous accompagne pour l'installation technique et la formation des enseignants. Contactez-nous à support@liveinteract.com" },
  securite:   { title: "Sécurité & RGPD",                    body: "Nous appliquons les normes de sécurité les plus strictes. Les données sont cryptées, et nous respectons la vie privée des étudiants en ne collectant que le strict nécessaire pour le suivi pédagogique." },
  universite: { title: "Expertise Enseignement Supérieur",   body: "Conçu spécifiquement pour les grands effectifs des universités, notre outil gère des centaines de connexions simultanées sans ralentissement, idéal pour les amphithéâtres." },
};

const TESTIMONIALS = [
  { img: "user_elizabeth_smith.jpg", name: "Elizabeth AKANHOU",  role: "Directrice Pédagogique, Alpha School",           quote: "LiveInteract a révolutionné l'engagement de nos étudiants. La plateforme est intuitive et les retours en temps réel sont inestimables pour nos enseignants." },
  { img: "user_alex_johnson.jpg",    name: "Alex DOSSOU",         role: "Étudiant en Master, Université de Lyon",          quote: "Grâce à LiveInteract, les cours sont beaucoup plus interactifs. Je peux poser mes questions en direct et obtenir des réponses immédiates. C'est génial !" },
  { img: "user_sophie_martin.jpg",   name: "Sophie AHANDJINOU",   role: "Professeure de Mathématiques, Lycée Condorcet",   quote: "La fonctionnalité de quiz en temps réel est incroyable. Elle me permet de sonder rapidement la compréhension de mes élèves et d'adapter mon enseignement." },
  { img: "user_david_chen.jpg",      name: "David KOUAME",        role: "Développeur Pédagogique, EdTech Solutions",       quote: "J'apprécie la simplicité d'intégration et la robustesse de LiveInteract. C'est un outil puissant pour créer des expériences d'apprentissage immersives." },
  { img: "user_maria_gonzales.jpg",  name: "Maria Gonzales",      role: "Responsable Formation, Entreprise Innovante",     quote: "Nos employés sont plus engagés que jamais grâce aux sondages interactifs. LiveInteract nous aide à mesurer l'efficacité de nos formations en direct." },
  { img: "user_thomas_dupont.jpg",   name: "Thomas KPONDEDJI",    role: "Doctorant en Sciences Sociales, Paris Descartes", quote: "Le système de questions anonymes a libéré la parole dans nos séminaires. Cela encourage la participation de tous, même les plus timides." },
];

export default function LandingPage() {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [modal,          setModal]          = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [counter,        setCounter]        = useState(0);
  const counterRef  = useRef(null);
  const counterDone = useRef(false);

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

  const handleNavClick = () => setMenuOpen(false);

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
    } catch { alert("Une erreur technique est survenue lors de l'envoi."); }
    finally { setSending(false); }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>

      <style>{`
        /* ══ NOUVELLES VARIABLES COULEURS (thème sombre violet) ══ */
        :root {
          --primary:      #7b52c8;
          --primary-dark: #5c3d9e;
          --primary-lt:   #a87de8;
          --light-bg:     #0e0a1a;
          --dark2:        #1a1228;
          --card-bg:      #1f1535;
          --text-dark:    #e8e0f8;
          --text-light:   #9b89c4;
          --card-bg:      #1f1535;
          --shadow:       0 5px 20px rgba(0,0,0,0.4);
          --radius:       15px;
          --accent:       #a87de8;
          --border:       rgba(165,120,232,0.2);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, #landing-root {
          font-family: 'Montserrat', sans-serif;
          line-height: 1.6;
          color: var(--text-dark);
          background: var(--light-bg);
        }

        a { text-decoration: none; color: var(--primary-lt); }
        a:hover { text-decoration: underline; }
        ul { list-style: none; padding: 0; margin: 0; }

        /* ── Navbar ── */
        .li-navbar {
          position: fixed; top: 0; left: 0; width: 100%;
          background: rgba(14,10,26,0.92);
          backdrop-filter: blur(14px);
          box-shadow: 0 2px 20px rgba(0,0,0,0.4);
          border-bottom: 1px solid var(--border);
          z-index: 1000; height: 70px; display: flex; align-items: center;
          padding: 10px 20px; transition: box-shadow 0.3s;
        }
        .li-navbar.scrolled { box-shadow: 0 4px 30px rgba(92,61,158,0.3); }
        .li-nav-container { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; justify-content: space-between; align-items: center; }
        .li-nav-logo { height: 55px; width: auto; }
        .li-nav-links { display: flex; align-items: center; }
        .li-nav-links li { margin-left: 30px; }
        .li-nav-links a { color: var(--text-light); font-weight: 500; font-size: 1rem; padding: 5px 0; position: relative; transition: color .25s; }
        .li-nav-links a:hover { color: var(--text-dark); text-decoration: none; }
        .li-nav-links a::after { content:''; position:absolute; left:0; bottom:-5px; width:0; height:2px; background:var(--primary-lt); transition:width .3s; }
        .li-nav-links a:hover::after { width: 100%; }
        .li-nav-btn {
          border: 2px solid var(--primary-lt) !important;
          padding: 5px 15px; border-radius: 50px;
          font-weight: bold; color: var(--primary-lt) !important;
          background: rgba(165,120,232,0.1);
          transition: all .25s;
        }
        .li-nav-btn:hover { background: var(--primary); color: white !important; text-decoration: none; }
        .li-menu-toggle { display: none; background: none; border: none; font-size: 1.8rem; color: var(--primary-lt); cursor: pointer; }

        /* ── Hero ── */
        .li-hero {
          position: relative; width: 100%; height: 80vh; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          text-align: center; color: white; padding: 20px; margin-top: 70px;
        }
        .li-hero::before {
          content: ''; position: absolute;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(92,61,158,.5), transparent 70%);
          top: -200px; left: -200px; pointer-events: none;
        }
        .li-hero::after {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,125,232,.25), transparent 70%);
          bottom: -100px; right: -100px; pointer-events: none;
        }
        .li-hero video {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover; filter: blur(5px) brightness(0.35); z-index: -1;
        }
        .li-hero-content { position: relative; z-index: 1; max-width: 900px; }
        .li-hero-content h1 { font-size: 4.5rem; font-weight: 900; text-shadow: 2px 2px 10px rgba(0,0,0,0.8); margin-bottom: 20px; }
        .li-hero-content p { font-size: 1.8rem; font-weight: 300; color: rgba(232,224,248,0.85); text-shadow: 1px 1px 5px rgba(0,0,0,0.7); margin-bottom: 40px; }
        .li-hero-btns { margin-top: 40px; display: flex; gap: 25px; justify-content: center; flex-wrap: wrap; }

        .li-btn-hero {
          display: inline-flex; align-items: center; justify-content: center; gap: 15px;
          padding: 18px 35px; border-radius: 50px; font-weight: 800; font-size: 1.1rem;
          text-transform: uppercase; letter-spacing: 1px; color: #fff !important;
          min-width: 240px; border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          transition: all 0.3s cubic-bezier(.175,.885,.32,1.275); cursor: pointer;
          text-decoration: none;
        }
        .li-btn-hero:hover { transform: translateY(-5px) scale(1.05); box-shadow: 0 15px 40px rgba(92,61,158,0.6); text-decoration: none; }
        .li-btn-student { background: linear-gradient(135deg, #5c3d9e, #7b52c8); border: 2px solid rgba(165,120,232,0.4) !important; }
        .li-btn-student:hover { background: linear-gradient(135deg, #7b52c8, #a87de8); }
        .li-btn-teacher { background: linear-gradient(135deg, #1e1b4b, #312e81); border: 2px solid rgba(165,120,232,0.2) !important; }
        .li-btn-teacher:hover { background: linear-gradient(135deg, #312e81, #5c3d9e); }
        .li-btn-hero i { font-size: 1.4rem; }

        /* ── Sections générales ── */
        .li-section { padding: 80px 20px; text-align: center; }
        .li-section > .li-inner { max-width: 1200px; margin: 0 auto; }
        .li-light { background: var(--dark2); }
        .li-dark  { background: var(--primary-dark); }
        .li-sec-header { margin-bottom: 60px; }
        .li-sec-header h2 { font-size: 3.5rem; font-weight: bold; margin-bottom: 20px; color: var(--text-dark); }
        .li-sec-header p { font-size: 1.3rem; color: var(--text-light); max-width: 800px; margin: 0 auto; }

        /* ── Cards fonctionnalités ── */
        .li-course-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap: 30px; text-align: left; }
        .li-course-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius); box-shadow: var(--shadow); padding: 30px;
          transition: transform .3s, box-shadow .3s, border-color .3s;
        }
        .li-course-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-color: rgba(165,120,232,0.5); }
        .li-course-card h3 { font-size: 1.8rem; font-weight: bold; color: var(--primary-lt); margin-bottom: 25px; }
        .li-course-card ul { margin-bottom: 30px; }
        .li-course-card ul li { font-size: 1.1rem; color: var(--text-light); margin-bottom: 12px; position: relative; padding-left: 30px; }
        .li-course-card ul li i { color: #a87de8; position: absolute; left: 0; top: 3px; font-size: 1.1em; }
        .li-course-card .li-btn-primary { width: 100%; padding: 10px 15px; border-radius: 8px; }

        /* ── Boutons généraux ── */
        .li-btn-primary {
          display: inline-block; padding: 12px 25px; border-radius: 50px;
          font-weight: bold; font-size: 1rem;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          color: white; border: none; cursor: pointer; transition: all .3s;
          box-shadow: 0 4px 15px rgba(92,61,158,0.4);
        }
        .li-btn-primary:hover { background: linear-gradient(135deg, var(--primary), var(--primary-lt)); color: white; text-decoration: none; transform: translateY(-2px); }
        .li-btn-secondary {
          display: inline-block; padding: 12px 25px; border-radius: 50px;
          font-weight: bold; font-size: 1rem;
          background: transparent; border: 2px solid var(--primary-lt);
          color: var(--primary-lt); cursor: pointer; transition: all .3s;
        }
        .li-btn-secondary:hover { background: var(--primary); color: white; text-decoration: none; border-color: var(--primary); }

        /* ── Tuiles "Pourquoi nous" ── */
        .li-tile-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 30px; }
        .li-tile-card {
          background: linear-gradient(135deg, var(--primary-dark), #2d1b69);
          border: 1px solid rgba(165,120,232,0.25);
          color: white; border-radius: var(--radius); padding: 40px 30px;
          display: flex; flex-direction: column; align-items: center;
          transition: transform .3s, box-shadow .3s;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .li-tile-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(92,61,158,0.4); }
        .li-tile-card img { width: 80px; height: 80px; margin-bottom: 25px; filter: invert(1) brightness(1.2); }
        .li-tile-card h3 { font-size: 2rem; font-weight: bold; color: white; margin-bottom: 20px; text-align: center; }
        .li-tile-card p { font-size: 1.1rem; color: rgba(232,224,248,0.8); margin-bottom: 30px; text-align: center; }
        .li-tile-card .li-btn-secondary { border-color: rgba(165,120,232,0.6); color: var(--primary-lt); border-radius: 8px; padding: 10px 20px; }
        .li-tile-card .li-btn-secondary:hover { background: rgba(165,120,232,0.2); color: white; border-color: var(--primary-lt); }

        /* ── Comment ça marche ── */
        .li-process-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap: 30px; margin-top: 40px; }
        .li-process-step {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius); box-shadow: var(--shadow); padding: 30px;
          text-align: center; transition: transform .3s, box-shadow .3s, border-color .3s;
        }
        .li-process-step:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-color: rgba(165,120,232,0.5); }
        .li-icon-circle {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          border-radius: 50%; display: flex; justify-content: center; align-items: center;
          margin: 0 auto 25px; color: white; font-size: 2.5rem;
          box-shadow: 0 8px 24px rgba(92,61,158,0.5);
        }
        .li-process-step h3 { font-size: 1.8rem; font-weight: bold; color: var(--primary-lt); margin-bottom: 15px; }
        .li-process-step p { color: var(--text-light); font-size: 1.1rem; }

        /* ── Compteur ── */
        .li-counter-wrap { margin-bottom: 60px; color: white; }
        .li-counter-text { font-size: 1.5rem; font-weight: 300; margin-bottom: 10px; color: rgba(232,224,248,0.85); }
        .li-counter-num { font-size: 5rem; font-weight: 900; color: var(--primary-lt); text-shadow: 0 0 30px rgba(168,125,232,0.6); display: inline-block; }

        /* ── Témoignages ── */
        .li-testimonial-wrap { position: relative; max-width: 800px; margin: 0 auto; }
        .li-testimonial-slider { overflow: hidden; }
        .li-testimonial-inner { display: flex; transition: transform .5s ease; }
        .li-testimonial-card {
          min-width: 100%; padding: 40px;
          background: rgba(165,120,232,0.1);
          border: 1px solid rgba(165,120,232,0.2);
          border-radius: var(--radius); color: white; text-align: center;
        }
        .li-testimonial-card img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; border: 3px solid var(--primary-lt); }
        .li-testimonial-card h3 { font-size: 1.8rem; font-weight: bold; margin-bottom: 5px; }
        .li-testimonial-card .li-role { font-size: 1.1rem; color: var(--text-light); margin-bottom: 25px; }
        .li-testimonial-card blockquote { font-size: 1.3rem; line-height: 1.8; color: rgba(232,224,248,0.9); font-style: italic; padding: 0 20px; }
        .li-carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(165,120,232,0.2); border: 1px solid rgba(165,120,232,0.3); color: white; font-size: 1.5rem; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .3s; z-index: 10; }
        .li-carousel-nav:hover { background: rgba(165,120,232,0.4); }
        .li-carousel-prev { left: -60px; }
        .li-carousel-next { right: -60px; }

        /* ── Contact ── */
        .li-contact-content { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; text-align: left; margin-top: 40px; align-items: flex-start; }
        .li-contact-info p { font-size: 1.2rem; margin-bottom: 20px; color: var(--text-dark); display: flex; align-items: center; }
        .li-contact-info p i { color: var(--primary-lt); margin-right: 15px; font-size: 1.5rem; }
        .li-contact-form {
          display: flex; flex-direction: column; gap: 20px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius); box-shadow: var(--shadow); padding: 40px;
        }
        .li-contact-form input, .li-contact-form textarea {
          padding: 15px; border: 1.5px solid rgba(165,120,232,0.25); border-radius: 8px;
          font-size: 1rem; font-family: 'Montserrat',sans-serif; resize: vertical;
          background: rgba(255,255,255,0.05); color: var(--text-dark);
          transition: border-color .25s;
        }
        .li-contact-form input:focus, .li-contact-form textarea:focus { border-color: var(--primary-lt); outline: none; box-shadow: 0 0 0 3px rgba(168,125,232,0.15); }
        .li-contact-form input::placeholder, .li-contact-form textarea::placeholder { color: var(--text-light); }
        .li-contact-form .li-btn-primary { padding: 15px 25px; font-size: 1.1rem; border-radius: 8px; }

        /* ── Footer ── */
        .li-footer {
          background: #0a0614;
          border-top: 1px solid rgba(165,120,232,0.15);
          color: var(--text-light); padding: 40px 20px; text-align: center; font-size: 0.9rem;
        }
        .li-footer-inner { max-width: 1200px; margin: 0 auto; }
        .li-footer p { margin-bottom: 15px; }
        .li-footer-nav a { color: var(--text-light); margin: 0 15px; transition: color .2s; }
        .li-footer-nav a:hover { color: var(--primary-lt); text-decoration: none; }

        /* ── Modale ── */
        .li-modal-overlay { display: none; position: fixed; z-index: 3000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(14,10,26,0.8); backdrop-filter: blur(10px); animation: fadeIn .3s; }
        .li-modal-overlay.open { display: flex; align-items: center; justify-content: center; }
        .li-modal-box {
          background: var(--card-bg); padding: 40px; border-radius: 20px;
          width: 90%; max-width: 600px;
          border-left: 6px solid var(--primary-lt);
          border: 1px solid rgba(165,120,232,0.3);
          border-left: 6px solid var(--primary-lt);
          position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .li-modal-close { position: absolute; right: 25px; top: 15px; font-size: 35px; cursor: pointer; color: var(--primary-lt); background: none; border: none; }
        .li-modal-box h2 { color: var(--primary-lt); margin-bottom: 20px; font-weight: 700; }
        .li-modal-box p { line-height: 1.6; color: var(--text-light); font-size: 1.1rem; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        /* ── Responsive ── */
        @media(max-width:992px){
          .li-nav-links { display:none; flex-direction:column; width:100%; background:rgba(14,10,26,0.98); position:absolute; top:70px; left:0; box-shadow:0 5px 20px rgba(0,0,0,0.4); padding-bottom:10px; }
          .li-nav-links.open { display:flex; }
          .li-nav-links li { margin:0; text-align:center; }
          .li-nav-links a { display:block; padding:15px 20px; border-bottom:1px solid rgba(165,120,232,0.1); }
          .li-menu-toggle { display:block; }
          .li-hero { height:60vh; }
          .li-hero-content h1 { font-size:3rem; }
          .li-hero-content p { font-size:1.3rem; }
          .li-contact-content { grid-template-columns:1fr; }
          .li-carousel-prev { left:-30px; }
          .li-carousel-next { right:-30px; }
        }
        @media(max-width:768px){
          .li-hero-content h1 { font-size:2.5rem; }
          .li-sec-header h2 { font-size:2.5rem; }
          .li-section { padding:60px 15px; }
          .li-counter-num { font-size:3.5rem; }
          .li-testimonial-card blockquote { font-size:1.1rem; }
        }
        @media(max-width:480px){
          .li-hero-content h1 { font-size:2rem; }
          .li-btn-hero { min-width:180px; font-size:0.95rem; padding:14px 20px; }
          .li-sec-header h2 { font-size:2rem; }
        }
      `}</style>

      <div id="landing-root">

        {/* ══ NAVBAR ══ */}
        <nav className={`li-navbar${scrolled ? ' scrolled' : ''}`}>
          <div className="li-nav-container">
            <a href="#hero-section" onClick={() => scrollTo('hero-section')}>
              <img src="images/logo.png" alt="Logo LiveInteract" className="li-nav-logo" />
            </a>
            <button className="li-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`}></i>
            </button>
            <ul className={`li-nav-links${menuOpen ? ' open' : ''}`}>
              {[['hero-section','Accueil'],['features','Fonctionnalités'],['why-us','Pourquoi nous ?'],['how-it-works','Comment ça fonctionne ?'],['contact-us','Contact']].map(([id, label]) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); handleNavClick(); }}>{label}</a></li>
              ))}
              <li style={{ marginLeft: '15px' }}>
                <a href="/login" className="li-nav-btn">Se connecter</a>
              </li>
            </ul>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <header id="hero-section" className="li-hero">
          <video autoPlay loop muted playsInline>
            <source src="video_home.mp4" type="video/mp4" />
          </video>
          <div className="li-hero-content">
            <h1>LIVEINTERACT</h1>
            <p>L'interaction au service de votre réussite pédagogique.</p>
            <div className="li-hero-btns">
              <a href="/login" className="li-btn-hero li-btn-student">
                <i className="fas fa-user-graduate"></i>
                <span>Espace Étudiant</span>
              </a>
              <a href="/login" className="li-btn-hero li-btn-teacher">
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Espace Enseignant</span>
              </a>
            </div>
          </div>
        </header>

        {/* ══ FONCTIONNALITÉS ══ */}
        <section id="features" className="li-section li-light">
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Fonctionnalités Clés</h2>
              <p>Découvrez les modules qui transforment l'apprentissage.</p>
            </div>
            <div className="li-course-grid">
              {[
                { key:'sessions', title:'Création de sessions',       items:['Interface intuitive','Gestion des participants','Accès sécurisé'] },
                { key:'quiz',     title:'Quiz Interactifs',           items:['Questions à choix multiples','Feedback instantané','Suivi des performances'] },
                { key:'sondages', title:'Sondages en temps réel',     items:['Création rapide','Résultats instantanés','Analyse des tendances'] },
                { key:'anonyme',  title:'Questions Anonymes',         items:["Liberté d'expression",'Modération possible','Échange constructif'] },
                { key:'stats',    title:'Statistiques Pédagogiques',  items:['Rapports détaillés','Suivi des progrès','Identification des lacunes'] },
              ].map(f => (
                <div className="li-course-card" key={f.key}>
                  <h3>{f.title}</h3>
                  <ul>{f.items.map(it => <li key={it}><i className="fas fa-check-circle"></i>{it}</li>)}</ul>
                  <button className="li-btn-primary" onClick={() => setModal(f.key)}>En savoir plus</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ POURQUOI NOUS ══ */}
        <section id="why-us" className="li-section" style={{background:'var(--light-bg)'}}>
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Pourquoi choisir LiveInteract ?</h2>
              <p>Des avantages clés qui nous distinguent et favorisent votre réussite.</p>
            </div>
            <div className="li-tile-grid">
              {[
                { key:'temps_reel', img:'icon_communication.png', title:'Interaction en temps réel',           desc:'Engagez vos étudiants avec des outils dynamiques et interactifs.', btn:'En savoir plus' },
                { key:'autonome',   img:'icon_responsive.png',     title:'Application autonome',                desc:'Fonctionne sans installation complexe, accessible partout.',         btn:'Voir la démo' },
                { key:'simplicite', img:'icon_simplicity.png',     title:"Simplicité d'utilisation",            desc:'Une interface intuitive pour enseignants et étudiants.',             btn:'Nous contacter' },
                { key:'securite',   img:'icon_security.png',       title:'Sécurité des données',                desc:'Vos informations sont protégées avec les meilleures pratiques.',     btn:'En savoir plus' },
                { key:'universite', img:'icon_education.png',      title:"Adaptée à l'enseignement supérieur",  desc:'Conçue pour répondre aux besoins spécifiques des universités.',       btn:'En savoir plus' },
              ].map(t => (
                <div className="li-tile-card" key={t.key}>
                  <img src={t.img} alt={t.title} />
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                  <button className="li-btn-secondary" onClick={() => setModal(t.key)}>{t.btn}</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ COMMENT ÇA MARCHE ══ */}
        <section id="how-it-works" className="li-section li-light">
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Comment ça fonctionne ?</h2>
              <p>Trois étapes simples pour une expérience pédagogique améliorée.</p>
            </div>
            <div className="li-process-grid">
              {[
                { icon:'fa-chalkboard-teacher', title:"1. L'enseignant crée une session",             desc:'Utilisez notre interface intuitive pour configurer vos cours et activités.' },
                { icon:'fa-user-graduate',       title:'2. Les étudiants rejoignent avec un code',     desc:'Un code unique permet une connexion rapide et sécurisée à la session.' },
                { icon:'fa-chart-line',          title:'3. Les résultats sont analysés en temps réel', desc:"Obtenez un aperçu immédiat des performances et de l'engagement." },
              ].map(s => (
                <div className="li-process-step" key={s.title}>
                  <div className="li-icon-circle"><i className={`fas ${s.icon}`}></i></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TÉMOIGNAGES ══ */}
        <section id="testimonials" className="li-section" style={{background:'var(--primary-dark)'}}>
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
                <div className="li-testimonial-inner" style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}>
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
              <button className="li-carousel-nav li-carousel-prev" onClick={() => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="li-carousel-nav li-carousel-next" onClick={() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>

        {/* ══ CONTACT ══ */}
        <section id="contact-us" className="li-section li-light">
          <div className="li-inner">
            <div className="li-sec-header">
              <h2>Contactez-nous</h2>
              <p>Nous sommes là pour répondre à vos questions et discuter de vos besoins.</p>
            </div>
            <div className="li-contact-content">
              <div className="li-contact-info">
                <p><i className="fas fa-envelope"></i><span>Email : <a href="mailto:info@iwajutech.com">info@iwajutech.com</a></span></p>
                <p><i className="fas fa-map-marker-alt"></i><span>Rue en face Bar Galaxy, Quartier Finafa, Abomey-Calavi, Bénin</span></p>
                <p><i className="fas fa-phone"></i><span>+229 01 63 39 99 96</span></p>
              </div>
              <form className="li-contact-form" onSubmit={handleContact}>
                <input type="text"  placeholder="Votre Nom"     value={form.nom}     onChange={e => setForm({...form, nom: e.target.value})}     required />
                <input type="email" placeholder="Votre Email"   value={form.email}   onChange={e => setForm({...form, email: e.target.value})}   required />
                <textarea           placeholder="Votre Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="5" required />
                <button type="submit" className="li-btn-primary" disabled={sending}>
                  {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="li-footer">
          <div className="li-footer-inner">
            <p>© 2026 LiveInteract. Tous droits réservés. L'excellence académique à portée de main.</p>
            <nav className="li-footer-nav">
              <a href="#about-us">À propos</a>
              <a href="confidentialite.php">Confidentialité</a>
              <a href="conditions.php">Conditions</a>
              <a href="#contact-us" onClick={(e) => { e.preventDefault(); scrollTo('contact-us'); }}>Contact</a>
            </nav>
          </div>
        </footer>

        {/* ══ MODALE ══ */}
        <div className={`li-modal-overlay${modal ? ' open' : ''}`} onClick={(e) => { if (e.target.classList.contains('li-modal-overlay')) setModal(null); }}>
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
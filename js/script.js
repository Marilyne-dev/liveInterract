document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarLinks = document.querySelector('.navbar-links');

    if (menuToggle && navbarLinks) {
        menuToggle.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
        });

        navbarLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbarLinks.classList.remove('active');
            });
        });
    }

    // Gérer l'état actif des liens de navigation lors du défilement
    const sections = document.querySelectorAll('.homepage-section, .main-hero-video-container');
    const navLinks = document.querySelectorAll('.navbar-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - (navbarLinks.clientHeight + 20);
            const sectionHeight = section.clientHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Effet d'ombre sur la navbar au scroll
    const navbar = document.querySelector('.main-navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Initialisation de ScrollReveal ---
    ScrollReveal({
        distance: '60px',
        duration: 1200,
        easing: 'cubic-bezier(.215, .61, .355, 1)',
        reset: false
    });

    ScrollReveal().reveal('.hero-content h1', { origin: 'top', delay: 200 });
    ScrollReveal().reveal('.hero-content p', { origin: 'top', delay: 400 });
    ScrollReveal().reveal('.hero-button', { origin: 'left', delay: 600 });
    ScrollReveal().reveal('.download-button', { origin: 'right', delay: 600 });
    ScrollReveal().reveal('#features .course-card', { origin: 'right', interval: 150, delay: 200 });
    ScrollReveal().reveal('#why-us .tile-card', { origin: 'bottom', interval: 150, delay: 200 });
    ScrollReveal().reveal('#how-it-works .process-step', { origin: 'bottom', interval: 200, delay: 200 });
    ScrollReveal().reveal('#demo .demo-card:first-child', { origin: 'left', delay: 200 });
    ScrollReveal().reveal('#demo .demo-card:last-child', { origin: 'right', delay: 200 });
    ScrollReveal().reveal('#about-us .large-text', { origin: 'bottom', delay: 200 });
    ScrollReveal().reveal('#about-us .lecturer-card', { origin: 'bottom', interval: 100, delay: 300 });
    ScrollReveal().reveal('#testimonials .testimonial-card', { origin: 'left', delay: 200 });
    ScrollReveal().reveal('#contact-us .contact-info', { origin: 'left', delay: 200 });
    ScrollReveal().reveal('#contact-us .contact-form', { origin: 'right', delay: 200 });

    // --- Logique du compteur animé ---
    const counterElement = document.querySelector('.animated-counter');
    const animateCounter = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString('fr-FR');
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    };

    if (counterElement) {
        ScrollReveal().reveal(counterElement, {
            beforeReveal: () => { animateCounter(counterElement, 0, 15000, 2000); }
        });
    }

    // ======================================================
    // NOUVELLE LOGIQUE : FORMULAIRE DE CONTACT (AJAX)
    // ======================================================
    const btnEnvoyer = document.querySelector('#btnEnvoyer');
    const contactForm = document.querySelector('.contact-form');

    if (btnEnvoyer && contactForm) {
        btnEnvoyer.addEventListener('click', async (e) => {
            e.preventDefault(); // Empêche la page de se recharger

            // Récupération des données
            const nom = document.querySelector('#nom').value;
            const email = document.querySelector('#email').value;
            const message = document.querySelector('#message').value;

            // Vérification
            if (!nom || !email || !message) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            // Changement d'état du bouton pendant l'envoi
            btnEnvoyer.innerText = "Envoi en cours...";
            btnEnvoyer.disabled = true;

            try {
                // Envoi des données vers PHP
                const response = await fetch('contact_handler.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `nom=${encodeURIComponent(nom)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`
                });

                const result = await response.json(); // On récupère la réponse JSON

                if (result.status === 'success') {
                    alert(result.message);
                    contactForm.reset(); // Vide le formulaire
                } else {
                    alert("Erreur: " + result.message);
                }

            } catch (error) {
                console.error("Erreur technique:", error);
                alert("Une erreur technique est survenue lors de l'envoi.");
            } finally {
                // On remet le bouton à son état normal
                btnEnvoyer.innerText = "Envoyer le message";
                btnEnvoyer.disabled = false;
            }
        });
    }


    const allModalData = {
    // FONCTIONNALITÉS
    "sessions": {
        title: "Gestion de Sessions Temporaires",
        body: "L'enseignant peut générer en un clic un espace de cours éphémère. Cela permet de séparer les flux d'interaction par séance, garantissant une organisation claire et un archivage automatique des échanges à la fin de chaque cours."
    },
    "quiz": {
        title: "Quiz Interactifs Synchrone",
        body: "Inspiré de Kahoot, ce module permet de tester les connaissances en direct. Les étudiants répondent simultanément, et un podium s'affiche après chaque question pour stimuler l'engagement et identifier les notions à réexpliquer."
    },
    "sondages": {
        title: "Sondages en Temps Réel",
        body: "Idéal pour recueillir l'opinion de la classe ou vérifier le climat d'apprentissage. Les résultats s'affichent sous forme de graphiques dynamiques, permettant à l'enseignant d'ajuster son discours instantanément."
    },
    "anonyme": {
        title: "Mur de Questions Anonymes",
        body: "La peur de se tromper est le premier frein à l'apprentissage. Notre système permet aux étudiants de poser des questions complexes de manière anonyme, libérant ainsi la parole et favorisant une communication inclusive."
    },
    "stats": {
        title: "Analyses Pédagogiques",
        body: "Toutes les interactions sont transformées en données exploitables. L'enseignant reçoit un rapport détaillé identifiant les lacunes collectives, permettant une remédiation ciblée et efficace."
    },

    // POURQUOI NOUS
    "temps_reel": {
        title: "La Puissance du Temps Réel",
        body: "Contrairement aux forums classiques, FutureLearn utilise la technologie WebSocket pour une réactivité immédiate. L'information circule sans rechargement de page, créant une véritable immersion."
    },
    "autonome": {
        title: "Démo de l'Application",
        body: "Notre plateforme est 'Progressive Web App'. Elle s'adapte aux connexions limitées et ne nécessite aucun téléchargement sur les stores, facilitant son adoption immédiate en milieu universitaire."
    },
    "simplicite": {
        title: "Contactez le Support",
        body: "Besoin d'une assistance pour déployer FutureLearn dans votre établissement ? Notre équipe vous accompagne pour l'installation technique et la formation des enseignants. Contactez-nous à support@futurelearn.com"
    },
    "securite": {
        title: "Sécurité & RGPD",
        body: "Nous appliquons les normes de sécurité les plus strictes. Les données sont cryptées, et nous respectons la vie privée des étudiants en ne collectant que le strict nécessaire pour le suivi pédagogique."
    },
    "universite": {
        title: "Expertise Enseignement Supérieur",
        body: "Conçu spécifiquement pour les grands effectifs des universités, notre outil gère des centaines de connexions simultanées sans ralentissement, idéal pour les amphithéâtres."
    },

    // ÉQUIPE
    "john": {
        title: "John Stuart - Visionnaire Tech",
        body: "Ingénieur en systèmes d'apprentissage, John supervise l'architecture globale de FutureLearn pour garantir une stabilité à toute épreuve."
    },
    "stacy": {
        title: "Stacy McKinsey - UX Expert",
        body: "Spécialiste en ergonomie pédagogique, Stacy veille à ce que l'interface soit si simple qu'aucune formation ne soit nécessaire pour l'utiliser."
    },
    "kate": {
        title: "Kate Simons - Data Scientist",
        body: "Kate a développé les algorithmes d'analyse qui permettent de transformer les quiz en véritables outils de diagnostic pour les professeurs."
    },
    "mike": {
        title: "Mike Jackson - Creative Lead",
        body: "Mike est l'âme visuelle du projet. Il a conçu le design moderne et épuré qui rend l'expérience d'apprentissage si agréable."
    }
};

// Logique d'ouverture
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-modal')) {
        e.preventDefault();
        const key = e.target.getAttribute('data-modal');
        if (allModalData[key]) {
            document.getElementById('modalTitle').innerText = allModalData[key].title;
            document.getElementById('modalBody').innerText = allModalData[key].body;
            document.getElementById('featureModal').style.display = "block";
        }
    }
    
    // Fermeture
    if (e.target.classList.contains('close-modal') || e.target.classList.contains('modal')) {
        document.getElementById('featureModal').style.display = "none";
    }
});
});
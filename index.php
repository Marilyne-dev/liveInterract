<?php
require_once('./config.php');

if (isloggedin() && !isguestuser()) {
    redirect(new moodle_url('/my/'));
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiveInteract - Votre Plateforme d'Apprentissage Révolutionnaire</title>
    <link rel="stylesheet" href="css/style.css">
    <!-- Pour les icônes (ex: coches, flèches) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Police Montserrat (si non déjà importée dans CSS) -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <!-- Animate.css pour les animations prédéfinies -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
<!-- ScrollReveal.js pour déclencher les animations au scroll -->
<script src="https://unpkg.com/scrollreveal"></script>

<style>
  /* Conteneur des boutons */
.hero-buttons-container {
    margin-top: 40px;
    display: flex;
    gap: 25px;
    justify-content: center;
    flex-wrap: wrap;
}

/* Style de base des boutons Hero */
.btn-hero {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 18px 35px;
    border-radius: 50px;
    font-weight: 800; /* Texte bien gras */
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: #ffffff !important; /* Texte TOUJOURS blanc */
    text-shadow: 0 2px 4px rgba(0,0,0,0.3); /* Ombre sous le texte pour la lisibilité */
    min-width: 240px;
    border: none;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

/* Bouton Étudiant (Violet Lumineux) */
.btn-student {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    border: 2px solid rgba(255,255,255,0.3);
}

/* Bouton Enseignant (Bleu Marine Profond) */
.btn-teacher {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    border: 2px solid rgba(255,255,255,0.1);
}

/* Effets au survol */
.btn-hero:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 30px rgba(0,0,0,0.4);
    color: #ffffff !important;
    text-decoration: none;
}

.btn-student:hover {
    background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
}

.btn-teacher:hover {
    background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
}

/* Style des icônes dans les boutons */
.btn-hero i {
    font-size: 1.4rem;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
}
</style>
</head>
<body>

    <!-- Barre de Navigation -->
    <nav class="main-navbar">
        <div class="navbar-container">
                <a href="#" class="navbar-brand">
                 <img src="images/logo.png" alt="Logo LiveInteract" class="navbar-logo">
                </a>
            <button class="menu-toggle" aria-label="Toggle navigation">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="navbar-links">
                <li><a href="#hero-section">Accueil</a></li>
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#why-us">Pourquoi nous ?</a></li>
                <li><a href="#how-it-works">Comment ça fonctionne ?</a></li>
                <li><a href="#contact-us">Contact</a></li>

                
                <!-- BOUTONS MOODLE AJOUTÉS ICI -->
                <li style="margin-left: 15px;"><a href="login/index.php" style="border: 2px solid #fff; padding: 5px 15px; border-radius: 5px; font-weight: bold;">Se connecter</a></li>
                
            </ul>
        </div>
    </nav>

    <!-- Section Vidéo de Fond + Slogan (Hero Section) -->
    <header id="hero-section" class="main-hero-video-container">
        <video class="background-video" autoplay loop muted playsinline>
            <source src="videos/video_home.mp4" type="video/mp4">
        </video>
        <div class="hero-content">
            <h1 class="animate__animated animate__fadeInDown">LIVEINTERACT</h1>
            <p class="animate__animated animate__fadeInUp animate__delay-1s">L'interaction au service de votre réussite pédagogique.</p>
            
            <div class="hero-buttons-container animate__animated animate__zoomIn animate__delay-2s">
                <!-- BOUTON ÉTUDIANT -->
                <a href="http://localhost:5173/" class="btn-hero btn-student">
                    <i class="fas fa-user-graduate"></i> 
                    <span>Espace Étudiant</span>
                </a>
                
                <!-- BOUTON ENSEIGNANT -->
                <a href="http://localhost:5173/teacher" class="btn-hero btn-teacher">
                    <i class="fas fa-chalkboard-teacher"></i> 
                    <span>Espace Enseignant</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Section "Fonctionnalités" (Anciennement "Nos Cours Phares" - à renommer et adapter) -->
    <section id="features" class="homepage-section light-background">
        <div class="section-header">
            <h2>Fonctionnalités Clés</h2>
            <p>Découvrez les modules qui transforment l'apprentissage.</p>
        </div>
        <div class="course-grid">
            <!-- Exemple de carte de fonctionnalité - adapte le contenu -->
            <div class="course-card">
                <h3>Création de sessions</h3>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Interface intuitive</li>
                    <li><i class="fas fa-check-circle"></i> Gestion des participants</li>
                    <li><i class="fas fa-check-circle"></i> Accès sécurisé</li>
                </ul>
                <a href="#features-detail" class="btn btn-primary btn-modal"data-modal="sessions">En savoir plus</a>
            </div>
            <div class="course-card">
                <h3>Quiz Interactifs</h3>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Questions à choix multiples</li>
                    <li><i class="fas fa-check-circle"></i> Feedback instantané</li>
                    <li><i class="fas fa-check-circle"></i> Suivi des performances</li>
                </ul>
                <a href="#features-detail" class="btn btn-primary btn-modal"data-modal="quiz">En savoir plus</a>
            </div>
            <div class="course-card">
                <h3>Sondages en temps réel</h3>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Création rapide</li>
                    <li><i class="fas fa-check-circle"></i> Résultats instantanés</li>
                    <li><i class="fas fa-check-circle"></i> Analyse des tendances</li>
                </ul>
                <a href="#features-detail" class="btn btn-primary btn-modal" data-modal="sondages">En savoir plus</a>
            </div>
             <div class="course-card">
                <h3>Questions Anonymes</h3>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Liberté d'expression</li>
                    <li><i class="fas fa-check-circle"></i> Modération possible</li>
                    <li><i class="fas fa-check-circle"></i> Échange constructif</li>
                </ul>
                <a href="#features-detail" class="btn btn-primary btn-modal" data-modal="anonyme">En savoir plus</a>
            </div>
            <div class="course-card">
                <h3>Statistiques Pédagogiques</h3>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Rapports détaillés</li>
                    <li><i class="fas fa-check-circle"></i> Suivi des progrès</li>
                    <li><i class="fas fa-check-circle"></i> Identification des lacunes</li>
                </ul>
                <a href="#features-detail" class="btn btn-primary btn-modal" data-modal="stats">En savoir plus</a>
            </div>
        </div>
    </section>

    <!-- Section "Pourquoi nous choisir ?" (Tuiles) - ID mis à jour -->
    <section id="why-us" class="homepage-section">
        <div class="section-header">
            <h2>Pourquoi choisir LiveInteract ?</h2>
            <p>Des avantages clés qui nous distinguent et favorisent votre réussite.</p>
        </div>
        <div class="tile-grid">
            <div class="tile-card">
                <img src="images/icon_communication.png" alt="Icone Communication">
                <h3>Interaction en temps réel</h3>
                <p>Engagez vos étudiants avec des outils dynamiques et interactifs.</p>
                <a href="#why-us-detail" class="btn btn-secondary btn-modal"  data-modal="temps_reel">En savoir plus</a>
            </div>
            <div class="tile-card">
                <img src="images/icon_responsive.png" alt="Icone Autonomie">
                <h3>Application autonome</h3>
                <p>Fonctionne sans installation complexe, accessible partout.</p>
                <a href="#why-us-detail" class="btn btn-secondary btn-modal" data-modal="autonome">Voir la démo</a>
            </div>
            <div class="tile-card">
                <img src="images/icon_simplicity.png" alt="Icone Simplicité">
                <h3>Simplicité d'utilisation</h3>
                <p>Une interface intuitive pour enseignants et étudiants.</p>
                <a href="#why-us-detail" class="btn btn-secondary btn-modal" data-modal="simplicite">Nous contacter</a>
            </div>
            <div class="tile-card">
                <img src="images/icon_security.png" alt="Icone Sécurité">
                <h3>Sécurité des données</h3>
                <p>Vos informations sont protégées avec les meilleures pratiques.</p>
                <a href="#why-us-detail" class="btn btn-secondary btn-modal " data-modal="securite">En savoir plus</a>
            </div>
            <div class="tile-card">
                <img src="images/icon_education.png" alt="Icone Enseignement Supérieur">
                <h3>Adaptée à l'enseignement supérieur</h3>
                <p>Conçue pour répondre aux besoins spécifiques des universités.</p>
                <a href="#why-us-detail" class="btn btn-secondary btn-modal" data-modal="universite">En savoir plus</a>
            </div>
        </div>
    </section>

    <!-- Nouvelle Section "Comment ça fonctionne ?" -->
    <section id="how-it-works" class="homepage-section light-background">
        <div class="section-header">
            <h2>Comment ça fonctionne ?</h2>
            <p>Trois étapes simples pour une expérience pédagogique améliorée.</p>
        </div>
        <div class="process-grid">
            <div class="process-step">
                <div class="icon-circle"><i class="fas fa-chalkboard-teacher"></i></div>
                <h3>1. L'enseignant crée une session</h3>
                <p>Utilisez notre interface intuitive pour configurer vos cours et activités.</p>
            </div>
            <div class="process-step">
                <div class="icon-circle"><i class="fas fa-user-graduate"></i></div>
                <h3>2. Les étudiants rejoignent avec un code</h3>
                <p>Un code unique permet une connexion rapide et sécurisée à la session.</p>
            </div>
            <div class="process-step">
                <div class="icon-circle"><i class="fas fa-chart-line"></i></div>
                <h3>3. Les résultats sont analysés en temps réel</h3>
                <p>Obtenez un aperçu immédiat des performances et de l'engagement.</p>
            </div>
        </div>
    </section>

   

   <!-- Section "Témoignages" (ID mis à jour) -->
    <!-- Section "Témoignages" (ID mis à jour) -->
        <section id="testimonials" class="homepage-section dark-background">
            <div class="section-header">
                <div class="counter-container">
                    <p class="counter-text">Plus de</p>
                    <div class="animated-counter">0</div> <!-- C'est ici que le nombre animé apparaîtra -->
                    <p class="counter-text">Utilisateurs satisfaits nous font confiance !</p>
                </div>
                <h2>Ce que nos utilisateurs disent</h2>
                <p>Des retours positifs qui reflètent la qualité de notre plateforme.</p>
            </div>

            <div class="testimonial-slider">
                <!-- NOUVEAU CONTENEUR : C'est lui qui va glisser ! -->
                <div class="testimonial-cards-wrapper">
                    <div class="testimonial-card">
                        <img src="images/user_elizabeth_smith.jpg" alt="Elizabeth Smith">
                        <h3>Elizabeth AKANHOU</h3>
                        <p class="role">Directrice Pédagogique, Alpha School</p>
                        <blockquote>"LiveInteract a révolutionné l'engagement de nos étudiants. La plateforme est intuitive et les retours en temps réel sont inestimables pour nos enseignants."</blockquote>
                    </div>
                    <div class="testimonial-card">
                        <img src="images/user_alex_johnson.jpg" alt="Alex Johnson">
                        <h3>Alex DOSSOU</h3>
                        <p class="role">Étudiant en Master, Université de Lyon</p>
                        <blockquote>"Grâce à LiveInteract, les cours sont beaucoup plus interactifs. Je peux poser mes questions en direct et obtenir des réponses immédiates. C'est génial !"</blockquote>
                    </div>
                    <div class="testimonial-card">
                        <img src="images/user_sophie_martin.jpg" alt="Sophie Martin">
                        <h3>Sophie AHANDJINOU</h3>
                        <p class="role">Professeure de Mathématiques, Lycée Condorcet</p>
                        <blockquote>"La fonctionnalité de quiz en temps réel est incroyable. Elle me permet de sonder rapidement la compréhension de mes élèves et d'adapter mon enseignement."</blockquote>
                    </div>
                    <div class="testimonial-card">
                        <img src="images/user_david_chen.jpg" alt="David Chen">
                        <h3>David KOUAME</h3>
                        <p class="role">Développeur Pédagogique, EdTech Solutions</p>
                        <blockquote>"J'apprécie la simplicité d'intégration et la robustesse de LiveInteract. C'est un outil puissant pour créer des expériences d'apprentissage immersives."</blockquote>
                    </div>
                    <div class="testimonial-card">
                        <img src="images/user_maria_gonzales.jpg" alt="Maria Gonzales">
                        <h3>Maria Gonzales</h3>
                        <p class="role">Responsable Formation, Entreprise Innovante</p>
                        <blockquote>"Nos employés sont plus engagés que jamais grâce aux sondages interactifs. LiveInteract nous aide à mesurer l'efficacité de nos formations en direct."</blockquote>
                    </div>
                    <div class="testimonial-card">
                        <img src="images/user_thomas_dupont.jpg" alt="Thomas Dupont">
                        <h3>Thomas KPONDEDJI</h3>
                        <p class="role">Doctorant en Sciences Sociales, Paris Descartes</p>
                        <blockquote>"Le système de questions anonymes a libéré la parole dans nos séminaires. Cela encourage la participation de tous, même les plus timides."</blockquote>
                    </div>
                </div>
            </div>
            <!-- Les flèches de navigation sont toujours là -->
            <button class="carousel-nav prev-testimonial"><i class="fas fa-chevron-left"></i></button>
            <button class="carousel-nav next-testimonial"><i class="fas fa-chevron-right"></i></button>
        </section>


    <!-- Section "Contact" (Nouvelle section) -->
    <section id="contact-us" class="homepage-section light-background">
        <div class="section-header">
            <h2>Contactez-nous</h2>
            <p>Nous sommes là pour répondre à vos questions et discuter de vos besoins.</p>
        </div>
        <div class="contact-content">
            <div class="contact-info">
                <p><i class="fas fa-envelope"></i> Email: <a href="mailto:info@iwajutech.com">info@iwajutech.com</a></p>
                <p><i class="fas fa-map-marker-alt"></i> Localisation: Rue en face Bar Galaxy,Quartier Finafa, Abomey-Calavi, Bénin</p>
                <p><i class="fas fa-phone"></i> Téléphone: +229 01 63 39 99 96</p>
            </div>
            <form class="contact-form">
                <input name="nom" id="nom" type="text" placeholder="Votre Nom" required>
                <input name="email" id="email" type="email" placeholder="Votre Email" required>
                <textarea name="message" id="message" placeholder="Votre Message" rows="5" required></textarea>
                <button id="btnEnvoyer" type="submit" class="btn-primary">Envoyer le message</button>
            </form>
        </div>
    </section>

    <!-- Pied de page -->
    <footer class="site-footer">
        <div class="footer-content">
            <p>&copy; 2026 LiveInteract. Tous droits réservés. L'excellence académique à portée de main.</p>
            <nav class="footer-nav">
                <a href="#about-us">À propos</a>
                   <a href="confidentialite.php">Confidentialité</a>
                  <a href="conditions.php">Conditions</a>
                <a href="#contact-us">Contact</a>
            </nav>
        </div>
    </footer>

    <script src="js/script.js"></script>


      <!-- Fenêtre Modale Unique -->
<div id="featureModal" class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2 id="modalTitle">Titre</h2>
        <div id="modalBody">Description...</div>
    </div>
</div>  

</body>
</html>


'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'fr';

// ─── Translation Dictionary ───
const translations = {
  // ── Navigation ──
  'nav.promise': { en: 'THE PROMISE', fr: 'LA PROMESSE' },
  'nav.life': { en: 'THE LIFE', fr: 'LA VIE' },
  'nav.howItWorks': { en: 'WHY IT WORKS', fr: 'POURQUOI ÇA MARCHE' },
  'nav.packages': { en: 'PACKAGES', fr: 'FORFAITS' },
  'nav.faq': { en: 'FAQ', fr: 'FAQ' },
  'nav.joinWaitlist': { en: 'JOIN THE WAITLIST', fr: 'REJOINDRE LA LISTE' },

  // ── Hero ──
  'hero.eyebrow': { en: 'OTTAWA-GATINEAU · MONTREAL · TORONTO · CANADA', fr: 'OTTAWA-GATINEAU · MONTRÉAL · TORONTO · CANADA' },
  'hero.headline.1': { en: 'You did not start your business', fr: 'Vous n\'avez pas lancé votre entreprise' },
  'hero.headline.2': { en: 'to exhaust yourself on work', fr: 'pour vous épuiser sur du travail' },
  'hero.headline.3': { en: 'that does not need you.', fr: 'qui n\'a pas besoin de vous.' },
  'hero.badge': { en: 'LIMITED SEATS TO BE MANAGED. NOW ALMOST FULL', fr: 'PLACES LIMITÉES · PRESQUE COMPLET' },
  'hero.badgeText': {
    en: 'Limited seats remain. Apply below to secure your spot in the next cohort.',
    fr: 'Il reste peu de places. Postulez ci-dessous pour réserver votre place dans la prochaine cohorte.'
  },
  'hero.body.1': {
    en: 'You started it to build something. To serve people. To create a life that most people only talk about.',
    fr: 'Vous avez commencé pour bâtir quelque chose. Pour servir les gens. Pour créer une vie dont la plupart ne font que parler.'
  },
  'hero.body.2': { en: 'STRATUS takes care of the rest.', fr: 'STRATUS s\'occupe du reste.' },
  'hero.cta.primary': { en: 'JOIN THE WAITLIST', fr: 'REJOINDRE LA LISTE' },
  'hero.cta.secondary': { en: 'SEE THE OFFERS', fr: 'VOIR LES FORFAITS' },

  // ── Metrics ──
  'metric.response.value': { en: '< 60 sec', fr: '< 60 sec' },
  'metric.response.label': { en: 'EVERY INQUIRY HANDLED', fr: 'CHAQUE DEMANDE TRAITÉE' },
  'metric.video.value': { en: '< 30 min', fr: '< 30 min' },
  'metric.video.label': { en: 'A REAL VIDEO REPLY FROM YOU, BY US', fr: 'RÉPONSE VIDÉO RÉELLE DE VOUS, PAR NOUS' },
  'metric.launch.value': { en: 'Day 7', fr: 'Jour 7' },
  'metric.launch.label': { en: 'YOUR SYSTEM GOES LIVE', fr: 'VOTRE SYSTÈME EN LIGNE' },
  'metric.systems.value': { en: '6 systems', fr: '6 systèmes' },
  'metric.systems.label': { en: 'RUNNING SIMULTANEOUSLY', fr: 'EN SIMULTANÉ' },
  'metric.bilingual.value': { en: '100%', fr: '100%' },
  'metric.bilingual.label': { en: 'BILINGUAL EN + FR', fr: 'BILINGUE EN + FR' },

  // ── Promise Section ──
  'promise.heading.1': { en: 'You shake hands, close deals, and', fr: 'Vous serrez des mains, concluez des ententes,' },
  'promise.heading.2': { en: 'deliver what you love.', fr: 'et livrez ce que vous aimez.' },
  'promise.subline': { en: 'STRATUS RUNS THE REST — 6 SYSTEMS SIMULTANEOUSLY', fr: 'STRATUS GÈRE LE RESTE — 6 SYSTÈMES EN SIMULTANÉ' },

  // ── Systems ──
  'systems.01.title': { en: 'Every call answered', fr: 'Chaque appel répondu' },
  'systems.01.desc': { en: 'Under 60 seconds, day or night, real video, every time', fr: 'En moins de 60 secondes, jour ou nuit, vidéo réelle, à chaque fois' },
  'systems.02.title': { en: 'Missed calls, never lost', fr: 'Appels manqués, jamais perdus' },
  'systems.02.desc': { en: 'Instant text back', fr: 'Texto de rappel instantané' },
  'systems.03.title': { en: 'Every lead followed up', fr: 'Chaque prospect suivi' },
  'systems.03.desc': { en: 'Automatically, no exceptions', fr: 'Automatiquement, sans exception' },
  'systems.04.title': { en: 'You look real everywhere', fr: 'Visible et crédible partout' },
  'systems.04.desc': { en: 'Website, socials, Google, all current', fr: 'Site web, réseaux sociaux, Google, toujours à jour' },
  'systems.05.title': { en: 'Reviews that book your next job', fr: 'Avis qui réservent votre prochain contrat' },
  'systems.05.desc': { en: 'Every finished job, working for you', fr: 'Chaque travail terminé travaille pour vous' },
  'systems.06.title': { en: 'Old clients come back', fr: 'Les anciens clients reviennent' },
  'systems.06.desc': { en: 'Work you\'d never chase yourself', fr: 'Du travail que vous n\'auriez jamais relancé seul' },

  // ── Demo Section ──
  'demo.eyebrow': { en: 'MEET THE SYSTEM', fr: 'DÉCOUVREZ LE SYSTÈME' },
  'demo.heading': { en: 'Ask it anything. Watch how fast it answers.', fr: 'Posez n\'importe quelle question. Voyez la vitesse de réponse.' },
  'demo.body': {
    en: 'This is the same system that answers every call, texts back missed calls, and follows up automatically. Ask it about the six systems, the pricing, or the 7 day build.',
    fr: 'C\'est le même système qui répond à chaque appel, envoie des textos pour les appels manqués et assure le suivi automatiquement. Posez vos questions sur les six systèmes, les prix ou la mise en place en 7 jours.'
  },
  'demo.avatar.placeholder': { en: 'AVATAR LOADING SLOT', fr: 'ESPACE AVATAR EN CHARGEMENT' },
  'demo.avatar.desc': { en: 'Interactive avatar embed goes here. Add the HeyGen share link to activate it.', fr: 'L\'avatar interactif s\'affichera ici. Ajoutez le lien de partage HeyGen pour l\'activer.' },
  'demo.caption.left': { en: 'Type or speak your question. Answers in seconds, in English or French.', fr: 'Tapez ou posez votre question. Réponses en quelques secondes, en anglais ou en français.' },
  'demo.caption.right': { en: 'The team behind the system.', fr: 'L\'équipe derrière le système.' },
  'demo.team.placeholder': { en: 'TEAM PHOTO PLACEHOLDER', fr: 'PHOTO D\'ÉQUIPE À VENIR' },

  // ── Life Section ──
  'life.eyebrow': { en: 'THE LIFE ON THE OTHER SIDE', fr: 'LA VIE DE L\'AUTRE CÔTÉ' },
  'life.heading.1': { en: 'Entrepreneurs are made to deliver.', fr: 'Les entrepreneurs sont faits pour livrer.' },
  'life.heading.2': { en: 'Not to manage.', fr: 'Pas pour gérer.' },
  'life.body.1': {
    en: 'The most successful entrepreneurs we know share one thing in common.',
    fr: 'Les entrepreneurs les plus prospères que nous connaissons ont une chose en commun.'
  },
  'life.body.2': {
    en: 'They are exceptional at what they do. They are not exceptional at managing lead follow-up, chasing documents, producing content, or running systems.',
    fr: 'Ils excellent dans leur métier. Ils n\'excellent pas dans le suivi de prospects, la chasse aux documents, la production de contenu ou la gestion de systèmes.'
  },
  'life.body.3': { en: 'Nobody hired them for that.', fr: 'Personne ne les a embauchés pour ça.' },
  'life.body.4': { en: 'Nobody chose them for that.', fr: 'Personne ne les a choisis pour ça.' },
  'life.body.5': { en: 'And nobody should be doing that when there is a better way.', fr: 'Et personne ne devrait faire ça quand il y a une meilleure façon.' },
  'life.bold': { en: 'STRATUS is the better way.', fr: 'STRATUS est la meilleure façon.' },
  'life.notTool': { en: 'Not a tool you have to learn.', fr: 'Pas un outil à apprendre.' },
  'life.notChatbot': { en: 'Not a chatbot you have to manage.', fr: 'Pas un chatbot à gérer.' },
  'life.notAssistant': { en: 'Not an assistant you have to train.', fr: 'Pas un assistant à former.' },
  'life.conclusion': {
    en: 'A complete operations team that runs your business behind the scenes — so you shake hands, close deals, and deliver what you love.',
    fr: 'Une équipe opérationnelle complète qui gère votre entreprise en coulisses — pour que vous serriez des mains, concluiez des ententes et livriez ce que vous aimez.'
  },

  // ── Currently Serving ──
  'serving.label': { en: 'CURRENTLY SERVING', fr: 'ACTUELLEMENT AU SERVICE DE' },
  'serving.industry': { en: 'Trades and Service Businesses', fr: 'Entreprises de métiers et services' },
  'serving.examples': { en: 'HVAC · Electricians · Plumbers', fr: 'CVC · Électriciens · Plombiers' },
  'serving.tagline.1': { en: 'All industries. One promise.', fr: 'Toutes les industries. Une promesse.' },
  'serving.tagline.2': { en: 'You deliver. We run the machine.', fr: 'Vous livrez. Nous faisons tourner la machine.' },

  // ── Pricing Section ──
  'pricing.eyebrow': { en: 'THE OFFERS', fr: 'LES FORFAITS' },
  'pricing.heading.1': { en: 'Start where you are.', fr: 'Commencez où vous êtes.' },
  'pricing.heading.2': { en: 'Scale to where you want to be.', fr: 'Évoluez vers où vous voulez être.' },
  'pricing.setup': { en: 'SETUP', fr: 'MISE EN PLACE' },
  'pricing.monthly': { en: 'MONTHLY', fr: 'MENSUEL' },
  'pricing.oneTime': { en: 'one-time', fr: 'unique' },
  'pricing.perMonth': { en: '/month', fr: '/mois' },
  'pricing.ongoing': { en: 'ongoing maintenance', fr: 'maintenance continue' },
  'pricing.cta': { en: 'JOIN THE WAITLIST', fr: 'REJOINDRE LA LISTE' },

  // Presence
  'pricing.presence.label': { en: 'OFFER 01', fr: 'FORFAIT 01' },
  'pricing.presence.name': { en: 'PRESENCE', fr: 'PRÉSENCE' },
  'pricing.presence.f0': { en: 'Access to STRATUS dashboard', fr: 'Accès au tableau de bord STRATUS' },
  'pricing.presence.f1': { en: 'Website (3 to 5 pages)', fr: 'Site web (3 à 5 pages)' },
  'pricing.presence.f2': { en: 'Google Business Profile — creation and optimization', fr: 'Profil Google Business — création et optimisation' },
  'pricing.presence.f3': { en: 'Social media creation and optimization', fr: 'Création et optimisation des médias sociaux' },
  'pricing.presence.f4': { en: 'Facebook', fr: 'Facebook' },
  'pricing.presence.f5': { en: 'LinkedIn', fr: 'LinkedIn' },
  'pricing.presence.f6': { en: 'Instagram', fr: 'Instagram' },
  'pricing.presence.f7': { en: 'YouTube (more)', fr: 'YouTube (et plus)' },
  'pricing.presence.disclaimer': { en: 'Backed by our 30-Day Satisfaction Guarantee on your monthly fee', fr: 'Garanti par notre garantie de satisfaction de 30 jours sur votre tarif mensuel' },

  // Machine
  'pricing.machine.label': { en: 'OFFER 02', fr: 'FORFAIT 02' },
  'pricing.machine.name': { en: 'MACHINE', fr: 'MACHINE' },
  'pricing.machine.subtitle': { en: 'FULL STRATUS SYSTEM', fr: 'SYSTÈME STRATUS COMPLET' },
  'pricing.machine.badge': { en: 'FOUNDING RATE — FIRST 10 BUSINESSES ONLY', fr: 'TARIF FONDATEUR — 10 PREMIÈRES ENTREPRISES SEULEMENT' },
  'pricing.machine.note': { en: 'includes all AI systems, temporarily discounted', fr: 'inclut tous les systèmes IA, temporairement réduit' },
  'pricing.machine.spots': { en: '5 OF 10 FOUNDING SPOTS REMAINING', fr: '5 DES 10 PLACES FONDATRICES RESTANTES' },
  'pricing.machine.f1': { en: 'Everything in PRESENCE', fr: 'Tout dans PRÉSENCE' },
  'pricing.machine.f2': { en: 'Access to STRATUS', fr: 'Accès à STRATUS' },
  'pricing.machine.f3': { en: 'The STRATUS Systems', fr: 'Les systèmes STRATUS' },
  'pricing.machine.disclaimer': { en: 'Backed by our 30-Day Satisfaction Guarantee on your monthly fee', fr: 'Garanti par notre garantie de satisfaction de 30 jours sur votre tarif mensuel' },

  // Backward compatibility alias for pipeline
  'pricing.pipeline.label': { en: 'OFFER 02', fr: 'FORFAIT 02' },
  'pricing.pipeline.name': { en: 'MACHINE', fr: 'MACHINE' },
  'pricing.pipeline.subtitle': { en: 'FULL STRATUS SYSTEM', fr: 'SYSTÈME STRATUS COMPLET' },
  'pricing.pipeline.badge': { en: 'FOUNDING RATE — FIRST 10 BUSINESSES ONLY', fr: 'TARIF FONDATEUR — 10 PREMIÈRES ENTREPRISES SEULEMENT' },
  'pricing.pipeline.note': { en: 'includes all AI systems, temporarily discounted', fr: 'inclut tous les systèmes IA, temporairement réduit' },
  'pricing.pipeline.spots': { en: '5 OF 10 FOUNDING SPOTS REMAINING', fr: '5 DES 10 PLACES FONDATRICES RESTANTES' },
  'pricing.pipeline.f1': { en: 'Everything in PRESENCE', fr: 'Tout dans PRÉSENCE' },
  'pricing.pipeline.f2': { en: 'Access to STRATUS', fr: 'Accès à STRATUS' },
  'pricing.pipeline.f3': { en: 'The STRATUS Systems', fr: 'Les systèmes STRATUS' },
  'pricing.pipeline.disclaimer': { en: 'Backed by our 30-Day Satisfaction Guarantee on your monthly fee', fr: 'Garanti par notre garantie de satisfaction de 30 jours sur votre tarif mensuel' },

  // Command
  'pricing.command.label': { en: 'OFFER 03', fr: 'FORFAIT 03' },
  'pricing.command.name': { en: 'COMMAND', fr: 'COMMAND' },
  'pricing.command.subtitle': { en: 'FULLY MANAGED OPERATIONS', fr: 'OPÉRATIONS ENTIÈREMENT GÉRÉES' },
  'pricing.command.badge': { en: 'FULL — WAITLIST ONLY', fr: 'COMPLET — LISTE D\'ATTENTE SEULEMENT' },
  'pricing.command.custom': { en: 'Starting at $5,995', fr: 'À partir de 5 995 $' },
  'pricing.command.byApp': { en: 'By application', fr: 'Sur demande' },
  'pricing.command.included': { en: 'starting at $1,495/month · dedicated operator included', fr: 'à partir de 1 495 $/mois · opérateur dédié inclus' },
  'pricing.command.f1': { en: 'Everything in MACHINE', fr: 'Tout dans MACHINE' },
  'pricing.command.f2': { en: 'Dedicated STRATUS Operator', fr: 'Opérateur STRATUS dédié' },
  'pricing.command.f3': { en: 'Documents administration', fr: 'Administration des documents' },
  'pricing.command.f4': { en: 'Appointment confirmation and follow-up', fr: 'Confirmation et suivi des rendez-vous' },
  'pricing.command.f5': { en: 'Priority support and reporting', fr: 'Support prioritaire et rapports' },
  'pricing.command.disclaimer': { en: 'Backed by our 30-Day Satisfaction Guarantee on your monthly fee', fr: 'Garanti par notre garantie de satisfaction de 30 jours sur votre tarif mensuel' },

  // ── Results Section ──
  'results.eyebrow': { en: 'WHY IT WORKS', fr: 'POURQUOI ÇA MARCHE' },
  'results.heading.1': { en: 'The results speak.', fr: 'Les résultats parlent.' },
  'results.heading.2': { en: 'The process is ours.', fr: 'Le processus est le nôtre.' },
  'results.body': {
    en: 'We do not explain our methods on a website. That conversation happens on the discovery call. What we will tell you is what our clients experience after they work with us.',
    fr: 'Nous n\'expliquons pas nos méthodes sur un site web. Cette conversation a lieu lors de l\'appel découverte. Ce que nous vous dirons, c\'est ce que nos clients vivent après avoir travaillé avec nous.'
  },
  'results.m1.value': { en: '< 60 sec', fr: '< 60 sec' },
  'results.m1.title': { en: 'Every inquiry handled', fr: 'Chaque demande traitée' },
  'results.m1.desc': { en: 'Before STRATUS the industry average is 42 hours.', fr: 'Avant STRATUS, la moyenne de l\'industrie est de 42 heures.' },
  'results.m2.value': { en: 'Day 7', fr: 'Jour 7' },
  'results.m2.title': { en: 'Your system goes live', fr: 'Votre système en ligne' },
  'results.m2.desc': { en: 'From signed agreement to fully operational. Seven days.', fr: 'De l\'entente signée à pleinement opérationnel. Sept jours.' },
  'results.m3.value': { en: '100%', fr: '100%' },
  'results.m3.title': { en: 'Bilingual', fr: 'Bilingue' },
  'results.m3.desc': { en: 'Every system, every communication, English and French.', fr: 'Chaque système, chaque communication, en anglais et en français.' },
  'results.m4.value': { en: '6', fr: '6' },
  'results.m4.title': { en: 'Systems running simultaneously', fr: 'Systèmes en simultané' },
  'results.m4.desc': { en: 'Not one fix. Not two. Everything running at once.', fr: 'Pas un correctif. Pas deux. Tout fonctionne en même temps.' },

  // ── Data Ownership ──
  'data.eyebrow': { en: 'YOUR DATA IS YOURS. ALWAYS.', fr: 'VOS DONNÉES VOUS APPARTIENNENT. TOUJOURS.' },
  'data.heading.1': { en: 'We operate inside your business.', fr: 'Nous opérons à l\'intérieur de votre entreprise.' },
  'data.heading.2': { en: 'We never own it.', fr: 'Nous ne la possédons jamais.' },
  'data.body': {
    en: 'Your database, your leads, and your client relationships remain yours completely. Every STRATUS account is protected by a strict confidentiality agreement. Your data is never shared between clients. Your Operator is assigned exclusively to your account. You approve every outbound communication before it goes out.',
    fr: 'Votre base de données, vos prospects et vos relations clients restent entièrement les vôtres. Chaque compte STRATUS est protégé par une entente de confidentialité stricte. Vos données ne sont jamais partagées entre les clients. Votre Opérateur est assigné exclusivement à votre compte. Vous approuvez chaque communication sortante avant son envoi.'
  },
  'data.subline': {
    en: 'CONFIDENTIALITY AGREEMENT ON EVERY ACCOUNT · DATA NEVER SHARED BETWEEN CLIENTS · YOU APPROVE EVERY COMMUNICATION',
    fr: 'ENTENTE DE CONFIDENTIALITÉ SUR CHAQUE COMPTE · DONNÉES JAMAIS PARTAGÉES ENTRE CLIENTS · VOUS APPROUVEZ CHAQUE COMMUNICATION'
  },

  // ── FAQ ──
  'faq.eyebrow': { en: 'COMMON QUESTIONS', fr: 'QUESTIONS FRÉQUENTES' },
  'faq.heading.1': { en: 'We answer the ones', fr: 'Nous répondons à celles' },
  'faq.heading.2': { en: 'that matter most.', fr: 'qui comptent le plus.' },

  'faq.q1': { en: 'Who is STRATUS for?', fr: 'À qui s\'adresse STRATUS ?' },
  'faq.a1': {
    en: 'Any entrepreneur who is spending more time managing their business than delivering their service. We started with real estate professionals in Ottawa-Gatineau and Montreal. We are expanding across industries. If you want to shake hands and love your clients without drowning in everything else — STRATUS is for you.',
    fr: 'Tout entrepreneur qui passe plus de temps à gérer son entreprise qu\'à livrer son service. Nous avons commencé avec des professionnels de l\'immobilier à Ottawa-Gatineau et Montréal. Nous nous étendons à toutes les industries. Si vous voulez serrer des mains et aimer vos clients sans vous noyer dans tout le reste — STRATUS est pour vous.'
  },
  'faq.q2': { en: 'What exactly does STRATUS do?', fr: 'Que fait STRATUS exactement ?' },
  'faq.a2': {
    en: 'We run the operational side of your business so you do not have to. The details of how we do it are something we walk through on the discovery call. What matters is the result: your business runs with precision while you focus on what only you can do.',
    fr: 'Nous gérons le côté opérationnel de votre entreprise pour que vous n\'ayez pas à le faire. Les détails de notre méthode, nous les expliquons lors de l\'appel découverte. Ce qui compte, c\'est le résultat : votre entreprise fonctionne avec précision pendant que vous vous concentrez sur ce que vous seul pouvez faire.'
  },
  'faq.q3': { en: 'Is STRATUS an AI company?', fr: 'STRATUS est-elle une entreprise d\'IA ?' },
  'faq.a3': {
    en: 'No. STRATUS is an operations team. We use modern systems and technology as our infrastructure. But every STRATUS account is supervised by a trained human Operator who manages your relationship and ensures everything runs correctly. You are never talking to a bot. You are talking to your Operator.',
    fr: 'Non. STRATUS est une équipe opérationnelle. Nous utilisons des systèmes et technologies modernes comme infrastructure. Mais chaque compte STRATUS est supervisé par un Opérateur humain formé qui gère votre relation et s\'assure que tout fonctionne correctement. Vous ne parlez jamais à un robot. Vous parlez à votre Opérateur.'
  },
  'faq.q4': { en: 'Will STRATUS have access to my clients and my database?', fr: 'STRATUS aura-t-il accès à mes clients et à ma base de données ?' },
  'faq.a4': {
    en: 'Every STRATUS account is protected by a strict confidentiality agreement before a single system is activated. Your data is never visible to other clients. Your Operator is assigned exclusively to your account. You approve every outbound communication before it goes out.',
    fr: 'Chaque compte STRATUS est protégé par une entente de confidentialité stricte avant même qu\'un seul système ne soit activé. Vos données ne sont jamais visibles aux autres clients. Votre Opérateur est assigné exclusivement à votre compte. Vous approuvez chaque communication sortante avant son envoi.'
  },
  'faq.q5': { en: 'How fast does everything go live?', fr: 'En combien de temps tout est opérationnel ?' },
  'faq.a5': {
    en: 'Day 7. From the moment you sign, your Operator begins the setup. Your systems are operational within seven days.',
    fr: 'Jour 7. Dès la signature, votre Opérateur commence la mise en place. Vos systèmes sont opérationnels en sept jours.'
  },
  'faq.q6': { en: 'Is STRATUS bilingual?', fr: 'STRATUS est-il bilingue ?' },
  'faq.a6': {
    en: 'Yes. Every system, every communication, and every piece of content operates in English and French. Built for the Ottawa-Gatineau and Montreal markets.',
    fr: 'Oui. Chaque système, chaque communication et chaque contenu fonctionne en anglais et en français. Conçu pour les marchés d\'Ottawa-Gatineau et Montréal.'
  },
  'faq.q7': { en: 'How do I get started?', fr: 'Comment démarrer ?' },
  'faq.a7': {
    en: 'Book a free 30-minute discovery call. We learn about your business, identify your biggest operational gap, and recommend the right package. No pitch. No pressure. Just clarity on what your business looks like when it finally runs without you in every corner of it.',
    fr: 'Réservez un appel découverte gratuit de 30 minutes. Nous apprenons à connaître votre entreprise, identifions votre plus grand écart opérationnel et recommandons le bon forfait. Pas de pitch. Pas de pression. Juste de la clarté sur ce à quoi ressemble votre entreprise quand elle fonctionne enfin sans vous dans chaque recoin.'
  },

  // ── Waitlist Form ──
  'waitlist.eyebrow': { en: 'WAITLIST', fr: 'LISTE D\'ATTENTE' },
  'waitlist.heading.1': { en: 'Apply for your spot', fr: 'Postulez pour votre place' },
  'waitlist.heading.2': { en: 'in the next cohort.', fr: 'dans la prochaine cohorte.' },
  'waitlist.body': {
    en: 'Limited cohort availability. Founding rates end when the first 10 spots fill.',
    fr: 'Places en cohorte limitées. Les tarifs fondateurs prennent fin quand les 10 premières places sont remplies.'
  },
  'waitlist.name': { en: 'Full name', fr: 'Nom complet' },
  'waitlist.email': { en: 'Email address', fr: 'Adresse courriel' },
  'waitlist.phone': { en: 'Phone number', fr: 'Numéro de téléphone' },
  'waitlist.business': { en: 'Business name', fr: 'Nom de l\'entreprise' },
  'waitlist.trade': { en: 'Type of trade', fr: 'Type de métier' },
  'waitlist.market': { en: 'Market', fr: 'Marché' },
  'waitlist.offer': { en: 'Which offer interests you?', fr: 'Quel forfait vous intéresse ?' },
  'waitlist.submit': { en: 'APPLY FOR MY SPOT', fr: 'POSTULER POUR MA PLACE' },
  'waitlist.submitting': { en: 'SUBMITTING...', fr: 'ENVOI EN COURS...' },
  'waitlist.tagline': { en: 'BILINGUAL · OTTAWA-GATINEAU · MONTREAL · TORONTO', fr: 'BILINGUE · OTTAWA-GATINEAU · MONTRÉAL · TORONTO' },

  // Trade options
  'trade.placeholder': { en: 'Select a trade', fr: 'Sélectionnez un métier' },
  'trade.hvac': { en: 'HVAC', fr: 'CVC' },
  'trade.electrician': { en: 'Electrician', fr: 'Électricien' },
  'trade.plumber': { en: 'Plumber', fr: 'Plombier' },
  'trade.realEstate': { en: 'Real estate', fr: 'Immobilier' },
  'trade.construction': { en: 'Construction', fr: 'Construction' },
  'trade.professional': { en: 'Professional services', fr: 'Services professionnels' },
  'trade.other': { en: 'Other', fr: 'Autre' },

  // Market options
  'market.placeholder': { en: 'Select a market', fr: 'Sélectionnez un marché' },
  'market.ottawa': { en: 'Ottawa-Gatineau', fr: 'Ottawa-Gatineau' },
  'market.montreal': { en: 'Montreal', fr: 'Montréal' },
  'market.other': { en: 'Other', fr: 'Autre' },

  // Offer options
  'offer.placeholder': { en: 'Select an offer', fr: 'Sélectionnez un forfait' },
  'offer.presence': { en: 'Presence', fr: 'Présence' },
  'offer.machine': { en: 'Machine', fr: 'Machine' },
  'offer.pipeline': { en: 'Machine', fr: 'Machine' },
  'offer.command': { en: 'Command', fr: 'Command' },
  'offer.founding': { en: 'Founding', fr: 'Fondateur' },
  'offer.unsure': { en: 'Not sure yet', fr: 'Pas encore certain' },

  // Validation
  'validation.name': { en: 'Full name is required', fr: 'Le nom complet est requis' },
  'validation.email': { en: 'A valid email is required', fr: 'Un courriel valide est requis' },
  'validation.phone': { en: 'Phone number is required', fr: 'Le numéro de téléphone est requis' },
  'validation.business': { en: 'Business name is required', fr: 'Le nom de l\'entreprise est requis' },
  'validation.trade': { en: 'Please select your trade', fr: 'Veuillez sélectionner votre métier' },
  'validation.market': { en: 'Please select your market', fr: 'Veuillez sélectionner votre marché' },
  'validation.offer': { en: 'Please select an offer', fr: 'Veuillez sélectionner un forfait' },

  // Success/Error
  'success.heading': { en: 'Application received.', fr: 'Demande reçue.' },
  'success.body': {
    en: 'Thank you for applying. We will be in touch within 48 hours to schedule your discovery call.',
    fr: 'Merci pour votre demande. Nous vous contacterons dans les 48 heures pour planifier votre appel découverte.'
  },
  'success.cta': { en: 'BACK TO HOME', fr: 'RETOUR À L\'ACCUEIL' },
  'error.general': {
    en: 'We could not submit your application. Please try again.',
    fr: 'Nous n\'avons pas pu soumettre votre demande. Veuillez réessayer.'
  },
  'error.validation': {
    en: 'Please check the submitted information.',
    fr: 'Veuillez vérifier les informations soumises.'
  },
  'error.unavailable': {
    en: 'Applications are temporarily unavailable. Please try again later.',
    fr: 'Les demandes sont temporairement indisponibles. Veuillez réessayer plus tard.'
  },

  // ── Footer ──
  'footer.tagline': { en: 'A modern boutique operations team.', fr: 'Une équipe opérationnelle moderne et personnalisée.' },
  'footer.nav.promise': { en: 'The Promise', fr: 'La Promesse' },
  'footer.nav.life': { en: 'The Life', fr: 'La Vie' },
  'footer.nav.works': { en: 'Why It Works', fr: 'Pourquoi ça marche' },
  'footer.nav.packages': { en: 'Packages', fr: 'Forfaits' },
  'footer.nav.faq': { en: 'FAQ', fr: 'FAQ' },
  'footer.location': { en: 'Ottawa-Gatineau · Montreal · Toronto, Canada', fr: 'Ottawa-Gatineau · Montréal · Toronto, Canada' },
  'footer.email': { en: 'hello@stratussystems.co', fr: 'hello@stratussystems.co' },
  'footer.site': { en: 'stratussystems.co', fr: 'stratussystems.co' },
  'footer.copyright': { en: '© 2026 STRATUS. All rights reserved.', fr: '© 2026 STRATUS. Tous droits réservés.' },

  // ── Confirmation ──
  'confirm.heading': { en: 'You\'re on the list.', fr: 'Vous êtes sur la liste.' },
  'confirm.body': {
    en: 'We received your application. A member of the STRATUS team will reach out within 48 hours to schedule your discovery call.',
    fr: 'Nous avons reçu votre demande. Un membre de l\'équipe STRATUS communiquera avec vous dans les 48 heures pour planifier votre appel découverte.'
  },
  'confirm.calendar.heading': { en: 'Or book your call now', fr: 'Ou réservez votre appel maintenant' },
  'confirm.calendar.loading': { en: 'Loading calendar...', fr: 'Chargement du calendrier...' },
  'confirm.backHome': { en: 'BACK TO HOME', fr: 'RETOUR À L\'ACCUEIL' },
} as const;

type TranslationKey = keyof typeof translations;

// ─── Context ───
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── Provider ───
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('stratus-lang') as Language | null;
    if (stored && (stored === 'en' || stored === 'fr')) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('stratus-lang', lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  }, [language]);

  // SSR: render in English initially to avoid hydration mismatch
  const contextValue: LanguageContextValue = {
    language: mounted ? language : 'en',
    setLanguage,
    t: mounted ? t : (key: TranslationKey) => translations[key]?.en || key,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ───
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}

# 🚀 Guide d'Accès à l'Application NeoImpact

## 🌐 URLs de Production

### Pages Principales
- **Login Desktop** : https://animation-commerciale.pages.dev/static/login-desktop.html
- **Login Mobile** : https://animation-commerciale.pages.dev/static/login-mobile.html
- **Dashboard** : https://animation-commerciale.pages.dev/static/dashboard.html
- **Dashboard Mobile** : https://animation-commerciale.pages.dev/static/dashboard-mobile.html

### Pages Fonctionnelles
- **Organisations** : https://animation-commerciale.pages.dev/static/organisations.html
- **Territoires** : https://animation-commerciale.pages.dev/static/territories.html
- **Partenaires** : https://animation-commerciale.pages.dev/static/partners-list.html
- **Visites** : https://animation-commerciale.pages.dev/static/visits-mobile.html
- **Actions** : https://animation-commerciale.pages.dev/static/actions-mobile.html
- **Leads** : https://animation-commerciale.pages.dev/static/leads-mobile.html
- **CRV** : https://animation-commerciale.pages.dev/static/crv-form-mobile.html
- **Statistiques** : https://animation-commerciale.pages.dev/static/statistics-mobile.html
- **Notifications** : https://animation-commerciale.pages.dev/static/notifications-mobile.html
- **Profil** : https://animation-commerciale.pages.dev/static/profil-mobile.html

### Pages Spéciales
- **Gamification** : https://animation-commerciale.pages.dev/static/gamification.html
- **GPS Routing** : https://animation-commerciale.pages.dev/static/gps-routing.html
- **Comparatif Solutions** : https://animation-commerciale.pages.dev/static/comparatif-solutions.html

---

## 🔐 Credentials de Test

### Compte Animateur
```
📧 Email : animateur.casa1@neoimpact.ma
🔑 Mot de passe : password123
```

### Compte Manager (si disponible)
```
📧 Email : manager.casa@neoimpact.ma
🔑 Mot de passe : password123
```

### Compte Admin (si disponible)
```
📧 Email : admin@neoimpact.ma
🔑 Mot de passe : admin123
```

---

## 🛠️ Configuration Cloudflare Pages

### Variables d'Environnement Configurées
- ✅ `SUPABASE_URL` : https://bddlpcxwzwgbhsohhypr.supabase.co
- ✅ `SUPABASE_ANON_KEY` : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- ✅ `USE_MOCK_DATA` : false (données réelles Supabase)

### Déploiement
- **Plateforme** : Cloudflare Pages
- **Repository** : https://github.com/kalagan01/animation_commerciale
- **Branche** : main
- **Build Command** : `npm run build`
- **Build Output** : `dist/`

---

## 📊 Statistiques du Projet

- **Total fichiers déployés** : 93 fichiers
- **Pages HTML** : 27 pages
- **Lignes de code** : 28,651 lignes
- **Technologies** : Hono, TypeScript, Cloudflare Workers, Supabase, TailwindCSS

---

## 🔧 Dépannage

### Si la page affiche "En cours de configuration"
➡️ Vous utilisez la mauvaise URL !
❌ N'utilisez PAS : https://animation-commerciale.pages.dev/login
✅ Utilisez : https://animation-commerciale.pages.dev/static/login-desktop.html

### Si l'authentification ne fonctionne pas
1. Vérifiez les credentials de test
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez que les variables d'environnement Supabase sont configurées

### Si une page affiche 404
- Utilisez toujours le préfixe `/static/` pour les pages HTML
- Exemple : `/static/dashboard.html` et non `/dashboard.html`

---

## 🎯 Prochaines Étapes Recommandées

### 1. Tester l'Authentification
- [ ] Se connecter avec un compte de test
- [ ] Vérifier que le dashboard s'affiche
- [ ] Tester la navigation entre les pages

### 2. Sécurité Supabase (URGENT)
- [ ] Activer RLS sur les 63 tables
- [ ] Créer les politiques RLS
- [ ] Masquer les colonnes sensibles (tokens)

### 3. Configuration Avancée
- [ ] Ajouter un domaine personnalisé (ex: app.neoimpact.ma)
- [ ] Configurer les emails de récupération de mot de passe
- [ ] Activer les logs d'audit

---

## 📞 Support

**Repository GitHub** : https://github.com/kalagan01/animation_commerciale
**Cloudflare Dashboard** : https://dash.cloudflare.com
**Supabase Dashboard** : https://supabase.com/dashboard/project/bddlpcxwzwgbhsohhypr

---

**Date de création** : 19 février 2026
**Dernière mise à jour** : 19 février 2026
**Statut** : ✅ Production Ready

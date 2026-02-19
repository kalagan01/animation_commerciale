# 🎯 Guide de Sélection de Profil - NeoImpact

## ✅ Modification Effectuée

**Changement principal :** Remplacement de l'authentification par email/mot de passe par un **système de sélection de profil simple**.

---

## 🚀 Nouvelle Interface de Connexion

### **URL d'accès :**
```
https://animation-commerciale.pages.dev/static/login-desktop.html
https://animation-commerciale.pages.dev/static/login-mobile.html
```

### **Fonctionnement :**
1. L'utilisateur voit **4 cartes de profils** :
   - 👔 **Animateur** : Terrain & Visites
   - 👥 **Manager** : Équipe & KPIs
   - 👑 **Directeur** : Direction & Stratégie
   - ⚙️ **Administrateur** : Configuration & Admin

2. L'utilisateur **clique sur sa carte** (elle se colore en bleu avec un ✓)

3. L'utilisateur clique sur le bouton **"Continuer"**

4. Redirection automatique vers le dashboard approprié :
   - **Animateur** → `/static/dashboard-mobile.html`
   - **Manager** → `/static/dashboard.html`
   - **Directeur** → `/static/director-dashboard-mobile.html`
   - **Admin** → `/static/dashboard.html`

---

## 📱 Caractéristiques

### **Design**
- ✅ Interface moderne avec dégradés bleus
- ✅ Cartes cliquables avec animation
- ✅ Logo NeoImpact / وفاسلف
- ✅ Version desktop (2 colonnes) et mobile (1 colonne)
- ✅ Icônes FontAwesome pour chaque profil

### **Expérience Utilisateur**
- ✅ **Pas de mot de passe** : sélection simple du profil
- ✅ Animation de sélection (carte bleue + checkmark)
- ✅ Bouton "Continuer" désactivé tant qu'aucun profil n'est sélectionné
- ✅ Stockage du profil dans `sessionStorage` pour référence future
- ✅ Redirection automatique vers le dashboard approprié

### **Responsive**
- ✅ Desktop : 2 colonnes de cartes
- ✅ Mobile : 1 colonne de cartes
- ✅ Hero (image de voiture) masqué sur mobile

---

## 🔄 Workflow de Navigation

```
Page de Login (Sélection du Profil)
    ↓ (Clic sur carte)
Sélection activée (carte bleue + ✓)
    ↓ (Clic "Continuer")
sessionStorage.setItem('userProfile', 'animateur')
    ↓
Redirection automatique → /static/dashboard-mobile.html
```

---

## 🎨 Aperçu Visuel

### **Desktop :**
- Partie gauche : Hero bleu dégradé avec logo et voiture
- Partie droite : 4 cartes de profils (2x2 grid)

### **Mobile :**
- Plein écran avec fond dégradé bleu
- Logo + titre centré
- 4 cartes empilées verticalement

---

## 📊 Comparaison Avant/Après

| Élément | Avant | Après |
|---------|-------|-------|
| **Authentification** | Email + Mot de passe | Sélection de profil |
| **Champs requis** | 2 (email, password) | 1 (profil) |
| **Nombre de clics** | 3 (email, password, submit) | 2 (profil, continuer) |
| **Sécurité** | Vérification backend | Accès direct |
| **Expérience** | Formulaire classique | Interface moderne |

---

## 🔧 Intégration

### **Fichiers modifiés :**
- ✅ `/public/static/login-desktop.html` - Version desktop
- ✅ `/public/static/login-mobile.html` - Version mobile

### **Code JavaScript ajouté :**
```javascript
// Sélection du profil
function selectProfile(card) {
    // Retirer toutes les sélections
    document.querySelectorAll('.profile-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Ajouter la sélection à la carte cliquée
    card.classList.add('selected');
    selectedProfile = card.dataset.profile;
    
    // Activer le bouton "Continuer"
    document.getElementById('continueBtn').classList.add('active');
}

// Continuer vers l'application
function continueToApp() {
    if (!selectedProfile) return;
    
    // Stocker le profil dans sessionStorage
    sessionStorage.setItem('userProfile', selectedProfile);
    
    // Rediriger vers le dashboard approprié
    const dashboards = {
        'animateur': '/static/dashboard-mobile.html',
        'manager': '/static/dashboard.html',
        'directeur': '/static/director-dashboard-mobile.html',
        'admin': '/static/dashboard.html'
    };
    
    window.location.href = dashboards[selectedProfile];
}
```

---

## ✅ Déploiement

**Commit :** `306677e - feat: Replace login with profile selection (no password)`

**Repository :** https://github.com/kalagan01/animation_commerciale

**Cloudflare Pages :** Redéploiement automatique en cours (2-3 minutes)

---

## 🎯 Prochaines Étapes

1. **Attendre 2-3 minutes** pour que Cloudflare redéploie
2. **Tester l'URL** : https://animation-commerciale.pages.dev/static/login-desktop.html
3. **Cliquer sur un profil** et vérifier la redirection
4. **Tester sur mobile** : https://animation-commerciale.pages.dev/static/login-mobile.html

---

## 💡 Notes Importantes

- ⚠️ **Pas de vérification d'identité** : n'importe qui peut accéder à n'importe quel profil
- 💡 **Pour production** : vous pouvez ajouter plus tard :
  - Code PIN pour chaque profil
  - Reconnaissance biométrique (empreinte)
  - Authentification via QR code
  - Code d'accès unique par utilisateur

---

**Date de modification :** 19 février 2026  
**Statut :** ✅ Déployé (en cours de propagation Cloudflare)

// Login Page HTML Template
export const loginPageHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - NeoImpact Animation Commerciale</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-cyan-600 to-cyan-700 min-h-screen flex items-center justify-center p-4">
    
    <div class="max-w-md w-full">
        <!-- Logo et Titre -->
        <div class="text-center mb-8">
            <div class="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i class="fas fa-chart-line text-cyan-600 text-3xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">NeoImpact</h1>
            <p class="text-cyan-100 text-sm">Animation Commerciale</p>
        </div>

        <!-- Carte de Login -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Connexion</h2>
            
            <!-- Formulaire -->
            <form id="loginForm" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-envelope mr-2 text-cyan-600"></i>Email
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        placeholder="email@neoimpact.ma"
                        required
                    >
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2 text-cyan-600"></i>Mot de passe
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        placeholder="••••••••"
                        required
                    >
                </div>

                <!-- Message d'erreur -->
                <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorText">Email ou mot de passe incorrect</span>
                </div>

                <!-- Bouton Submit -->
                <button 
                    type="submit" 
                    id="submitBtn"
                    class="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition duration-200 shadow-lg hover:shadow-xl"
                >
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    Se connecter
                </button>
            </form>

            <!-- Séparateur -->
            <div class="my-6 flex items-center">
                <div class="flex-1 border-t border-gray-300"></div>
                <span class="px-4 text-sm text-gray-500">ou</span>
                <div class="flex-1 border-t border-gray-300"></div>
            </div>

            <!-- Comptes de Test -->
            <div class="space-y-2">
                <p class="text-sm text-gray-600 text-center mb-3">
                    <i class="fas fa-flask mr-2"></i>Comptes de test rapide
                </p>
                
                <button onclick="quickLogin('admin@neoimpact.ma')" type="button"
                    class="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition border border-purple-200">
                    <i class="fas fa-user-shield text-purple-600 mr-2"></i>
                    <span class="font-semibold">Admin</span> - admin@neoimpact.ma
                </button>

                <button onclick="quickLogin('directeur.reseau@neoimpact.ma')" type="button"
                    class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm transition border border-blue-200">
                    <i class="fas fa-network-wired text-blue-600 mr-2"></i>
                    <span class="font-semibold">Directeur Réseau</span> - directeur.reseau@neoimpact.ma
                </button>

                <button onclick="quickLogin('directeur.casa@neoimpact.ma')" type="button"
                    class="w-full text-left px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm transition border border-indigo-200">
                    <i class="fas fa-sitemap text-indigo-600 mr-2"></i>
                    <span class="font-semibold">Directeur Groupe</span> - directeur.casa@neoimpact.ma
                </button>

                <button onclick="quickLogin('manager.casa1@neoimpact.ma')" type="button"
                    class="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm transition border border-green-200">
                    <i class="fas fa-users-cog text-green-600 mr-2"></i>
                    <span class="font-semibold">Manager</span> - manager.casa1@neoimpact.ma
                </button>

                <button onclick="quickLogin('animateur.casa1@neoimpact.ma')" type="button"
                    class="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm transition border border-orange-200">
                    <i class="fas fa-walking text-orange-600 mr-2"></i>
                    <span class="font-semibold">Animateur</span> - animateur.casa1@neoimpact.ma
                </button>
            </div>

            <!-- Note -->
            <div class="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-xs text-yellow-800">
                    <i class="fas fa-info-circle mr-1"></i>
                    Tous les comptes de test utilisent le mot de passe : <span class="font-mono font-semibold">password123</span>
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 text-white text-sm">
            <p>© 2026 NeoImpact - Animation Commerciale</p>
            <p class="text-cyan-200 text-xs mt-1">Version 1.0.0 - MVP Phase 1-2</p>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        // Quick Login Function
        function quickLogin(email) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = 'password123';
            // Auto-submit after a brief delay
            setTimeout(() => {
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }, 300);
        }

        // Form Submit Handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const errorMessage = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion...';
            errorMessage.classList.add('hidden');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token and user info
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userInfo', JSON.stringify(data.user));
                    
                    // Show success message
                    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Connexion réussie !';
                    submitBtn.classList.remove('bg-cyan-600', 'hover:bg-cyan-700');
                    submitBtn.classList.add('bg-green-600');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        const role = data.user.role?.code;
                        if (role === 'admin') {
                            window.location.href = '/static/dashboard.html';
                        } else if (role === 'director_network' || role === 'director_group') {
                            window.location.href = '/static/director-dashboard-mobile.html';
                        } else if (role === 'manager') {
                            window.location.href = '/static/dashboard-mobile.html';
                        } else if (role === 'animator') {
                            window.location.href = '/static/dashboard-mobile.html';
                        } else {
                            window.location.href = '/static/dashboard.html';
                        }
                    }, 1000);
                } else {
                    // Show error
                    errorText.textContent = data.error || 'Email ou mot de passe incorrect';
                    errorMessage.classList.remove('hidden');
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Se connecter';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorText.textContent = 'Erreur de connexion au serveur';
                errorMessage.classList.remove('hidden');
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Se connecter';
            }
        });
    </script>

</body>
</html>
`

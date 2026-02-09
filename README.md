# Animation Commerciale — Sprint 1

Ce dépôt matérialise le Sprint 1 : une file de travail (Work Queue) avec un backend Java Spring Boot et un frontend React.

## Prérequis (Windows)

- Java 17 (JDK) installé et configuré dans `JAVA_HOME`.
- Maven installé et accessible dans `PATH`.
- Node.js 18+ et npm installés.
- Git pour cloner le dépôt.

## Lancement du backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Le backend démarre sur `http://localhost:8080`.

## Lancement du frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`.

## Scénario de test Sprint 1 (manuel)

1. Ouvrir le frontend `http://localhost:5173`.
2. En tant que **Supervisor**, saisir un titre et un nom puis cliquer sur **Créer**.
3. Vérifier dans la **Work Queue** que le statut est `NEW`.
4. En tant qu’**Agent**, saisir un nom puis cliquer sur **Prendre la prochaine tâche**.
5. Vérifier que la tâche passe à `ASSIGNED` et qu’elle est assignée à l’agent.
6. Cliquer sur **Compléter** pour finaliser la tâche.
7. Vérifier l’historique dans la section **Audit**.

## Endpoints backend clés

- `POST /api/work-items` → créer une tâche.
- `POST /api/work-items/{id}/assign` → assigner une tâche.
- `POST /api/work-items/{id}/complete` → compléter une tâche.
- `POST /api/agent/next` → assigner la prochaine tâche disponible.
- `GET /api/work-items` → lister la file de travail.
- `GET /api/audit` → consulter l’audit.

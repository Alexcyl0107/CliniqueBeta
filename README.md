# Portail Web Clinique Espoir Lomé

Bienvenue dans le code source du site web de la Clinique Espoir Lomé. Ce projet est une application complète "Full Stack" prête à être déployée.

## 🏗 Architecture

Le projet est divisé en deux parties principales :

1.  **Frontend (React)** : L'interface utilisateur que voient les patients et les administrateurs.
2.  **Backend (Node.js/Express)** : Le serveur (API) qui gère les données et communique avec la base de données.
3.  **Base de Données (MongoDB)** : Stocke les utilisateurs et les rendez-vous.

---

## 🔐 Fonctionnement de l'Admin

Le site possède deux systèmes d'authentification distincts :

1.  **Espace Patient** :
    *   Géré par le Backend (`server.js`) et la base de données MongoDB.
    *   Les patients s'inscrivent (`/register`) et se connectent (`/login`) avec email et mot de passe.
    *   Leurs données sont stockées de manière sécurisée.

2.  **Espace Administrateur (Médecins/Secrétariat)** :
    *   L'accès se fait via le lien "Accès Personnel" dans le pied de page (footer) du site.
    *   **Sécurité** : Pour simplifier la gestion sans avoir à créer manuellement des comptes admin complexes dans la base de données, l'accès à l'interface Admin est protégé par un **mot de passe unique partagé**.
    *   **Mot de passe par défaut** : `espoir2024`
    *   *Note technique* : La vérification se fait dans `services/dbService.ts` via la fonction `checkAdminAuth`.

---

## 🚀 Guide de Déploiement (Production)

Suivez ces étapes dans l'ordre pour mettre votre site en ligne.

### Étape 1 : Base de Données (MongoDB Atlas)

1.  Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Créez un nouveau cluster (l'option gratuite "M0 Sandbox" suffit).
3.  Dans l'onglet **Security > Database Access**, créez un utilisateur de base de données (ex: `admin_clinique`) et notez le mot de passe.
4.  Dans l'onglet **Security > Network Access**, ajoutez une adresse IP et sélectionnez "Allow Access from Anywhere" (`0.0.0.0/0`). C'est nécessaire pour que Render puisse s'y connecter.
5.  Cliquez sur **Connect > Drivers** et copiez votre "Connection String". Elle ressemble à :
    `mongodb+srv://admin_clinique:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
    *(Remplacez `<password>` par votre vrai mot de passe)*.

### Étape 2 : Backend (Render)

C'est le cerveau de votre application.

1.  Poussez votre code sur GitHub. Assurez-vous que le fichier `server.js` et `package.json` sont à la racine (ou dans un dossier backend).
2.  Créez un compte sur [Render](https://render.com).
3.  Cliquez sur **New +** et sélectionnez **Web Service**.
4.  Connectez votre dépôt GitHub.
5.  Configurez le service :
    *   **Name** : `clinique-backend` (par exemple)
    *   **Runtime** : `Node`
    *   **Build Command** : `npm install`
    *   **Start Command** : `node server.js`
6.  Déroulez la section **Environment Variables** et ajoutez :
    *   Key: `MONGO_URI`
    *   Value: *(Collez votre Connection String MongoDB de l'étape 1)*
7.  Cliquez sur **Create Web Service**.
8.  Attendez que le déploiement finisse. Render vous donnera une URL (ex: `https://clinique-backend.onrender.com`). **Copiez cette URL.**

### Étape 3 : Frontend (Vercel)

C'est le visage de votre application.

1.  Créez un compte sur [Vercel](https://vercel.com).
2.  Cliquez sur **Add New...** > **Project**.
3.  Importez votre dépôt GitHub.
4.  Vercel va détecter automatiquement que c'est une application React (Vite ou Create React App).
5.  Dans la section **Environment Variables**, ajoutez :
    *   Key: `VITE_API_URL`
    *   Value: *(Collez l'URL de votre Backend Render de l'étape 2, SANS le slash `/` à la fin)*.
    *   *Exemple : `https://clinique-backend.onrender.com`*
6.  Cliquez sur **Deploy**.

🎉 **Félicitations ! Votre site est en ligne.**

---

## 💻 Développement Local

Si vous voulez tester sur votre ordinateur :

1.  **Backend** :
    ```bash
    # Dans un terminal
    npm install
    # Créez un fichier .env avec : MONGO_URI=votre_lien_mongo
    node server.js
    ```

2.  **Frontend** :
    ```bash
    # Dans un autre terminal
    npm install
    npm run dev
    ```

Le frontend utilisera automatiquement le Backend local si aucune variable d'environnement n'est définie, ou passera en "Mode Démo" (LocalStorage) si le backend ne répond pas.
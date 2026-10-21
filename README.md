# Kommando

Programme intensif d’allemand en cinq jours. Fiches, script oral, drill et synthèse vocale. Sur iPhone, l’app occupe l’écran et respecte les safe areas. Sur un ordinateur, elle occupe la fenêtre, avec une barre latérale.

L’orthographe est suisse (`heisse`, `Grüssen`). La forme travaillée est `Sie`.

Dépôt : [github.com/EssekerDev/kommando](https://github.com/EssekerDev/kommando).

## Mac, une commande

Docker Desktop doit être ouvert. Depuis le dossier du projet :

```bash
git pull && docker compose up -d --build --force-recreate
```

Le journal doit contenir `source 20261021-verre`, puis `Container kommando-web Recreated`. Si tu lis seulement `Running` en 0,0 s, l’image n’a pas été reconstruite.

Puis ouvre [http://192.168.0.103:3847](http://192.168.0.103:3847), ou [https://kommando.esseker.fr](https://kommando.esseker.fr) une fois Caddy en place. Recharge la page sans le cache du navigateur.

Depuis zéro, la même chose en une ligne :

```bash
git clone https://github.com/EssekerDev/kommando.git && cd kommando && docker compose up -d --build
```

Cette commande ne crée que le conteneur `kommando-web`, sur le réseau `kommando_internal`, publié en `192.168.0.103:3847` pour que Caddy puisse le joindre. Elle n’arrête pas les autres conteneurs.

Arrêt de Kommando seul : `docker compose stop`.

Si le port 3847 est déjà pris par autre chose que Kommando, rien n’est lancé. Change alors le port hôte dans `docker-compose.yml` (`192.168.0.103:3848:3847`) et le même port dans le bloc Caddy, puis relance. Le script `./scripts/docker-up.sh` fait la même chose et affiche les conteneurs déjà ouverts avant de démarrer. Pour republier Kommando : `git pull && docker compose up -d --build --force-recreate`. Le script `./scripts/docker-up.sh` fait la même reconstruction et laisse les autres conteneurs en place.

## Lancer sans Docker

```bash
npm install
npm run dev
```

L’application écoute sur [http://localhost:3847](http://localhost:3847).

La voix utilise la synthèse du navigateur (`de-CH`, sinon `de-DE`). Aucune clé n’est requise. La progression, le prénom et le thème restent dans le navigateur.

## Structure

- `components/App.tsx` — coque mobile, safe areas, dock en verre
- `components/Dashboard.tsx` — les cinq jours et la progression
- `components/DayView.tsx` — fiches, script, lexique, lecteur
- `components/ExerciseView.tsx` — drill avec correction immédiate
- `lib/curriculum.ts` — le contenu des cinq jours

## Logo

Le signe s’appelle Intervalle : une hampe et un chevron à 30°, séparés par une pause.

![Intervalle, logo de Kommando](brand/overview.png)

Maîtres dans `brand/kit/`, icônes dans `brand/digital/`, règles d’usage dans `brand/GUIDE.md`. Pour régénérer les maîtres : `python3 brand/build_kit.py`.

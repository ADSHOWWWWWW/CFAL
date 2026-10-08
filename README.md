# Site CFA Liège

Site de la Commission de Formation des Arbitres (province de Liège), avec back office **Pages CMS**.

## Comment c'est organisé

| Dossier / fichier | Rôle |
|---|---|
| `src/_data/*.json` | **Les contenus** (textes, équipe, PV…). C'est ce que le back office modifie. |
| `src/images/` | Les photos (équipe…). |
| `src/documents/` | Les PDF envoyés via le back office. |
| `src/_includes/` | La mise en page : styles (`style.css`), animations (`script.js`), logo et dessin du terrain. |
| `build.js` | Assemble les contenus + la mise en page dans `_site/index.html`. Aucun module à installer. |
| `.pages.yml` | Les formulaires du back office (quelles rubriques, quels champs). |
| `vercel.json` | Réglages de publication sur Vercel (commande `node build.js`, dossier `_site`). |

## Fonctionnement

1. Quelqu'un modifie un texte sur https://app.pagescms.org et clique sur **Enregistrer**.
2. Pages CMS enregistre le changement dans ce dépôt GitHub.
3. Vercel reconstruit et republie le site (1 à 2 minutes).

## Tester sur son ordinateur (facultatif)

Avec Node.js installé : `node build.js`, puis ouvrir `_site/index.html`.

## Nom de domaine personnalisé

Dans Vercel : projet → Settings → Domains → Add, puis suivre les indications
(enregistrement DNS à créer chez le fournisseur du domaine).

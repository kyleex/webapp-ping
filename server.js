// =============================
// ====== Importations ========
// =============================

const express = require("express");
const { Pool } = require("pg"); // Ajouter cette ligne pour utiliser pg
const { body, validationResult } = require("express-validator");

// =============================
// ===== Configuration ========
// =============================

require("dotenv").config(); // Ajouter cette ligne pour les variables d'environnement

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

// Configuration de la connexion à la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Utiliser la variable d'environnement pour la chaîne de connexion
});

// Tester la connexion à la base de données
pool.connect((err) => {
  if (err) {
    console.error("Connection error", err.stack);
  } else {
    console.log("Connected to database");
  }
});

// =============================
// ====== Routes API ==========
// =============================

// Routes pour les "tournois"

// Point de terminaison pour créer un nouveau tournoi
app.post(
  "/tournaments",
  [
    body("name").notEmpty().withMessage("Le nom du tournoi est requis"),
    body("category").notEmpty().withMessage("La catégorie est requise"),
    body("start_date").isISO8601().withMessage("La date de début est invalide"),
    body("end_date").isISO8601().withMessage("La date de fin est invalide"),
    body("number_of_tables")
      .isInt({ min: 1 })
      .withMessage("Le nombre de tables doit être un entier positif"),
    body("max_players")
      .isInt({ min: 1 })
      .withMessage("Le nombre de joueurs max doit être un entier positif"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        category,
        start_date,
        end_date,
        number_of_tables,
        max_players,
      } = req.body;
      const newTournamentQuery = `
      INSERT INTO tournaments (name, category, start_date, end_date, number_of_tables, max_players)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;`; // Assurez-vous que ces noms de colonnes correspondent à votre schéma de base de données
      const values = [
        name,
        category,
        start_date,
        end_date,
        number_of_tables,
        max_players,
      ];

      const result = await pool.query(newTournamentQuery, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Point de terminaison pour récupérer tous les tournois
app.get("/tournaments", async (req, res) => {
  try {
    const allTournamentsQuery = "SELECT * FROM tournaments;"; // Assurez-vous que cela correspond à votre schéma de base de données
    const allTournaments = await pool.query(allTournamentsQuery);
    res.json(allTournaments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Route pour obtenir les détails d'un tournoi spécifique
app.get("/tournaments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tournamentQuery = "SELECT * FROM tournaments WHERE id = $1;";
    const tournament = await pool.query(tournamentQuery, [id]);

    if (tournament.rows.length === 0) {
      return res.status(404).json({ message: "Tournoi non trouvé" });
    }

    res.json(tournament.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// route pour mettre à jour un tournoi
app.put("/tournaments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      start_date,
      end_date,
      number_of_tables,
      max_players,
    } = req.body;

    const updateQuery = `
      UPDATE tournaments
      SET name = $1, category = $2, start_date = $3, end_date = $4, number_of_tables = $5, max_players = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      name,
      category,
      start_date,
      end_date,
      number_of_tables,
      max_players,
      id,
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tournoi non trouvé" });
    }

    res.json(result.rows[0]);
    res.json({ message: "Tournoi mis à jour avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Route pour supprimer un tournoi
app.delete("/tournaments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = "DELETE FROM tournaments WHERE id = $1 RETURNING *;";

    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tournoi non trouvé" });
    }

    res.json({ message: "Tournoi supprimé avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// =============================
// ====== Démarrage Serveur ====
// =============================

// Démarrage du serveur sur le port 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

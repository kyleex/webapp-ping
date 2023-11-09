const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Pour analyser les corps de requêtes en JSON
app.use(express.static(path.join(__dirname, "public"))); // Servir les fichiers statiques depuis 'public'

// Route pour afficher la page d'administration des formulaires
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Route pour afficher le formulaire
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

// Route pour traiter la soumission du formulaire
app.post("/submit-form", (req, res) => {
  const formData = req.body;

  fs.readFile("form-data.json", (err, data) => {
    let json = [];
    if (err) {
      // Si le fichier n'existe pas ou une autre erreur, on part d'un tableau vide
      console.log(err);
    } else {
      // Sinon, on parse les données existantes
      json = JSON.parse(data.toString());
    }
    json.push(formData);
    fs.writeFile("form-data.json", JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send("An error occurred while saving form data.");
      }
      res.send("Form submitted successfully!");
    });
  });
});

// Route pour obtenir les données des formulaires
app.get("/get-form-data", (req, res) => {
  fs.readFile("form-data.json", (err, formData) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Si le fichier n'existe pas, renvoie un tableau vide
        res.json([]);
      } else {
        // Si une autre erreur se produit, renvoie un code d'erreur 500
        console.error(err);
        res.status(500).send("An error occurred while reading form data.");
      }
    } else {
      res.json(JSON.parse(formData.toString()));
    }
  });
});

// Démarrage du serveur sur le port 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

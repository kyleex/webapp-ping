const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Route pour afficher la page d'administration des formulaires
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/admin.html");
});

// aficher
app.get("/form", (req, res) => {
  res.sendFile(__dirname + "/form.html");
});

// Route pour traiter la soumission du formulaire
app.post("/submit-form", (req, res) => {
  const formData = req.body;

  fs.readFile("form-data.json", (err, data) => {
    if (err) {
      data = "[]";
    }
    const json = JSON.parse(formData);
    json.push(formData);
    fs.writeFile("form-data.json", JSON.stringify(json, null, 2), (err) => {
      if (err) throw err;
      res.send("Form submitted successfully!");
    });
  });
});

// Route pour obtenir les données des formulaires
app.get("/get-form-data", (req, res) => {
  fs.readFile("form-data.json", (err, formData) => {
    if (err) {
      res.json([]);
    } else {
      res.json(JSON.parse(formData));
    }
  });
});

// // Routes pour valider et rejeter les formulaires
// app.post("/validate-form/:index", (req, res) => {
//   const index = req.params.index;
//   updateFormStatus(index, "validated", res);
// });

// app.post("/reject-form/:index", (req, res) => {
//   const index = req.params.index;
//   updateFormStatus(index, "rejected", res);
// });

// // Fonction pour mettre à jour le statut d'un formulaire
// function updateFormStatus(index, status, res) {
//   fs.readFile("form-data.json", (err, data) => {
//     if (err) throw err;
//     const json = JSON.parse(data);
//     if (json[index]) {
//       json[index].status = status;
//       fs.writeFile("form-data.json", JSON.stringify(json, null, 2), (err) => {
//         if (err) throw err;
//         res.send(`Form ${status} successfully!`);
//       });
//     } else {
//       res.status(404).send("Form not found.");
//     }
//   });
// }

// Démarrage du serveur sur le port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

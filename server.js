// import de la librairie express
const express = require("express");

// ----- Connexion MongoDB -----
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;
//  ----------------------------
// app = mon serveur
const app = express();

// autorisé le front à parler avec le serveur
const cors = require("cors");
app.use(cors());

// permet de lire le JSON envoyé par le front
app.use(express.json());

// ----- ROUTES DAYS -----
// route GET
app.get("/days", async (req, res) => {
  const days = await db.collection("days").find().toArray();
  res.json(days);
});

// route POST
app.post("/days", async (req, res) => {
  console.log("BODY:", req.body);

  // recupere les données envoyés par le front
  const newDay = req.body;

  // ajoute dans le stockage
  await db.collection("days").insertOne(newDay);

  res.json({ message: "Day ajouté" });
});

// route PUT
app.put("/days/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedDay = req.body;

    // 🔥 on enlève _id ET id
    const { _id, id: _, ...dataWithoutIds } = updatedDay;

    await db.collection("days").updateOne({ id: id }, { $set: dataWithoutIds });

    res.json({ message: "Day mis à jour" });
  } catch (error) {
    console.error("Erreur PUT:", error);
    res.status(500).json({ error: "Erreur serveur PUT" });
  }
});

// route DELETE
app.delete("/days/:id", async (req, res) => {
  // recupere l'id dans l'url
  const id = Number(req.params.id);

  await db.collection("days").deleteOne({ id: id });

  res.json({ message: "Day supprimé" });
});
//  ----------------------

async function startServer() {
  try {
    await client.connect();
    db = client.db("BusDutyTrackerServer");

    console.log("Connecté à MongoDB");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de démarrage :", error);
  }
}

startServer();

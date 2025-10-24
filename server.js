import express from "express"
import { Temporal } from "temporal-polyfill";

const app = express();
const PORT = 3000;

app.use(express.static("public"))
// Middleware para parsear JSON
app.use(express.json());

// "Base de datos" simulada en memoria
let eventos = [
  { id: 1,
    titulo: "Conoce la selva",
    description: "Aprende sobre las aves de la selva",
    category: "animals",
    imgUrl: "https://plus.unsplash.com/premium_photo-1760735463958-f35bcad4fb87?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    dateTime: Temporal.Instant.from("2025-10-29T13:00:00.000Z") }
];

let siguienteId = 3;

// ============= RUTAS CRUD =============

// READ - Obtener todas las eventos
app.get("/api/eventos", (req, res) => {
  res.json(eventos);
});

// READ - Obtener una evento por ID
app.get("/api/eventos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const evento = eventos.find((t) => t.id === id);

  if (!evento) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  res.json(evento);
});

// CREATE - Crear una nueva evento
app.post("/api/eventos", (req, res) => {
  const { titulo, description, category, imgUrl, dateTime } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: "El título es obligatorio" });
  }

  const nuevaEvento = {
    id: siguienteId++,
    titulo,
    description,
    category,
    imgUrl,
    dateTime: Temporal.Instant.from(dateTime)
  };

  eventos.push(nuevaEvento);
  res.status(201).json(nuevaEvento);
});

// UPDATE - Actualizar una evento existente
app.put("/api/eventos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, description, category, imgUrl, dateTime } = req.body;

  const indice = eventos.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  // Actualizar solo los campos proporcionados
  if (titulo !== undefined) eventos[indice].titulo = titulo;
  if (description !== undefined) eventos[indice].description = description;
  if (category !== undefined) eventos[indice].category = category;
  if (imgUrl !== undefined) eventos[indice].imgUrl = imgUrl;
  if (dateTime !== undefined) eventos[indice].dateTime = dateTime;

  res.json(eventos[indice]);
});

// DELETE - Eliminar una evento
app.delete("/api/eventos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const indice = eventos.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  const eventoEliminada = eventos.splice(indice, 1)[0];
  res.json({ mensaje: "Evento eliminado", evento: eventoEliminada });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("\nPrueba estas rutas:");
  console.log("GET    /api/eventos      - Ver todos las eventos");
  console.log("GET    /api/eventos/:id  - Ver un evento");
  console.log("POST   /api/eventos      - Crear evento");
  console.log("PUT    /api/eventos/:id  - Actualizar evento");
  console.log("DELETE /api/eventos/:id  - Eliminar evento");
});

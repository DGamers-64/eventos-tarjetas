import express from "express"
import { Temporal } from "temporal-polyfill";

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(express.json());

/*
	CATEGORIAS:
		- festividad
		- deportes
		- historia
		- musica
*/

// "Base de datos" simulada en memoria
let eventos = [
	{
		id: 1,
		titulo: "Halloween",
		description: "¡Halloween se acerca! Prepara tu mejor disfraz",
		category: "festividad",
		imgUrl: "https://s.calendarr.com/upload/92/a0/halloween-f.png?class=ogImageRectangle",
		dateTime: Temporal.Instant.from("2025-10-31T00:00:00+01:00")
	},
	{
		id: 2,
		titulo: "Mundial 2026",
		description: "Se acerca el Mundial de fútbol 2026 en EEUU, Canadá y México",
		category: "deportes",
		imgUrl: "https://editorial.uefa.com/resources/0299-1ddbad09d3de-a06a5b3fb191-1000/fbl-wc2026-eur-draw.jpeg",
		dateTime: Temporal.Instant.from("2026-06-11T00:00:00+02:00")
	},
	{
		id: 3,
		titulo: "Bombardeo Hiroshima",
		description: "El fatídico bombardeo nuclear de Hiroshima",
		category: "historia",
		imgUrl: "https://www.annefrank.org/media/filer_public_thumbnails/filer_public/10/f0/10f00621-71fe-422d-8602-0cdf26f09b25/nagasakibomb.jpg__1536x1536_q85_subsampling-2.jpg",
		dateTime: Temporal.Instant.from("1945-08-06T08:15:00+09:00")
	},
	{
		id: 4,
		titulo: "Son do Camiño 2026",
		description: "Uno de los mayores festivales de música en Galicia",
		category: "musica",
		imgUrl: "https://modofestival.es/wp-content/uploads/2025/10/O-Son-Do-Camino-1.jpg",
		dateTime: Temporal.Instant.from("2026-06-18T00:00:00+02:00")
	}
];

let siguienteId = eventos.length + 1;

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

	const fechaLocal = Temporal.PlainDateTime.from(dateTime);
	const instante = fechaLocal.toZonedDateTime("Europe/Madrid").toInstant();

	const nuevaEvento = {
		id: siguienteId++,
		titulo,
		description,
		category,
		imgUrl,
		dateTime: instante
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

	if (dateTime !== undefined) {
		const fechaLocal = Temporal.PlainDateTime.from(dateTime);
		const instante = fechaLocal.toZonedDateTime("Europe/Madrid").toInstant();
	
		eventos[indice].dateTime = instante;
	}

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

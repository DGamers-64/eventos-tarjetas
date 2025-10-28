import express from "express"
import { Temporal } from "temporal-polyfill";
import sqlite from "sqlite3";

const db = new sqlite.Database("./data/data.db", sqlite.OPEN_READWRITE, (err) => { if (err) return console.error(err) })
const app = express();
const PORT = 3000;

db.run(`CREATE TABLE IF NOT EXISTS tarjetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(100),
    description VARCHAR(100),
	category VARCHAR(100),
    imgUrl VARCHAR(100),
    dateTime DATETIME
)`, (err) => {
	if (err) return console.error(err)
	db.run(`INSERT OR IGNORE INTO tarjetas (id, titulo, description, category, imgUrl, dateTime) VALUES
		(1, 'Halloween', '¡Halloween se acerca! Prepara tu mejor disfraz', 'festividad', 'https://s.calendarr.com/upload/92/a0/halloween-f.png?class=ogImageRectangle', '2025-10-31T00:00:00+01:00'),
		(2, 'Mundial 2026', 'Se acerca el Mundial de fútbol 2026 en EEUU, Canadá y México', 'deportes', 'https://editorial.uefa.com/resources/0299-1ddbad09d3de-a06a5b3fb191-1000/fbl-wc2026-eur-draw.jpeg', '2026-06-11T00:00:00+02:00'),
		(3, 'Bombardeo Hiroshima', 'El fatídico bombardeo nuclear de Hiroshima', 'historia', 'https://www.annefrank.org/media/filer_public_thumbnails/filer_public/10/f0/10f00621-71fe-422d-8602-0cdf26f09b25/nagasakibomb.jpg__1536x1536_q85_subsampling-2.jpg', '1945-08-06T08:15:00+09:00'),
		(4, 'Son do Camiño 2026', 'Uno de los mayores festivales de música en Galicia', 'musica', 'https://modofestival.es/wp-content/uploads/2025/10/O-Son-Do-Camino-1.jpg', '2026-06-18T00:00:00+02:00')
	`, (err) => { if (err) return console.error(err) })
})

// Middleware para parsear JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(express.json());

// ============= RUTAS CRUD =============

// READ - Obtener todas las eventos
app.get("/api/eventos", (req, res) => {
	db.all("SELECT * FROM tarjetas", (err, rows) => {
		if (err) return console.error(err)
		res.json(rows);
	})
});

// READ - Obtener una evento por ID
app.get("/api/eventos/:id", (req, res) => {
	const id = parseInt(req.params.id);

	db.get("SELECT * FROM tarjetas WHERE id = ?", [id], (err, row) => {
		if (err) return console.error(err)

		if (!row) {
			return res.status(404).json({ error: "Evento no encontrado" });
		}

		res.json(row);
	})
});

// CREATE - Crear una nueva evento
app.post("/api/eventos", (req, res) => {
	const { titulo, description, category, imgUrl, dateTime } = req.body;

	if (!titulo) {
		return res.status(400).json({ error: "El título es obligatorio" });
	}

	const fechaLocal = Temporal.PlainDateTime.from(dateTime);
	const instante = fechaLocal.toZonedDateTime("Europe/Madrid").toInstant().toString();

	const nuevaEvento = [
		titulo,
		description,
		category,
		imgUrl,
		instante
	];

	db.run(`INSERT INTO tarjetas (titulo, description, category, imgUrl, dateTime) VALUES (?, ?, ?, ?, ?)`,
		[...nuevaEvento],
		function (err) {
			if (err) return console.error(err)
			const id = this.lastID
			db.get("SELECT * FROM tarjetas WHERE id = ?", [id], (err, row) => {
				if (err) return res.status(500).json({ error: err.message })
				res.status(201).json(row)
			})
		}
	)
});

// UPDATE - Actualizar una evento existente
app.put("/api/eventos/:id", (req, res) => {
	const id = parseInt(req.params.id);
	const { titulo, description, category, imgUrl, dateTime } = req.body;

	db.get("SELECT * FROM tarjetas WHERE id = ?", [id], (err, row) => {
		if (!row) return res.status(404).json({ error: "Evento no encontrado" })

		let campos = [];
		let valores = [];

		if (titulo !== undefined) { campos.push("titulo = ?"); valores.push(titulo); }
		if (description !== undefined) { campos.push("description = ?"); valores.push(description); }
		if (category !== undefined) { campos.push("category = ?"); valores.push(category); }
		if (imgUrl !== undefined) { campos.push("imgUrl = ?"); valores.push(imgUrl); }

		if (dateTime !== undefined) {
			const fechaLocal = Temporal.PlainDateTime.from(dateTime);
			const instante = fechaLocal.toZonedDateTime("Europe/Madrid").toInstant().toString();
			campos.push("dateTime = ?");
			valores.push(instante);
		}

		if (campos.length === 0) return res.json(row)

		valores.push(id)

		db.run(`UPDATE tarjetas SET ${campos.join(", ")} WHERE id = ?`, valores, (err) => {
			if (err) return res.status(500).json({ error: err.message })

			db.get("SELECT * FROM tarjetas WHERE id = ?", [id], (err, updated) => {
				if (err) return res.status(500).json({ error: err.message })
				res.json(updated)
			})
		})
	})
});

// DELETE - Eliminar una evento
app.delete("/api/eventos/:id", (req, res) => {
	const id = parseInt(req.params.id);

	db.run("DELETE FROM tarjetas WHERE id = ?", [id], (err) => {
		if (err) return res.status(404).json({ error: "Evento no encontrado" })

		db.get("SELECT * FROM tarjetas WHERE id = ?", [id], (err, row) => {
			if (err) return res.status(404).json({ error: "Evento no encontrado" })
			res.json({ mensaje: "Evento eliminado", evento: row });
		})
	})
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

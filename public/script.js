const intervalosEventos = {}

document.addEventListener("DOMContentLoaded", () => {
    const cardsContainer = document.querySelector(".cards-container")

    fetch("http://localhost:3000/api/eventos")
        .then(res => res.json())
        .then(data => {
            data.forEach((e) => {
                cardsContainer.innerHTML += devolverTarjeta(e)
                intervalosEventos[e.id] = setInterval(() => {
                    const card = document.getElementById(`card-${e.id}`)
                    const fecha = Temporal.Instant.from(e.dateTime)
                    const ahora = Temporal.Now.instant()
                    const tiempoRestante = fecha.since(ahora).round({ smallestUnit: "second", largestUnit: "day" })

                    card.querySelector(".countdown-days").textContent = tiempoRestante.days
                    card.querySelector(".countdown-hours").textContent = tiempoRestante.hours
                    card.querySelector(".countdown-minutes").textContent = tiempoRestante.minutes
                    card.querySelector(".countdown-seconds").textContent = tiempoRestante.seconds
                }, 500)
            })
        })
})

function devolverTarjeta(data) {
    const categoriasFormateadas = {
        "animals": "Animales",
        "fiestas": "Fiestas"
    }

    const fecha = Temporal.Instant.from(data.dateTime)
    const ahora = Temporal.Now.instant()
    const tiempoRestante = fecha.since(ahora).round({ smallestUnit: "second", largestUnit: "day" })

    return `
        <div class="card" id="card-${data.id}">
            <img src="${data.imgUrl}" class="card-img"/>
            <div class="card-content-container">
                <span class="category ${data.category}">${categoriasFormateadas[data.category]}</span>
                <h2 class="card-title">${data.titulo}</h2>
                <p class="card-subtitle">${data.description}</p>
                <div class="event-date">
                    <img src="img/calendar-icon.svg" />
                    <span>${formatearFecha(fecha)}</span>
                </div>
                <div class="countdown-area">
                    <div class="countdown-item">
                        <span class="texto-${data.category} countdown-days countdown-value">${tiempoRestante.days}</span>
                        <span class="countdown-label">Días</span>
                    </div>

                    <div class="countdown-item">
                        <span class="texto-${data.category} countdown-hours countdown-value">${tiempoRestante.hours}</span>
                        <span class="countdown-label">Horas</span>
                    </div>

                    <div class="countdown-item">
                        <span class="texto-${data.category} countdown-minutes countdown-value">${tiempoRestante.minutes}</span>
                        <span class="countdown-label">Minutos</span>
                    </div>

                    <div class="countdown-item">
                        <span class="texto-${data.category} countdown-seconds countdown-value">${tiempoRestante.seconds}</span>
                        <span class="countdown-label">Segundos</span>
                    </div>
                </div>
            </div>
        </div>
    `
}

function formatearFecha(fechaArg) {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    const fecha = fechaArg.toZonedDateTimeISO("Europe/Madrid")

    return `${dias[fecha.dayOfWeek - 1]}, ${fecha.day}/${fecha.month}/${fecha.year} - ${fecha.hour.toString().padStart(2, "0")}:${fecha.minute.toString().padStart(2, "0")}`
}
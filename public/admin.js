document.addEventListener("DOMContentLoaded", async () => {
    const anadirForm = document.querySelector("#anadir-evento form")
    const editarForm = document.querySelector("#editar-evento form")

    anadirForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const formData = new FormData(anadirForm)
        const data = Object.fromEntries(formData.entries())

        await fetch("/api/eventos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => {
                document.querySelector("#texto-resultado").innerHTML = "<h3>Insertado correctamente</h3>"
            })
            .catch(e => {
                document.querySelector("#texto-resultado").innerHTML = "<h3>Error</h3>"
                console.error(e)
            })
    })

    editarForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const formData = new FormData(editarForm)
        const data = Object.fromEntries(formData.entries())

        await fetch(`/api/eventos/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => {
                document.querySelector("#texto-resultado").innerHTML = "<h3>Editado correctamente</h3>"
            })
            .catch(e => {
                document.querySelector("#texto-resultado").innerHTML = "<h3>Error</h3>"
                console.error(e)
            })
    })

    await fetch("/api/eventos")
        .then(res => res.json())
        .then(data => {
            const tabla = document.querySelector("#lista-eventos table tbody")

            data.forEach(e => {
                tabla.insertAdjacentHTML("beforeend", `
                    <tr data-id="${e.id}">
                        <td>${e.id}</td>
                        <td>${e.titulo}</td>
                        <td><button class="button-editar">✏️</button></td>
                        <td><button class="button-eliminar">🗑️</button></td>
                    </tr>
                `)

                const botonEditar = tabla.querySelector(`tr[data-id='${e.id}'] button.button-editar`)
                const botonEliminar = tabla.querySelector(`tr[data-id='${e.id}'] button.button-eliminar`)

                botonEditar.addEventListener("click", (evento) => {
                    evento.preventDefault()
                    editarForm.style.display = "flex"

                    fetch(`/api/eventos/${e.id}`)
                        .then(res => res.json())
                        .then(data => {
                            console.log("data.dateTime:", data.dateTime);

                            editarForm.querySelector("[name='id']").value = data.id
                            editarForm.querySelector("[name='titulo']").value = data.titulo
                            editarForm.querySelector("[name='description']").value = data.description
                            editarForm.querySelector("[name='category']").value = data.category
                            editarForm.querySelector("[name='imgUrl']").value = data.imgUrl

                            const instante = Temporal.Instant.from(data.dateTime);
                            const zoned = instante.toZonedDateTimeISO("Europe/Madrid");

                            const yyyy = zoned.year.toString().padStart(4, "0");
                            const mm = zoned.month.toString().padStart(2, "0");
                            const dd = zoned.day.toString().padStart(2, "0");
                            const hh = zoned.hour.toString().padStart(2, "0");
                            const min = zoned.minute.toString().padStart(2, "0");

                            editarForm.querySelector("[name='dateTime']").value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
                        })
                })

                botonEliminar.addEventListener("click", (evento) => {
                    evento.preventDefault()

                    fetch(`/api/eventos/${e.id}`, {
                        method: "DELETE"
                    })
                        .then(res => res.json())
                        .then(data => {
                            tabla.querySelector(`tr[data-id='${e.id}']`).remove()
                        })
                        .catch(err => console.error(err))
                })
            })
        })
})

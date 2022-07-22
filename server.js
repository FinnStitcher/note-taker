const express = require("express");
const fs = require("fs");
const path = require("path");

const notes = require("./db/db.json");
const idGenerator = require("./utils/id-generator");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});

// api routes
app.get("/api/notes", (req, res) => {
    res.json(notes);
});

app.post("/api/notes", (req, res) => {
    const newNote = {
        id: idGenerator(),
        ...req.body
    };
    notes.push(newNote);

    // JSON.stringify so the formatting isnt broken
    // extra args to make it pretty
    fs.writeFile("./db/db.json", JSON.stringify(notes, null, 4), (err) => {
        if (err) {
            console.log(err)
        } else {
            res.json(newNote);
        }
    });
});

app.delete("/api/notes/:id", (req, res) => {
    // the id is coming in as a string, so we have to parse it into an integer
    const id = parseInt(req.params.id);
    // storing an array of every note that *doesn't* match the id
    const filteredNotes = notes.filter(note => note.id !== id);

    fs.writeFile("./db/db.json", JSON.stringify(filteredNotes, null, 4), (err) => {
        if (err) {
            console.log(err)
        } else {
            res.json({
				message: "Deleted",
				id: req.params.id,
                data: filteredNotes
			});
        };
    })
});

// html routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
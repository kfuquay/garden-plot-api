CREATE TABLE plots (
    plotid SERIAL PRIMARY KEY,
    plotName TEXT NOT NULL,
    plotNotes TEXT,
    crops JSON
);
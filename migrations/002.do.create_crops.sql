CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    plotid INTEGER REFERENCES plots(id) ON DELETE SET NULL,
    cropname TEXT NOT NULL,
    dateplanted DATE,
    dateharvested DATE,
    cropnotes TEXT
);
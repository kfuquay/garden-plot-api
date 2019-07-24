CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    plotId INTEGER REFERENCES plots(id) ON DELETE SET NULL,
    cropName TEXT NOT NULL,
    datePlanted DATE,
    dateHarvested DATE,
    notes TEXT
);
export const PRAGMA_FOREIGN_KEYS = `PRAGMA foreign_keys = ON;`;

export const CREATE_REGIONES = `
CREATE TABLE IF NOT EXISTS REGIONES (
  codigo_ine TEXT PRIMARY KEY NOT NULL,
  nombre TEXT NOT NULL,
  poblacion INTEGER,
  id_poblacion TEXT,
  id_especial TEXT,
  id_especial2 TEXT,
  id_especial3 TEXT
);`;

export const CREATE_METADATA = `
CREATE TABLE IF NOT EXISTS METADATA (
  id_indicador TEXT PRIMARY KEY NOT NULL,
  tipo TEXT NOT NULL,
  direction TEXT,
  unidad TEXT,
  tipo_dato TEXT,
  formula TEXT,
  umbral_optimo REAL,
  umbral_malo REAL,
  fuente TEXT,
  actualizacion TEXT,
  corte_muestra TEXT,
  muestra_ods TEXT,
  muestra_aue TEXT
);`;

export const CREATE_METADATA_ES = `
CREATE TABLE IF NOT EXISTS METADATA_ES (
  id_indicador TEXT PRIMARY KEY NOT NULL,
  nombre TEXT,
  descripcion TEXT,
  FOREIGN KEY (id_indicador) REFERENCES METADATA(id_indicador)
);`;

export const CREATE_METADATA_CAT = `
CREATE TABLE IF NOT EXISTS METADATA_CAT (
  id_indicador TEXT PRIMARY KEY NOT NULL,
  nombre TEXT,
  descripcion TEXT,
  unidad TEXT,
  FOREIGN KEY (id_indicador) REFERENCES METADATA(id_indicador)
);`;

export const CREATE_DICCIONARIO = `
CREATE TABLE IF NOT EXISTS DICCIONARIO (
  id_dict TEXT PRIMARY KEY NOT NULL,
  nivel INTEGER NOT NULL,
  agenda TEXT NOT NULL,
  logo TEXT
);`;

export const CREATE_DICCIONARIO_ES = `
CREATE TABLE IF NOT EXISTS DICCIONARIO_ES (
  id_dict TEXT PRIMARY KEY NOT NULL,
  nombre TEXT,
  descripcion TEXT,
  FOREIGN KEY (id_dict) REFERENCES DICCIONARIO(id_dict)
);`;

export const CREATE_DICCIONARIO_CAT = `
CREATE TABLE IF NOT EXISTS DICCIONARIO_CAT (
  id_dict TEXT PRIMARY KEY NOT NULL,
  nombre TEXT,
  descripcion TEXT,
  FOREIGN KEY (id_dict) REFERENCES DICCIONARIO(id_dict)
);`;

export const CREATE_INDICADORES = `
CREATE TABLE IF NOT EXISTS INDICADORES (
  id_indicador TEXT NOT NULL,
  codigo_ine TEXT NOT NULL,
  periodo INTEGER NOT NULL,
  valor REAL,
  indice REAL,
  categoria TEXT,
  no_agregar TEXT,
  texto TEXT,
  FOREIGN KEY (id_indicador) REFERENCES METADATA(id_indicador),
  FOREIGN KEY (codigo_ine) REFERENCES REGIONES(codigo_ine)
);`;

export const CREATE_INDICADORES_DESCRIPTIVOS = `
CREATE TABLE IF NOT EXISTS INDICADORES_DESCRIPTIVOS (
  id_indicador TEXT NOT NULL,
  codigo_ine TEXT NOT NULL,
  periodo INTEGER NOT NULL,
  valor REAL,
  umbral TEXT,
  FOREIGN KEY (id_indicador) REFERENCES METADATA(id_indicador),
  FOREIGN KEY (codigo_ine) REFERENCES REGIONES(codigo_ine)
);`;

export const CREATE_ARQUITECTURA_L2 = `
CREATE TABLE IF NOT EXISTS ARQUITECTURA_L2 (
  parent TEXT NOT NULL,
  child TEXT NOT NULL,
  FOREIGN KEY (parent) REFERENCES DICCIONARIO(id_dict),
  FOREIGN KEY (child) REFERENCES METADATA(id_indicador)
);`;

export const CREATE_PROMEDIOS_ODS = `
CREATE TABLE IF NOT EXISTS PROMEDIOS_ODS (
  id_dict TEXT NOT NULL,
  codigo_ine TEXT NOT NULL,
  periodo INTEGER,
  valor REAL,
  n_indicadores INTEGER,
  ods_objetivo TEXT,
  FOREIGN KEY (id_dict) REFERENCES DICCIONARIO(id_dict),
  FOREIGN KEY (codigo_ine) REFERENCES REGIONES(codigo_ine)
);`;

export const CREATE_PROMEDIOS_AGENDAS = `
CREATE TABLE IF NOT EXISTS PROMEDIOS_AGENDAS (
  id_dict TEXT NOT NULL,
  codigo_ine TEXT NOT NULL,
  periodo INTEGER,
  valor REAL,
  n_indicadores INTEGER,
  FOREIGN KEY (id_dict) REFERENCES DICCIONARIO(id_dict),
  FOREIGN KEY (codigo_ine) REFERENCES REGIONES(codigo_ine)
);`;

export const ALL_DDL = [
  PRAGMA_FOREIGN_KEYS,
  CREATE_REGIONES,
  CREATE_METADATA,
  CREATE_METADATA_ES,
  CREATE_METADATA_CAT,
  CREATE_DICCIONARIO,
  CREATE_DICCIONARIO_ES,
  CREATE_DICCIONARIO_CAT,
  CREATE_INDICADORES,
  CREATE_INDICADORES_DESCRIPTIVOS,
  CREATE_ARQUITECTURA_L2,
  CREATE_PROMEDIOS_ODS,
  CREATE_PROMEDIOS_AGENDAS,
];

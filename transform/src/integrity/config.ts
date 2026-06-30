export interface CsvFileConfig {
  filename: string;
  requiredColumns: string[];
}

export const REQUIRED_CSV_FILES: CsvFileConfig[] = [
  {
    filename: 'regiones.csv',
    requiredColumns: ['codigo_ine', 'nombre']
  },
  {
    filename: 'indicadores_agendas.csv',
    requiredColumns: ['indicador', 'periodo', 'codigo_ine']
  },
  {
    filename: 'metadatos_agendas.csv',
    requiredColumns: ['indicador', 'clase', 'nombre']
  },
  {
    filename: 'proyectos.csv',
    requiredColumns: ['linea', 'objetivo', 'codigo', 'nombre', 'descripcion', 'logro']
  }
];


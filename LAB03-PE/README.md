# Chromatix - Test de Daltonismo

Aplicacion web interactiva para la evaluacion de la vision del color en ninos y adultos, con soporte de comandos por voz y entorno visual D65.

## Requisitos previos

- Node.js (version 18 o superior recomendada)
- npm (incluido con Node.js)
- Navegador web moderno (Google Chrome o Microsoft Edge recomendado para funciones de voz)

## Instalacion

1. Clonar o descargar el repositorio en tu equipo.
2. Abrir una terminal en la carpeta raiz del proyecto.
3. Instalar las dependencias ejecutando:

```bash
npm install
```

## Ejecucion en desarrollo

Para iniciar el servidor local de desarrollo:

```bash
npm run dev
```

Una vez ejecutado el comando, abre en tu navegador la direccion local que aparece en la terminal (por defecto `http://localhost:5173`).

## Compilacion para produccion

Para generar los archivos optimizados para despliegue:

```bash
npm run build
```

Los archivos finales se generaran dentro de la carpeta `dist/`.

Para previsualizar la compilacion de produccion de forma local:

```bash
npm run preview
```

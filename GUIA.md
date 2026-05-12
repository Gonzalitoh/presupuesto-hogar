# GUIA: Presupuesto Hogar - Setup completo

Esta guia te lleva paso a paso para tener la app funcionando en tu celular
y tu PC, sincronizada entre ambos, instalable como app nativa.

---

## PARTE 1: Crear el proyecto Firebase (gratis, 10 minutos)

Firebase es el servicio de Google que va a sincronizar tus datos entre
dispositivos. Es 100% gratis para este uso.

### Paso 1.1: Crear cuenta/proyecto

1. Abri https://console.firebase.google.com
2. Logueate con tu cuenta de Google (cualquiera sirve)
3. Click en **"Crear un proyecto"** (o "Add project")
4. Nombre del proyecto: `presupuesto-hogar` (o el que quieras)
5. Desactiva Google Analytics (no lo necesitamos) → **Crear proyecto**
6. Espera a que se cree (30 segundos) → Click **Continuar**

### Paso 1.2: Activar Firestore (la base de datos)

1. En el menu de la izquierda, busca **"Firestore Database"**
   (esta en "Compilacion" o "Build")
2. Click en **"Crear base de datos"**
3. Selecciona **"Iniciar en modo de prueba"** → **Siguiente**
4. Ubicacion: `southamerica-east1` (o la mas cercana) → **Habilitar**
5. Espera a que se cree (30 segundos)

### Paso 1.3: Activar autenticacion anonima

1. En el menu de la izquierda, busca **"Authentication"**
   (esta en "Compilacion" o "Build")
2. Click en **"Comenzar"**
3. En la pestana **"Metodo de acceso"**, busca **"Anonimo"**
4. Activalo (switch ON) → **Guardar**

### Paso 1.4: Obtener la configuracion

1. En la pagina principal del proyecto, busca el icono **"</>"** (Web)
   arriba a la izquierda, al lado de iOS y Android
2. Nombre de la app: `presupuesto` → **Registrar app**
3. Te va a mostrar un bloque de codigo. Busca la parte que dice:

```
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "presupuesto-hogar.firebaseapp.com",
  projectId: "presupuesto-hogar",
  storageBucket: "presupuesto-hogar.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

4. Copia SOLO el contenido entre las llaves como JSON:

```json
{
  "apiKey": "AIza...",
  "authDomain": "presupuesto-hogar.firebaseapp.com",
  "projectId": "presupuesto-hogar",
  "storageBucket": "presupuesto-hogar.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc123"
}
```

5. Guarda ese texto en algun lado (lo vas a necesitar en el Paso 3)

### Paso 1.5: Configurar reglas de seguridad

1. Anda a **Firestore Database** → pestana **"Reglas"**
2. Reemplaza todo el contenido por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{householdId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publicar"**

---

## PARTE 2: Subir la app a internet (5 minutos)

Necesitamos que la app este en una URL con HTTPS para que funcione
como PWA (instalable) y para que Firebase pueda conectarse.

### Opcion A: Netlify (la mas facil)

1. Abri https://www.netlify.com
2. Create una cuenta gratis (puede ser con Google o email)
3. Una vez adentro, vas a ver un area que dice **"Deploy manually"**
   o **"Drag and drop your site output folder here"**
4. Arrastra la carpeta `presupuesto-app` completa
   (la que contiene index.html, manifest.json, service-worker.js, etc.)
5. Espera 30 segundos → Te da una URL tipo:
   `https://algo-random.netlify.app`
6. (Opcional) Cambiala en Site Settings → Domain management →
   por ejemplo: `presupuesto-hogar.netlify.app`

### Opcion B: GitHub Pages (si tenes cuenta de GitHub)

1. Crea un repositorio nuevo llamado `presupuesto-hogar`
2. Subi todos los archivos de la carpeta `presupuesto-app`
3. Anda a Settings → Pages → Source: Deploy from branch `main`
4. En 2 minutos tenes la URL: `tunombre.github.io/presupuesto-hogar`

---

## PARTE 3: Configurar la app (5 minutos)

### En la PC:

1. Abri la URL de Netlify/GitHub en Chrome (o el navegador que uses)
2. La app se carga y ves "Presupuesto Hogar"
3. Anda a la pestana **"Balance"** → seccion **"Sincronizacion y Backup"**
4. Click en **"Vincular dispositivos"**
5. Te pide la configuracion de Firebase:
   - Pega el JSON que copiaste en el Paso 1.4
   - Click **"Guardar configuracion"**
6. **Recarga la pagina** (F5 o Ctrl+R)
7. Volve a "Balance" → "Vincular dispositivos"
8. Click **"Crear nuevo hogar"**
9. Te aparece un codigo de 6 letras (ej: `XK7M2P`)
10. **Anota o copia ese codigo** → se lo vas a pasar a tu pareja

### En el celular:

1. Abri la misma URL en Chrome (celular)
2. Te va a aparecer un banner arriba que dice **"Instalar como app"**
   → Toca **"Instalar"**
   (Si no aparece: menu de Chrome ⋮ → "Instalar app" o "Agregar a inicio")
3. Se instala como app en tu celular
4. Abrila desde el icono en tu pantalla de inicio
5. Anda a **"Balance"** → **"Vincular dispositivos"**
6. Pega la misma configuracion de Firebase
7. Recarga
8. Volve a "Vincular dispositivos" → **Ingresa el codigo de 6 letras**
9. Toca **"Unirse al hogar"**
10. Los datos se sincronizan automaticamente

### Para tu pareja (segundo dispositivo):

Repetir los pasos del celular, usando el **mismo codigo de hogar**.
Los 3 dispositivos (o mas) quedan sincronizados.

---

## PARTE 4: Uso diario

### Cargar gastos:
- Abri la app (desde el icono en el celu o la URL en la PC)
- Pestana "Gastos" → "+ Registrar Gasto"
- El gasto se guarda localmente y se sincroniza automaticamente

### Indicador de sync:
- **Punto verde** "Sincronizado" = todo bien
- **Punto amarillo** "Sincronizando..." = subiendo datos
- **Punto rojo** "Sin conexion" = trabajando offline (se sincroniza cuando vuelva internet)

### Backup manual:
- Pestana "Balance" → "Descargar backup"
- Descarga un archivo .json con TODOS tus datos
- Guardalo en Drive/email como respaldo

### Restaurar backup:
- Pestana "Balance" → "Restaurar backup"
- Selecciona el archivo .json
- Se importan todos los meses

---

## Estructura de archivos

Tu carpeta `presupuesto-app` contiene:

```
presupuesto-app/
  index.html          ← La app completa
  manifest.json       ← Metadata para PWA (icono, nombre, etc.)
  service-worker.js   ← Cache offline
  icon.svg            ← Icono de la app
  icon-192.png        ← Icono 192px (PWA)
  icon-512.png        ← Icono 512px (PWA)
  GUIA.md             ← Este archivo
```

---

## Preguntas frecuentes

**P: Cuanto cuesta Firebase?**
R: Nada. El plan gratis (Spark) incluye 1GB de base de datos y 10GB de
transferencia por mes. Para un presupuesto hogareño, nunca vas a pasar
ese limite.

**P: Que pasa si no tengo internet?**
R: La app funciona igual. Los datos se guardan localmente y se sincronizan
cuando vuelva la conexion.

**P: Puedo usarla solo en la PC sin sincronizacion?**
R: Si. Simplemente no configures Firebase. La app funciona 100% offline
con localStorage.

**P: Como actualizo la app si hay una version nueva?**
R: Subi los archivos nuevos a Netlify (arrastra la carpeta de nuevo).
En cada dispositivo, recarga la pagina para obtener la nueva version.

**P: Mis datos son privados?**
R: Si. Firebase usa autenticacion anonima + un codigo de hogar que solo
vos y tu pareja conocen. Nadie mas puede ver los datos.

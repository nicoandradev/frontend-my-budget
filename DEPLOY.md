# Guía de Despliegue del Frontend

Este proyecto está desplegado en **Firebase Hosting**.

## Pasos para Actualizar en Producción

### Opción 1: Usando el script de deploy (Recomendado)

```bash
npm run deploy
```

Este comando:
1. Construye el proyecto (`npm run build`)
2. Despliega a Firebase Hosting (`firebase deploy --only hosting`)

### Opción 2: Pasos manuales

```bash
# 1. Construir el proyecto
npm run build

# 2. Desplegar a Firebase
firebase deploy --only hosting
```

## Verificar el Despliegue

Después del deploy, Firebase te mostrará la URL de tu sitio. Generalmente será:
```
https://fin-ko-eed1d.web.app
```
o
```
https://fin-ko-eed1d.firebaseapp.com
```

## Requisitos Previos

1. **Firebase CLI instalado**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Autenticado en Firebase**:
   ```bash
   firebase login
   ```

3. **Proyecto configurado**: El archivo `.firebaserc` ya tiene el proyecto configurado (`fin-ko-eed1d`)

## Verificar Estado

```bash
# Ver si estás autenticado
firebase login:list

# Ver el proyecto actual
firebase projects:list

# Ver el estado del hosting
firebase hosting:sites:list
```

## Rollback (Revertir a versión anterior)

Si necesitas revertir a una versión anterior:

```bash
# Listar versiones anteriores
firebase hosting:clone fin-ko-eed1d:live fin-ko-eed1d:rollback

# O desde la consola de Firebase
# Ve a Firebase Console > Hosting > Releases y selecciona una versión anterior
```

## Notas Importantes

- El build genera los archivos en la carpeta `dist/`
- Firebase Hosting sirve los archivos desde `dist/` (configurado en `firebase.json`)
- Los cambios se reflejan inmediatamente después del deploy
- El deploy puede tardar 1-2 minutos

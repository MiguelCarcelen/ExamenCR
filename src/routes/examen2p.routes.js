import { Router } from "express";
import {
  grabarResultado,
  login,
  obtenerEquipos,
  obtenerRecaudacion,
  obtenerResultados,
  obtenerUserID,
  obtenerUsuariosQueAcertaron,
  recuperarPartidos,
  recuperarResultados,
  registrarPartido,
  registrarPronostico,
} from "../controladores/examen2pCtrl.js";
const router = Router();
// armar nuestras rutas

router.post("/getUsuarioID", obtenerUserID);
router.get("/obtenerEquipos", obtenerEquipos);
router.post("/login", login);
router.post("/registrarPartido", registrarPartido);
router.post("/registrarPronostico", registrarPronostico);
router.get("/recuperarPartidos", recuperarPartidos);
router.get("/recuperarResultados", recuperarResultados);
router.get("/obtenerResultados", obtenerResultados);
router.get("/obtenerUsuariosQueAcertaron", obtenerUsuariosQueAcertaron);
router.get("/obtenerRecaudacion", obtenerRecaudacion);

router.post("/grabarResultado", grabarResultado);

export default router;

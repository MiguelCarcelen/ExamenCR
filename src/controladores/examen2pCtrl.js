import { conmysql } from "../db.js";

export const obtenerEquipos = async (req, res) => {
  try {
    // Consulta para obtener todos los equipos
    const [equipos] = await conmysql.query(`SELECT * FROM equipo`);

    if (equipos.length > 0) {
      return res.status(200).json({
        Mensaje: "Equipos obtenidos exitosamente",
        cantidad: equipos.length,
        data: equipos,
        color: "success",
      });
    } else {
      return res.status(404).json({
        Mensaje: "No se encontraron equipos",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }
  } catch (error) {
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};
export const obtenerUserID = async (req, res) => {
  try {
    const { IdUser } = req.body;

    // Validar que se envían ambos campos
    if (!IdUser) {
      return res.status(400).json({
        Mensaje: "Error: El usuario es requerido",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    // Consulta la base de datos
    const [result] = await conmysql.query(
      `SELECT * FROM usuario WHERE id_usr = ? `,
      [IdUser]
    );

    // Manejo de resultados
    if (result.length > 0) {
      return res.json({
        Mensaje: "Se encontro el usuario",
        cantidad: result.length,
        data: result,
        color: "success",
      });
    } else {
      return res.status(401).json({
        Mensaje: "No se encontro el usuario",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }
  } catch (error) {
    // Manejo de errores del servidor
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};
export const login = async (req, res) => {
  try {
    const { user, password } = req.body;

    // Validar que se envían ambos campos
    if (!user) {
      return res.status(400).json({
        Mensaje: "Error: El usuario es requeridoooo",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    if (!password) {
      return res.status(400).json({
        Mensaje: "Error: La contraseña es requerida",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    // Consulta la base de datos
    const [result] = await conmysql.query(
      `SELECT * FROM usuario WHERE usuario = ? AND clave = ?`,
      [user, password]
    );

    // Manejo de resultados
    if (result.length > 0) {
      return res.json({
        Mensaje: "Inicio de sesión exitoso",
        cantidad: result.length,
        data: result,
        color: "success",
      });
    } else {
      return res.status(401).json({
        Mensaje: "Credenciales incorrectas",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }
  } catch (error) {
    // Manejo de errores del servidor
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};
export const registrarPartido = async (req, res) => {
  try {
    const { fecha, equipo_local, equipo_visitante } = req.body;

    if (!fecha) {
      return res.status(400).json({
        Mensaje: "Error: Todos los campos son obligatorios (fecha)",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }
    if (!equipo_local) {
      return res.status(400).json({
        Mensaje: "Error: Todos los campos son obligatorios (equipo_local)",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }
    if (!equipo_visitante) {
      return res.status(400).json({
        Mensaje: "Error: Todos los campos son obligatorios ( equipo_visitante)",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    // Insertar los datos del partido
    const [result] = await conmysql.query(
      `INSERT INTO partido ( eq_uno, eq_dos, fecha_par,estado_par) VALUES (?, ?, ?, 'activo')`,
      [equipo_local, equipo_visitante, fecha]
    );

    if (result.affectedRows > 0) {
      return res.status(201).json({
        Mensaje: "Partido registrado exitosamente",
        cantidad: 1,
        data: result,
        color: "success",
      });
    } else {
      return res.status(500).json({
        Mensaje: "Error al registrar el partido",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }
  } catch (error) {
    // Manejo de errores del servidor
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};
export const registrarPronostico = async (req, res) => {
  try {
    const { id_usr, id_par, id_res, valor } = req.body;

    // Validar que se envían los campos requeridos
    if (!id_usr || !id_par || !id_res || !valor) {
      return res.status(400).json({
        Mensaje: "Error: Todos los campos son requeridos",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    // Verificar si el partido está activo
    const [partido] = await conmysql.query(
      `SELECT estado_par FROM partido WHERE id_par = ?`,
      [id_par]
    );

    if (partido.length === 0 || partido[0].estado_par !== "activo") {
      return res.status(400).json({
        Mensaje: "Error: El partido no está activo o no existe",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    // Insertar el pronóstico en la base de datos
    const [result] = await conmysql.query(
      `INSERT INTO pronostico (id_usr, id_par, id_res, valor, fecha_registro) VALUES (?, ?, ?, ?, NOW())`,
      [id_usr, id_par, id_res, valor]
    );

    return res.json({
      Mensaje: "Pronóstico registrado exitosamente",
      cantidad: result.affectedRows,
      data: { id_pron: result.insertId, id_usr, id_par, id_res, valor },
      color: "success",
    });
  } catch (error) {
    // Manejo de errores del servidor
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

export const recuperarPartidos = async (req, res) => {
  try {
    // Recuperar los partidos activos
    const [partidos] = await conmysql.query(
      `SELECT p.id_par, e1.nombre_eq AS equipo_uno, e2.nombre_eq AS equipo_dos, p.fecha_par, p.estado_par 
       FROM partido p
       JOIN equipo e1 ON p.eq_uno = e1.id_eq
       JOIN equipo e2 ON p.eq_dos = e2.id_eq
       WHERE p.estado_par = 'activo'`
    );

    return res.json({
      Mensaje: "Partidos activos recuperados exitosamente",
      cantidad: partidos.length,
      data: partidos,
      color: "success",
    });
  } catch (error) {
    // Manejo de errores del servidor
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

export const obtenerResultados = async (req, res) => {
  try {
    // Consulta para recuperar todos los resultados de la base de datos
    const [resultados] = await conmysql.query(
      `SELECT id_res, descripcion_res FROM resultado`
    );

    return res.status(200).json({
      Mensaje: "Resultados recuperados exitosamente",
      cantidad: resultados.length,
      data: resultados,
      color: "success",
    });
  } catch (error) {
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};
export const recuperarResultados = async (req, res) => {
  try {
    // Recuperar los resultados
    const [resultados] = await conmysql.query(`SELECT * FROM resultado`);

    return res.json({
      Mensaje: "Resultados recuperados exitosamente",
      cantidad: resultados.length,
      data: resultados,
      color: "success",
    });
  } catch (error) {
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

export const grabarResultado = async (req, res) => {
  try {
    const { id_par, id_res } = req.body;

    if (!id_par || !id_res) {
      return res.status(400).json({
        Mensaje: "Error: Todos los campos son requeridos",
        cantidad: 0,
        data: [],
        color: "danger",
      });
    }

    // Actualizar el resultado del partido
    const [result] = await conmysql.query(
      `UPDATE partido SET id_res = ?, estado_par = 'cerrado' WHERE id_par = ?`,
      [id_res, id_par]
    );

    return res.json({
      Mensaje: "Resultado del partido actualizado exitosamente",
      cantidad: result.affectedRows,
      data: { id_par, id_res },
      color: "success",
    });
  } catch (error) {
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

export const obtenerUsuariosQueAcertaron = async (req, res) => {
  try {
    const [resultados] = await conmysql.query(`
        SELECT 
            pr.id_usr,
            u.nombres,
            pr.valor,
            r.descripcion_res
        FROM 
            pronostico pr
        JOIN 
            resultado r ON pr.id_res = r.id_res
        JOIN 
            usuario u ON pr.id_usr = u.id_usr
        WHERE 
            pr.id_par IN (
                SELECT id_par 
                FROM partido 
                WHERE estado_par = 'cerrado'
            ) 
            AND pr.id_res = r.id_res
        LIMIT 25;
    `);

    return res.json({
      Mensaje: "Usuarios que acertaron los pronósticos",
      cantidad: resultados.length,
      data: resultados,
      color: "success",
    });
  } catch (error) {
    console.error("Error al recuperar los usuarios que acertaron", error);

    return res.status(500).json({
      Mensaje: "Error en el servidor al recuperar los usuarios que acertaron",
      error: error.message,
    });
  }
};

export const obtenerRecaudacion = async (req, res) => {
  try {
    // Consulta para sumar todos los valores de los pronósticos directamente
    const [rows] = await conmysql.query(`
      SELECT SUM(valor) AS totalRecaudado
      FROM pronostico;
    `);

    if (rows && rows[0] && rows[0].totalRecaudado > 0) {
      return res.status(200).json({
        Mensaje: "Recaudación calculada exitosamente",
        totalRecaudado: rows[0].totalRecaudado,
        color: "success",
      });
    } else {
      return res.status(404).json({
        Mensaje: "No se encontraron pronósticos",
        totalRecaudado: 0,
        color: "danger",
      });
    }
  } catch (error) {
    return res.status(500).json({
      Mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

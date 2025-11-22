
import React, { useState } from 'react';
import './App.css';
import BibliotecaJuegos from './components/BibliotecaJuegos';
import ListaResenas from './components/ListaResenas';
import EstadisticasPersonales from './components/EstadisticasPersonales';

function App() {
  const [vistaActual, setVistaActual] = useState('biblioteca');

  const renderVista = () => {
    switch(vistaActual) {
      case 'biblioteca':
        return <BibliotecaJuegos />;
      case 'resenas':
        return <ListaResenas />;
      case 'estadisticas':
        return <EstadisticasPersonales />;
      default:
        return <BibliotecaJuegos />;
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🎮 GameTracker</h1>
        <p className="subtitulo">Tu biblioteca personal de videojuegos</p>
      </header>

      <nav className="navegacion">
        <button 
          className={vistaActual === 'biblioteca' ? 'active' : ''} 
          onClick={() => setVistaActual('biblioteca')}
        >
          📚 Biblioteca
        </button>
        <button 
          className={vistaActual === 'resenas' ? 'active'  : ''} 
          onClick={() => setVistaActual('resenas')}
        >
          ✍️ Reseñas
        </button>
        <button 
          className={vistaActual === 'estadisticas' ? 'active' : ''} 
          onClick={() => setVistaActual('estadisticas')}
        >
          📊 Estadísticas
        </button>
      </nav>

      <main className="contenido">
        {renderVista()}
      </main>

      <footer className="footer">
        <p>Hecho con ❤️ para gamers</p>
      </footer>
    </div>
  );
}

export default App ;
import React, { useState, useEffect } from 'react';
import TarjetaJuego from './TarjetaJuego';
import FormularioJuego from './FormularioJuego';

const API_URL = 'http://localhost:5000/api';

function BibliotecaJuegos() {
  const [juegos, setJuegos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [juegoEditando, setJuegoEditando] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarJuegos();
  }, []);

  const cargarJuegos = async () => {
    try {
      const response = await fetch(`${API_URL}/juegos`);
      const data = await response.json();
      setJuegos(data);
    } catch (error) {
      console.error('Error al cargar juegos:', error);
    }
  };

  const agregarJuego = async (nuevoJuego) => {
    try {
      const response = await fetch(`${API_URL}/juegos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoJuego)
      });
      await cargarJuegos();
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al agregar juego:', error);
    }
  };

  const editarJuego = async (id, datosActualizados) => {
    try {
      await fetch(`${API_URL}/juegos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });
      await cargarJuegos();
      setJuegoEditando(null);
    } catch (error) {
      console.error('Error al editar juego:', error);
    }
  };

  const eliminarJuego = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este juego?')) {
      try {
        await fetch(`${API_URL}/juegos/${id}`, { method: 'DELETE' });
        await cargarJuegos();
      } catch (error) {
        console.error('Error al eliminar juego:', error);
      }
    }
  };

  const juegosFiltrados = juegos.filter(juego => {
    if (filtro === 'completados') return juego.completado;
    if (filtro === 'pendientes') return !juego.completado;
    return true;
  });

  return (
    <div className="biblioteca">
      <div className="controles">
        <button className="btn-agregar" onClick={() => setMostrarFormulario(true)}>
          ➕ Agregar Juego
        </button>
        
        <div className="filtros">
          <button onClick={() => setFiltro('todos')} className={filtro === 'todos' ? 'activo' : ''}>
            Todos ({juegos.length})
          </button>
          <button onClick={() => setFiltro('completados')} className={filtro === 'completados' ? 'activo' : ''}>
            Completados ({juegos.filter(j => j.completado).length})
          </button>
          <button onClick={() => setFiltro('pendientes')} className={filtro === 'pendientes' ? 'activo' : ''}>
            Pendientes ({juegos.filter(j => !j.completado).length})
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <FormularioJuego
          onGuardar={agregarJuego}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {juegoEditando && (
        <FormularioJuego
          juego={juegoEditando}
          onGuardar={(datos) => editarJuego(juegoEditando._id, datos)}
          onCancelar={() => setJuegoEditando(null)}
        />
      )}

      <div className="grid-juegos">
        {juegosFiltrados.map(juego => (
          <TarjetaJuego
            key={juego._id}
            juego={juego}
            onEditar={() => setJuegoEditando(juego)}
            onEliminar={() => eliminarJuego(juego._id)}
          />
        ))}
      </div>

      {juegosFiltrados.length === 0 && (
        <div className="vacio">
          <p>No hay juegos en tu biblioteca 😢</p>
          <p>¡Agrega tu primer juego!</p>
        </div>
      )}
    </div>
  );
}

export default BibliotecaJuegos;
import React, { useState } from 'react';

// ===== TARJETA DE JUEGO =====
export function TarjetaJuego({ juego, onEditar, onEliminar }) {
  const estrellas = '⭐'.repeat(Math.round(juego.puntuacion));

  return (
    <div className={`tarjeta-juego ${juego.completado ? 'completado' : ''}`}>
      <img src={juego.portada} alt={juego.titulo} className="portada" />
      
      <div className="info-juego">
        <h3>{juego.titulo}</h3>
        <p className="plataforma">🎮 {juego.plataforma}</p>
        <p className="genero">🏷️ {juego.genero}</p>
        <p className="puntuacion">{estrellas || '⭐ Sin calificar'}</p>
        <p className="horas">⏱️ {juego.horasJugadas}h jugadas</p>
        
        {juego.completado && (
          <span className="badge-completado">✅ Completado</span>
        )}
      </div>

      <div className="acciones">
        <button onClick={onEditar} className="btn-editar">✏️</button>
        <button onClick={onEliminar} className="btn-eliminar">🗑️</button>
      </div>
    </div>
  );
}

// ===== FORMULARIO DE JUEGO =====
function FormularioJuego({ juego, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(juego || {
    titulo: '',
    portada: '',
    plataforma: '',
    genero: '',
    puntuacion: 0,
    completado: false,
    horasJugadas: 0,
    desarrollador: '',
    anoLanzamiento: new Date().getFullYear()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(datos);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatos({
      ...datos,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="modal">
      <div className="formulario-container">
        <h2>{juego ? '✏️ Editar Juego' : '➕ Agregar Juego'}</h2>
        
        <form onSubmit={handleSubmit} className="formulario">
          <input
            type="text"
            name="titulo"
            placeholder="Título del juego *"
            value={datos.titulo}
            onChange={handleChange}
            required
          />

          <input
            type="url"
            name="portada"
            placeholder="URL de la portada"
            value={datos.portada}
            onChange={handleChange}
          />

          <select name="plataforma" value={datos.plataforma} onChange={handleChange} required>
            <option value="">Selecciona plataforma *</option>
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox">Xbox</option>
            <option value="Nintendo Switch">Nintendo Switch</option>
            <option value="PC">PC</option>
            <option value="Mobile">Mobile</option>
          </select>

          <input
            type="text"
            name="genero"
            placeholder="Género (Ej: Aventura, RPG) *"
            value={datos.genero}
            onChange={handleChange}
            required
          />

          <div className="campo-numero">
            <label>Puntuación (0-5 estrellas):</label>
            <input
              type="number"
              name="puntuacion"
              min="0"
              max="5"
              step="0.5"
              value={datos.puntuacion}
              onChange={handleChange}
            />
          </div>

          <div className="campo-numero">
            <label>Horas jugadas:</label>
            <input
              type="number"
              name="horasJugadas"
              min="0"
              value={datos.horasJugadas}
              onChange={handleChange}
            />
          </div>

          <input
            type="text"
            name="desarrollador"
            placeholder="Desarrollador"
            value={datos.desarrollador}
            onChange={handleChange}
          />

          <input
            type="number"
            name="anoLanzamiento"
            placeholder="Año de lanzamiento"
            value={datos.anoLanzamiento}
            onChange={handleChange}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="completado"
              checked={datos.completado}
              onChange={handleChange}
            />
            ✅ Juego completado
          </label>

          <div className="botones-formulario">
            <button type="submit" className="btn-guardar">💾 Guardar</button>
            <button type="button" onClick={onCancelar} className="btn-cancelar">❌ Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioJuego;
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

// ===== LISTA DE RESEÑAS =====
function ListaResenas() {
  const [resenas, setResenas] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [resenaEditando, setResenaEditando] = useState(null);

  useEffect(() => {
    cargarResenas();
    cargarJuegos();
  }, []);

  const cargarResenas = async () => {
    try {
      const response = await fetch(`${API_URL}/resenas`);
      const data = await response.json();
      setResenas(data);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    }
  };

  const cargarJuegos = async () => {
    try {
      const response = await fetch(`${API_URL}/juegos`);
      const data = await response.json();
      setJuegos(data);
    } catch (error) {
      console.error('Error al cargar juegos:', error);
    }
  };

  const agregarResena = async (nuevaResena) => {
    try {
      await fetch(`${API_URL}/resenas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaResena)
      });
      await cargarResenas();
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al agregar reseña:', error);
    }
  };

  const editarResena = async (id, datosActualizados) => {
    try {
      await fetch(`${API_URL}/resenas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });
      await cargarResenas();
      setResenaEditando(null);
    } catch (error) {
      console.error('Error al editar reseña:', error);
    }
  };

  const eliminarResena = async (id) => {
    if (window.confirm('¿Eliminar esta reseña?')) {
      try {
        await fetch(`${API_URL}/resenas/${id}`, { method: 'DELETE' });
        await cargarResenas();
      } catch (error) {
        console.error('Error al eliminar reseña:', error);
      }
    }
  };

  return (
    <div className="lista-resenas">
      <button className="btn-agregar" onClick={() => setMostrarFormulario(true)}>
        ✍️ Escribir Reseña
      </button>

      {mostrarFormulario && (
        <FormularioResena
          juegos={juegos}
          onGuardar={agregarResena}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {resenaEditando && (
        <FormularioResena
          resena={resenaEditando}
          juegos={juegos}
          onGuardar={(datos) => editarResena(resenaEditando._id, datos)}
          onCancelar={() => setResenaEditando(null)}
        />
      )}

      <div className="resenas-grid">
        {resenas.map(resena => (
          <div key={resena._id} className="tarjeta-resena">
            <div className="resena-header">
              <h3>{resena.titulo}</h3>
              <span className="calificacion">{'⭐'.repeat(resena.calificacion)}</span>
            </div>
            
            <p className="juego-asociado">
              🎮 {resena.juegoId?.titulo || 'Juego no disponible'}
            </p>
            
            <p className="contenido">{resena.contenido}</p>
            
            {resena.aspectosPositivos?.length > 0 && (
              <div className="aspectos positivos">
                <strong>👍 Lo mejor:</strong>
                <ul>
                  {resena.aspectosPositivos.map((aspecto, i) => (
                    <li key={i}>{aspecto}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {resena.aspectosNegativos?.length > 0 && (
              <div className="aspectos negativos">
                <strong>👎 Lo peor:</strong>
                <ul>
                  {resena.aspectosNegativos.map((aspecto, i) => (
                    <li key={i}>{aspecto}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="resena-footer">
              <span className={resena.recomendado ? 'recomendado' : 'no-recomendado'}>
                {resena.recomendado ? '✅ Recomendado' : '⛔ No recomendado'}
              </span>
              <div className="acciones">
                <button onClick={() => setResenaEditando(resena)}>✏️</button>
                <button onClick={() => eliminarResena(resena._id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resenas.length === 0 && (
        <div className="vacio">
          <p>No hay reseñas aún 📝</p>
          <p>¡Escribe tu primera reseña!</p>
        </div>
      )}
    </div>
  );
}

// ===== FORMULARIO DE RESEÑA =====
function FormularioResena({ resena, juegos, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(resena || {
    juegoId: '',
    titulo: '',
    contenido: '',
    calificacion: 5,
    aspectosPositivos: [],
    aspectosNegativos: [],
    recomendado: true
  });

  const [positivoNuevo, setPositivoNuevo] = useState('');
  const [negativoNuevo, setNegativoNuevo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(datos);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatos({
      ...datos,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const agregarAspecto = (tipo) => {
    const valor = tipo === 'positivo' ? positivoNuevo : negativoNuevo;
    if (!valor.trim()) return;

    const campo = tipo === 'positivo' ? 'aspectosPositivos' : 'aspectosNegativos';
    setDatos({
      ...datos,
      [campo]: [...datos[campo], valor.trim()]
    });

    tipo === 'positivo' ? setPositivoNuevo('') : setNegativoNuevo('');
  };

  const eliminarAspecto = (tipo, index) => {
    const campo = tipo === 'positivo' ? 'aspectosPositivos' : 'aspectosNegativos';
    setDatos({
      ...datos,
      [campo]: datos[campo].filter((_, i) => i !== index)
    });
  };

  return (
    <div className="modal">
      <div className="formulario-container">
        <h2>{resena ? '✏️ Editar Reseña' : '✍️ Nueva Reseña'}</h2>
        
        <form onSubmit={handleSubmit} className="formulario">
          <select name="juegoId" value={datos.juegoId} onChange={handleChange} required>
            <option value="">Selecciona un juego *</option>
            {juegos.map(juego => (
              <option key={juego._id} value={juego._id}>{juego.titulo}</option>
            ))}
          </select>

          <input
            type="text"
            name="titulo"
            placeholder="Título de la reseña *"
            value={datos.titulo}
            onChange={handleChange}
            required
          />

          <textarea
            name="contenido"
            placeholder="Escribe tu reseña aquí... *"
            value={datos.contenido}
            onChange={handleChange}
            rows="6"
            required
          />

          <div className="campo-numero">
            <label>Calificación (1-5 estrellas):</label>
            <input
              type="number"
              name="calificacion"
              min="1"
              max="5"
              value={datos.calificacion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="aspectos-section">
            <label>👍 Aspectos positivos:</label>
            <div className="agregar-aspecto">
              <input
                type="text"
                value={positivoNuevo}
                onChange={(e) => setPositivoNuevo(e.target.value)}
                placeholder="Agregar aspecto positivo"
              />
              <button type="button" onClick={() => agregarAspecto('positivo')}>+</button>
            </div>
            <ul>
              {datos.aspectosPositivos.map((aspecto, i) => (
                <li key={i}>
                  {aspecto}
                  <button type="button" onClick={() => eliminarAspecto('positivo', i)}>❌</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="aspectos-section">
            <label>👎 Aspectos negativos:</label>
            <div className="agregar-aspecto">
              <input
                type="text"
                value={negativoNuevo}
                onChange={(e) => setNegativoNuevo(e.target.value)}
                placeholder="Agregar aspecto negativo"
              />
              <button type="button" onClick={() => agregarAspecto('negativo')}>+</button>
            </div>
            <ul>
              {datos.aspectosNegativos.map((aspecto, i) => (
                <li key={i}>
                  {aspecto}
                  <button type="button" onClick={() => eliminarAspecto('negativo', i)}>❌</button>
                </li>
              ))}
            </ul>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="recomendado"
              checked={datos.recomendado}
              onChange={handleChange}
            />
            ✅ Recomiendo este juego
          </label>

          <div className="botones-formulario">
            <button type="submit" className="btn-guardar">💾 Guardar</button>
            <button type="button" onClick={onCancelar} className="btn-cancelar">❌ Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ListaResenas;
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

// ===== ESTADÍSTICAS PERSONALES =====
function EstadisticasPersonales() {
  const [juegos, setJuegos] = useState([]);
  const [resenas, setResenas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [juegoRes, resenaRes] = await Promise.all([
        fetch(`${API_URL}/juegos`),
        fetch(`${API_URL}/resenas`)
      ]);
      setJuegos(await juegoRes.json());
      setResenas(await resenaRes.json());
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const stats = {
    totalJuegos: juegos.length,
    completados: juegos.filter(j => j.completado).length,
    horasTotales: juegos.reduce((sum, j) => sum + (j.horasJugadas || 0), 0),
    promedioCalificacion: juegos.length > 0 
      ? (juegos.reduce((sum, j) => sum + j.puntuacion, 0) / juegos.length).toFixed(1)
      : 0,
    totalResenas: resenas.length,
    plataformaFavorita: calcularPlataformaFavorita(juegos),
    generoFavorito: calcularGeneroFavorito(juegos)
  };

  function calcularPlataformaFavorita(juegos) {
    if (juegos.length === 0) return 'N/A';
    const conteo = {};
    juegos.forEach(j => conteo[j.plataforma] = (conteo[j.plataforma] || 0) + 1);
    return Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b);
  }

  function calcularGeneroFavorito(juegos) {
    if (juegos.length === 0) return 'N/A';
    const conteo = {};
    juegos.forEach(j => conteo[j.genero] = (conteo[j.genero] || 0) + 1);
    return Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b);
  }

  return (
    <div className="estadisticas">
      <h2>📊 Tus Estadísticas de Juego</h2>
      
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icono">🎮</div>
          <div className="stat-numero">{stats.totalJuegos}</div>
          <div className="stat-label">Juegos en Biblioteca</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icono">✅</div>
          <div className="stat-numero">{stats.completados}</div>
          <div className="stat-label">Completados</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icono">⏱️</div>
          <div className="stat-numero">{stats.horasTotales}h</div>
          <div className="stat-label">Horas Totales</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icono">⭐</div>
          <div className="stat-numero">{stats.promedioCalificacion}</div>
          <div className="stat-label">Promedio Calificación</div>
        </div>

        <div className="stat-card pink">
          <div className="stat-icono">✍️</div>
          <div className="stat-numero">{stats.totalResenas}</div>
          <div className="stat-label">Reseñas Escritas</div>
        </div>

        <div className="stat-card cyan">
          <div className="stat-icono">🎯</div>
          <div className="stat-numero">{stats.plataformaFavorita}</div>
          <div className="stat-label">Plataforma Favorita</div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icono">🏷️</div>
          <div className="stat-numero">{stats.generoFavorito}</div>
          <div className="stat-label">Género Favorito</div>
        </div>

        <div className="stat-card red">
          <div className="stat-icono">🏆</div>
          <div className="stat-numero">
            {stats.totalJuegos > 0 ? Math.round((stats.completados / stats.totalJuegos) * 100) : 0}%
          </div>
          <div className="stat-label">Tasa Completado</div>
        </div>
      </div>

      <div className="top-juegos">
        <h3>🏆 Top 5 Juegos Mejor Calificados</h3>
        <div className="top-lista">
          {juegos
            .sort((a, b) => b.puntuacion - a.puntuacion)
            .slice(0, 5)
            .map((juego, index) => (
              <div key={juego._id} className="top-item">
                <span className="posicion">{index + 1}</span>
                <span className="nombre">{juego.titulo}</span>
                <span className="puntuacion">{'⭐'.repeat(Math.round(juego.puntuacion))}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default EstadisticasPersonales;

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
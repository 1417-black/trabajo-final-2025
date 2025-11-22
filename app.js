
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
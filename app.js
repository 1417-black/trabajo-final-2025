
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

export default App;

DocumentType: {express,mongoose,cors,dotenv} 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/gametracker?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión:', err));

// Rutas
const juegosRoutes = require('./routes/juegos');
const resenasRoutes = require('./routes/resenas');

app.use('/api/juegos', juegosRoutes);
app.use('/api/resenas', resenasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: '🎮 GameTracker API funcionando' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  portada: {
    type: String,
    default: 'https://via.placeholder.com/300x400?text=Sin+Portada'
  },
  plataforma: {
    type: String,
    required: true
  },
  genero: {
    type: String,
    required: true
  },
  puntuacion: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  completado: {
    type: Boolean,
    default: false
  },
  horasJugadas: {
    type: Number,
    default: 0
  },
  fechaAgregado: {
    type: Date,
    default: Date.now
  },
  desarrollador: String,
  anoLanzamiento: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Juego', juegoSchema);
const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  juegoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Juego',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  contenido: {
    type: String,
    required: true
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  aspectosPositivos: {
    type: [String],
    default: []
  },
  aspectosNegativos: {
    type: [String],
    default: []
  },
  recomendado: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resena', resenaSchema);
const express = require('express');
const router = express.Router();
const Juego = require('../models/Juego');

// GET - Obtener todos los juegos
router.get('/', async (req, res) => {
  try {
    const juegos = await Juego.find().sort({ fechaAgregado: -1 });
    res.json(juegos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener juegos', error: error.message });
  }
});

// GET - Obtener un juego por ID
router.get('/:id', async (req, res) => {
  try {
    const juego = await Juego.findById(req.params.id);
    if (!juego) return res.status(404).json({ mensaje: 'Juego no encontrado' });
    res.json(juego);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener juego', error: error.message });
  }
});

// POST - Agregar un nuevo juego
router.post('/', async (req, res) => {
  try {
    const nuevoJuego = new Juego(req.body);
    const juegoGuardado = await nuevoJuego.save();
    res.status(201).json(juegoGuardado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear juego', error: error.message });
  }
});

// PUT - Editar un juego existente
router.put('/:id', async (req, res) => {
  try {
    const juegoActualizado = await Juego.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!juegoActualizado) return res.status(404).json({ mensaje: 'Juego no encontrado' });
    res.json(juegoActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar juego', error: error.message });
  }
});

// DELETE - Eliminar un juego
router.delete('/:id', async (req, res) => {
  try {
    const juegoEliminado = await Juego.findByIdAndDelete(req.params.id);
    if (!juegoEliminado) return res.status(404).json({ mensaje: 'Juego no encontrado' });
    res.json({ mensaje: 'Juego eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar juego', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const any = express.Router();
const Resena = require('../models/Resena');

// GET - Obtener todas las reseñas
router.get('/', async (req, res) => {
  try {
    const resenas = await Resena.find().populate('juegoId').sort({ fechaCreacion: -1 });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseñas', error: error.message });
  }
});

// GET - Obtener reseñas de un juego específico
router.get('/juego/:juegoId', async (req, res) => {
  try {
    const resenas = await Resena.find({ juegoId: req.params.juegoId }).sort({ fechaCreacion: -1 });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseñas', error: error.message });
  }
});

// GET - Obtener una reseña por ID
router.get('/:id', async (req, res) => {
  try {
    const resena = await Resena.findById(req.params.id).populate('juegoId');
    if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    res.json(resena);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseña', error: error.message });
  }
});

// POST - Agregar una nueva reseña
router.post('/', async (req, res) => {
  try {
    const nuevaResena = new Resena(req.body);
    const resenaGuardada = await nuevaResena.save();
    res.status(201).json(resenaGuardada);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear reseña', error: error.message });
  }
});

// PUT - Editar una reseña existente
router.put('/:id', async (req, res) => {
  try {
    const resenaActualizada = await Resena.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resenaActualizada) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    res.json(resenaActualizada);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar reseña', error: error.message });
  }
});

// DELETE - Eliminar una reseña
router.delete('/:id', async (req, res) => {
  try {
    const resenaEliminada = await Resena.findByIdAndDelete(req.params.id);
    if (!resenaEliminada) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    res.json({ mensaje: 'Reseña eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar reseña', error: error.message });
  }
});

module.exports = router;
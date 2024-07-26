// middleware/authMiddleware.js

import jwtUtils from '../middleware/usuarios.middleware'; // Substitua pelo caminho correto do seu arquivo jwtUtils

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwtUtils.verifyToken(token); // Use a função verifyToken do seu jwtUtils
    req.user = decoded; // Adiciona os dados do usuário decodificado ao objeto de solicitação (opcional)
    next(); // Chama next() para continuar o fluxo
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export default authMiddleware;

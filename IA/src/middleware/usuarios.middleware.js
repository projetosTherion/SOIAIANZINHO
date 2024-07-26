import jwt from 'jsonwebtoken';

const jwtUtils = {
  generateToken(payload) {
    const secretKey = 'abc';
    const options = { expiresIn: '1h'}; // Token expira em 1 hora
    const token = jwt.sign(payload, secretKey, options);
    return token;
  },

  verifyToken(token) {
    try {
      const secretKey = 'abc';
      const decoded = jwt.verify(token, secretKey);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  },
};


export default jwtUtils;

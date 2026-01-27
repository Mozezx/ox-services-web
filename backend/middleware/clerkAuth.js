const clerk = require('@clerk/backend');

const verifyClerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.substring(7);
  
  // Token de desenvolvimento para testes (sempre permitir durante desenvolvimento)
  if (token === 'test-token') {
    console.log('⚠️ Usando token de desenvolvimento');
    req.user = {
      id: 'dev-user-id',
      role: 'admin',
    };
    return next();
  }
  
  try {
    const session = await clerk.verifyToken(token);
    // Verificar se o usuário tem role admin (opcional)
    // Pode ser feito via Clerk Organizations ou metadados
    req.user = session;
    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = verifyClerkAuth;
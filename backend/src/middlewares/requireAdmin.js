// Middleware para verificar se o usuário é admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.tipo !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
  }

  next();
};

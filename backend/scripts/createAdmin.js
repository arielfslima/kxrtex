import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'admin@kxrtex.com';
    const senha = 'Admin@2025';
    const nome = 'Admin KXRTEX';

    // Verificar se já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ Usuário admin já existe!');
      console.log('Email:', email);
      return;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário admin
    const admin = await prisma.usuario.create({
      data: {
        email,
        senhaHash,
        nome,
        tipo: 'ADMIN',
        telefone: '00000000000',
        cpfCnpj: '00000000000',
        status: 'ATIVO',
      },
    });

    console.log('\n✅ Usuário admin criado com sucesso!\n');
    console.log('═══════════════════════════════════');
    console.log('Email:', email);
    console.log('Senha:', senha);
    console.log('Nome:', nome);
    console.log('═══════════════════════════════════\n');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

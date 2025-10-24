import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  const hashedPassword = await bcrypt.hash('senha123', 10);

  console.log('👤 Creating test users...');

  const contratante1 = await prisma.usuario.upsert({
    where: { email: 'contratante@test.com' },
    update: {},
    create: {
      email: 'contratante@test.com',
      senhaHash: hashedPassword,
      tipo: 'CONTRATANTE',
      nome: 'João Silva',
      telefone: '(11)99999-1111',
      cpfCnpj: '123.456.789-00',
      foto: 'https://i.pravatar.cc/150?img=12',
      contratante: {
        create: {
          tipoPessoa: 'PF',
        },
      },
    },
    include: { contratante: true },
  });

  console.log(`✅ Contratante created: ${contratante1.email}`);

  const artistasFree = [
    {
      email: 'dj.underground@test.com',
      nome: 'DJ Underground',
      nomeArtistico: 'DJ Underground',
      telefone: '(11)98888-1111',
      cpfCnpj: '111.111.111-11',
      categoria: 'DJ',
      subcategorias: ['Techno', 'House'],
      bio: 'DJ especializado em techno underground com mais de 10 anos de experiência. Já toquei nos principais clubs de São Paulo.',
      cidadesAtuacao: ['São Paulo', 'Campinas'],
      valorBaseHora: 500,
      portfolio: [
        'https://images.unsplash.com/photo-1571330735066-03aaa9429d89',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
      ],
      redesSociais: {
        instagram: 'https://instagram.com/djunderground',
        soundcloud: 'https://soundcloud.com/djunderground',
      },
    },
    {
      email: 'mc.flow@test.com',
      nome: 'MC Flow',
      nomeArtistico: 'MC Flow',
      telefone: '(11)98888-2222',
      cpfCnpj: '222.222.222-22',
      categoria: 'MC',
      subcategorias: ['Rap', 'Freestyle'],
      bio: 'MC de freestyle com habilidade única de improvisar sobre qualquer beat. Performances energéticas e envolventes.',
      cidadesAtuacao: ['São Paulo', 'São Bernardo'],
      valorBaseHora: 300,
      portfolio: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      ],
      redesSociais: {
        instagram: 'https://instagram.com/mcflow',
        youtube: 'https://youtube.com/@mcflow',
      },
    },
  ];

  const artistasPlus = [
    {
      email: 'dj.nexus@test.com',
      nome: 'DJ Nexus',
      nomeArtistico: 'DJ Nexus',
      telefone: '(11)98888-3333',
      cpfCnpj: '333.333.333-33',
      categoria: 'DJ',
      subcategorias: ['Techno', 'Trance'],
      bio: 'DJ profissional com passagens por festivais internacionais. Especialista em criar atmosferas únicas e memoráveis.',
      cidadesAtuacao: ['São Paulo', 'Rio de Janeiro', 'Curitiba'],
      valorBaseHora: 800,
      portfolio: [
        'https://images.unsplash.com/photo-1571266028243-d220c3f28253',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
        'https://images.unsplash.com/photo-1598653222000-6b7b7a552625',
      ],
      redesSociais: {
        instagram: 'https://instagram.com/djnexus',
        spotify: 'https://open.spotify.com/artist/djnexus',
        soundcloud: 'https://soundcloud.com/djnexus',
      },
      verificado: true,
    },
    {
      email: 'performer.eclipse@test.com',
      nome: 'Eclipse',
      nomeArtistico: 'Eclipse Performance',
      telefone: '(11)98888-4444',
      cpfCnpj: '444.444.444-44',
      categoria: 'PERFORMER',
      subcategorias: ['Performance Art', 'Visual'],
      bio: 'Artista performático que mistura dança, iluminação e efeitos visuais. Crio experiências imersivas inesquecíveis.',
      cidadesAtuacao: ['São Paulo', 'Belo Horizonte'],
      valorBaseHora: 600,
      portfolio: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      ],
      redesSociais: {
        instagram: 'https://instagram.com/eclipseperformance',
        youtube: 'https://youtube.com/@eclipseperformance',
      },
    },
  ];

  const artistasPro = [
    {
      email: 'dj.phoenix@test.com',
      nome: 'DJ Phoenix',
      nomeArtistico: 'DJ Phoenix',
      telefone: '(11)98888-5555',
      cpfCnpj: '555.555.555-55',
      categoria: 'DJ',
      subcategorias: ['Techno', 'Experimental', 'Industrial'],
      bio: 'Um dos DJs mais requisitados do circuito underground brasileiro. Headline em festivais nacionais e internacionais. Produtor e label owner.',
      cidadesAtuacao: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Florianópolis'],
      valorBaseHora: 1500,
      portfolio: [
        'https://images.unsplash.com/photo-1571266028243-d220c3f28253',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
        'https://images.unsplash.com/photo-1598653222000-6b7b7a552625',
      ],
      redesSociais: {
        instagram: 'https://instagram.com/djphoenix',
        spotify: 'https://open.spotify.com/artist/djphoenix',
        soundcloud: 'https://soundcloud.com/djphoenix',
        youtube: 'https://youtube.com/@djphoenix',
      },
      verificado: true,
    },
  ];

  for (const artistaData of artistasFree) {
    const usuario = await prisma.usuario.upsert({
      where: { email: artistaData.email },
      update: {},
      create: {
        email: artistaData.email,
        senhaHash: hashedPassword,
        tipo: 'ARTISTA',
        nome: artistaData.nome,
        telefone: artistaData.telefone,
        cpfCnpj: artistaData.cpfCnpj,
        foto: 'https://i.pravatar.cc/150?u=' + artistaData.email,
        artista: {
          create: {
            nomeArtistico: artistaData.nomeArtistico,
            categoria: artistaData.categoria,
            subcategorias: artistaData.subcategorias,
            bio: artistaData.bio,
            cidadesAtuacao: artistaData.cidadesAtuacao,
            portfolio: artistaData.portfolio,
            valorBaseHora: artistaData.valorBaseHora,
            redesSociais: artistaData.redesSociais,
            plano: 'FREE',
          },
        },
      },
    });
    console.log(`✅ Artista FREE created: ${artistaData.nomeArtistico}`);
  }

  for (const artistaData of artistasPlus) {
    const usuario = await prisma.usuario.upsert({
      where: { email: artistaData.email },
      update: {},
      create: {
        email: artistaData.email,
        senhaHash: hashedPassword,
        tipo: 'ARTISTA',
        nome: artistaData.nome,
        telefone: artistaData.telefone,
        cpfCnpj: artistaData.cpfCnpj,
        foto: 'https://i.pravatar.cc/150?u=' + artistaData.email,
        artista: {
          create: {
            nomeArtistico: artistaData.nomeArtistico,
            categoria: artistaData.categoria,
            subcategorias: artistaData.subcategorias,
            bio: artistaData.bio,
            cidadesAtuacao: artistaData.cidadesAtuacao,
            portfolio: artistaData.portfolio,
            valorBaseHora: artistaData.valorBaseHora,
            redesSociais: artistaData.redesSociais,
            plano: 'PLUS',
            statusVerificacao: artistaData.verificado ? 'VERIFICADO' : 'NAO_VERIFICADO',
          },
        },
      },
    });
    console.log(`✅ Artista PLUS created: ${artistaData.nomeArtistico}`);
  }

  for (const artistaData of artistasPro) {
    const usuario = await prisma.usuario.upsert({
      where: { email: artistaData.email },
      update: {},
      create: {
        email: artistaData.email,
        senhaHash: hashedPassword,
        tipo: 'ARTISTA',
        nome: artistaData.nome,
        telefone: artistaData.telefone,
        cpfCnpj: artistaData.cpfCnpj,
        foto: 'https://i.pravatar.cc/150?u=' + artistaData.email,
        artista: {
          create: {
            nomeArtistico: artistaData.nomeArtistico,
            categoria: artistaData.categoria,
            subcategorias: artistaData.subcategorias,
            bio: artistaData.bio,
            cidadesAtuacao: artistaData.cidadesAtuacao,
            portfolio: artistaData.portfolio,
            valorBaseHora: artistaData.valorBaseHora,
            redesSociais: artistaData.redesSociais,
            plano: 'PRO',
            statusVerificacao: artistaData.verificado ? 'VERIFICADO' : 'NAO_VERIFICADO',
          },
        },
      },
    });
    console.log(`✅ Artista PRO created: ${artistaData.nomeArtistico}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Contratante: contratante@test.com / senha123');
  console.log('Artistas: dj.underground@test.com / senha123');
  console.log('          mc.flow@test.com / senha123');
  console.log('          dj.nexus@test.com / senha123');
  console.log('          performer.eclipse@test.com / senha123');
  console.log('          dj.phoenix@test.com / senha123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

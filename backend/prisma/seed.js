import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const initialEvents = [
  {
    tipoEvento: "CREDENCIAMENTO_CRIADO",
    descricao: "Credenciamento criado via seed",
    metadata: { source: "seed" }
  },
  {
    tipoEvento: "CREDENCIAL_GERADA",
    descricao: "Credencial gerada via seed",
    metadata: { source: "seed" }
  }
];

async function main() {
  const evento = await prisma.evento.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {
      nomeEvento: "Fatec Hackathon Credenciamento Setor Cafeeiro",
      isGratuito: true,
      ativo: true
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      nomeEvento: "Fatec Hackathon Credenciamento Setor Cafeeiro",
      isGratuito: true,
      ativo: true
    }
  });

  const seeds = [
    {
      eventoId: evento.id,
      categoria: "EXPOSITOR",
      nomeCompleto: "Mariana Silva",
      cpf: null,
      celular: "11999990001",
      email: "mariana.expositor@demo.com",
      municipio: "Campinas",
      cidadeOrigem: "Campinas",
      uf: "SP",
      nacionalidade: null,
      tipoCombustivel: "GASOLINA",
      combustivel: "GASOLINA",
      distanciaKm: 286,
      pegadaCarbonoEstimada: 583.44,
      pcd: false,
      aceitouLgpd: true,
      aceitouCompartilhamentoComExpositores: true,
      cnpj: "12345678000199",
      siteEmpresa: "https://cafesdeminas.com.br",
      nomeEmpresa: "Cafes de Minas",
      statusCredenciamento: "CADASTRADO"
    },
    {
      eventoId: evento.id,
      categoria: "CAFEICULTOR",
      nomeCompleto: "Carlos Pereira",
      cpf: "52998224725",
      cnpj: null,
      celular: "11999990002",
      email: "carlos.cafeicultor@demo.com",
      municipio: "Varginha",
      cidadeOrigem: "Varginha",
      uf: "MG",
      nacionalidade: null,
      tipoCombustivel: "DIESEL",
      combustivel: "DIESEL",
      distanciaKm: 283,
      pegadaCarbonoEstimada: 735.8,
      pcd: false,
      aceitouLgpd: true,
      aceitouCompartilhamentoComExpositores: false,
      ccir: "CCIR-000123",
      nomePropriedade: "Sitio Boa Safra",
      statusCredenciamento: "CADASTRADO"
    },
    {
      eventoId: evento.id,
      categoria: "VISITANTE",
      nomeCompleto: "Ana Costa",
      cpf: "39053344705",
      cnpj: null,
      celular: "11999990003",
      email: "ana.visitante@demo.com",
      municipio: "Sao Paulo",
      cidadeOrigem: "Sao Paulo",
      uf: "SP",
      nacionalidade: "Brasil",
      tipoCombustivel: "NAO_INFORMADO",
      combustivel: "NAO_INFORMADO",
      distanciaKm: 401,
      pegadaCarbonoEstimada: 72.18,
      pcd: true,
      aceitouLgpd: true,
      aceitouCompartilhamentoComExpositores: true,
      statusCredenciamento: "CADASTRADO"
    }
  ];

  for (const item of seeds) {
    const credenciado = await prisma.credenciado.upsert({
      where: { email: item.email },
      update: item,
      create: item,
      include: { credencial: true }
    });

    const codigoUnico = `SEED-${credenciado.id.slice(0, 8).toUpperCase()}`;

    await prisma.credencial.upsert({
      where: { credenciadoId: credenciado.id },
      update: {
        codigoUnico,
        qrCodePayload: JSON.stringify({
          version: 1,
          credenciadoId: credenciado.id,
          credentialCode: codigoUnico,
          issuedAt: new Date().toISOString()
        }),
        statusCredencial: "GERADA",
        emitidaEm: new Date()
      },
      create: {
        credenciadoId: credenciado.id,
        codigoUnico,
        qrCodePayload: JSON.stringify({
          version: 1,
          credenciadoId: credenciado.id,
          credentialCode: codigoUnico,
          issuedAt: new Date().toISOString()
        }),
        statusCredencial: "GERADA",
        emitidaEm: new Date()
      }
    });

    for (const event of initialEvents) {
      const alreadyExists = await prisma.eventoSistema.findFirst({
        where: {
          credenciadoId: credenciado.id,
          tipoEvento: event.tipoEvento
        }
      });

      if (!alreadyExists) {
        await prisma.eventoSistema.create({
          data: {
            credenciadoId: credenciado.id,
            tipoEvento: event.tipoEvento,
            descricao: event.descricao,
            metadata: event.metadata
          }
        });
      }
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@evento.com").toLowerCase();
  const adminSenha = process.env.ADMIN_PASSWORD || "Admin@123";
  const masterEmail = (process.env.MASTER_EMAIL || "master@evento.com").toLowerCase();
  const masterSenha = process.env.MASTER_PASSWORD || "Master@123";
  const gateEmail = (process.env.GATE_EMAIL || "gate@evento.com").toLowerCase();
  const gateSenha = process.env.GATE_PASSWORD || "Gate@123";
  const leitorEmail = (process.env.LEITOR_EMAIL || "leitor@evento.com").toLowerCase();
  const leitorSenha = process.env.LEITOR_PASSWORD || "Leitor@123";

  const [adminHash, masterHash, gateHash, leitorHash] = await Promise.all([
    bcrypt.hash(adminSenha, 10),
    bcrypt.hash(masterSenha, 10),
    bcrypt.hash(gateSenha, 10),
    bcrypt.hash(leitorSenha, 10)
  ]);

  await prisma.adminUser.upsert({
    where: { email: masterEmail },
    update: {
      nome: "Master Admin",
      passwordHash: masterHash,
      role: "MASTER_ADMIN",
      ativo: true
    },
    create: {
      email: masterEmail,
      nome: "Master Admin",
      passwordHash: masterHash,
      role: "MASTER_ADMIN",
      ativo: true
    }
  });

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      nome: "Administrador",
      passwordHash: adminHash,
      role: "ADMIN",
      ativo: true
    },
    create: {
      email: adminEmail,
      nome: "Administrador",
      passwordHash: adminHash,
      role: "ADMIN",
      ativo: true
    }
  });

  await prisma.adminUser.upsert({
    where: { email: gateEmail },
    update: {
      nome: "App Gate",
      passwordHash: gateHash,
      role: "OPERADOR_QR",
      standId: "STAND-JACTO-01",
      standName: "Stand Jacto",
      empresaNome: "Jacto",
      permissoesCustomizadas: {
        podeValidarEntrada: true,
        podeVisualizarDadosMinimosCredenciado: true,
        podeVerHistoricoBasicoDaCredencial: true,
        podeRegistrarObservacaoOperacional: true,
        podeConsultarUltimasEntradas: true,
        podeUsarCameraParaLeituraQR: true
      },
      ativo: true
    },
    create: {
      email: gateEmail,
      nome: "App Gate",
      passwordHash: gateHash,
      role: "OPERADOR_QR",
      standId: "STAND-SRFRANCA-01",
      standName: "Stand SR Franca",
      empresaNome: "SR Franca",
      permissoesCustomizadas: {
        podeValidarEntrada: true,
        podeVisualizarDadosMinimosCredenciado: true,
        podeVerHistoricoBasicoDaCredencial: true,
        podeRegistrarObservacaoOperacional: true,
        podeConsultarUltimasEntradas: true,
        podeUsarCameraParaLeituraQR: true
      },
      ativo: true
    }
  });

  await prisma.adminUser.upsert({
    where: { email: leitorEmail },
    update: {
      nome: "Leitor Catraca",
      passwordHash: leitorHash,
      role: "OPERADOR_QR",
      permissoesCustomizadas: {
        podeValidarEntrada: true,
        podeVisualizarDadosMinimosCredenciado: true,
        podeVerHistoricoBasicoDaCredencial: true,
        podeRegistrarObservacaoOperacional: true,
        podeConsultarUltimasEntradas: true,
        podeUsarCameraParaLeituraQR: true
      },
      ativo: true
    },
    create: {
      email: leitorEmail,
      nome: "Leitor Catraca",
      passwordHash: leitorHash,
      role: "OPERADOR_QR",
      permissoesCustomizadas: {
        podeValidarEntrada: true,
        podeVisualizarDadosMinimosCredenciado: true,
        podeVerHistoricoBasicoDaCredencial: true,
        podeRegistrarObservacaoOperacional: true,
        podeConsultarUltimasEntradas: true,
        podeUsarCameraParaLeituraQR: true
      },
      ativo: true
    }
  });

  await prisma.gateDevice.upsert({
    where: { codigo: "GATE-ENTRADA-01" },
    update: {
      nome: "Catraca Entrada 01",
      localizacao: "Portao Principal",
      ativo: true
    },
    create: {
      codigo: "GATE-ENTRADA-01",
      nome: "Catraca Entrada 01",
      localizacao: "Portao Principal",
      ativo: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

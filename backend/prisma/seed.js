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
  const eventRecord = await prisma.evento.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {
      nomeEvento: "OpsFlow Core - Demo Event",
      isGratuito: true,
      ativo: true
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      nomeEvento: "OpsFlow Core - Demo Event",
      isGratuito: true,
      ativo: true
    }
  });

  const seeds = [
    {
      eventoId: eventRecord.id,
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
      siteEmpresa: "https://example-exhibitor.com",
      nomeEmpresa: "Example Exhibitor",
      statusCredenciamento: "CADASTRADO"
    },
    {
      eventoId: eventRecord.id,
      categoria: "CAFEICULTOR",
      nomeCompleto: "Carlos Pereira",
      cpf: "52998224725",
      cnpj: null,
      celular: "11999990002",
      email: "carlos.produtor@demo.com",
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
      nomePropriedade: "Propriedade Boa Safra",
      statusCredenciamento: "CADASTRADO"
    },
    {
      eventoId: eventRecord.id,
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
    const participantRecord = await prisma.credenciado.upsert({
      where: { email: item.email },
      update: item,
      create: item,
      include: { credencial: true }
    });

    const uniqueCode = `SEED-${participantRecord.id.slice(0, 8).toUpperCase()}`;

    await prisma.credencial.upsert({
      where: { credenciadoId: participantRecord.id },
      update: {
        codigoUnico: uniqueCode,
        qrCodePayload: JSON.stringify({
          version: 1,
          credenciadoId: participantRecord.id,
          credentialCode: uniqueCode,
          issuedAt: new Date().toISOString()
        }),
        statusCredencial: "GERADA",
        emitidaEm: new Date()
      },
      create: {
        credenciadoId: participantRecord.id,
        codigoUnico: uniqueCode,
        qrCodePayload: JSON.stringify({
          version: 1,
          credenciadoId: participantRecord.id,
          credentialCode: uniqueCode,
          issuedAt: new Date().toISOString()
        }),
        statusCredencial: "GERADA",
        emitidaEm: new Date()
      }
    });

    for (const event of initialEvents) {
      const alreadyExists = await prisma.eventoSistema.findFirst({
        where: {
          credenciadoId: participantRecord.id,
          tipoEvento: event.tipoEvento
        }
      });

      if (!alreadyExists) {
        await prisma.eventoSistema.create({
          data: {
            credenciadoId: participantRecord.id,
            tipoEvento: event.tipoEvento,
            descricao: event.descricao,
            metadata: event.metadata
          }
        });
      }
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@opsflow.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const masterEmail = (process.env.MASTER_EMAIL || "owner@opsflow.local").toLowerCase();
  const masterPassword = process.env.MASTER_PASSWORD || "Master@123";
  const gateEmail = (process.env.GATE_EMAIL || "operator@opsflow.local").toLowerCase();
  const gatePassword = process.env.GATE_PASSWORD || "Gate@123";
  const scannerEmail = (
    process.env.SCANNER_EMAIL ||
    process.env.LEITOR_EMAIL ||
    "scanner@opsflow.local"
  ).toLowerCase();
  const scannerPassword =
    process.env.SCANNER_PASSWORD || process.env.LEITOR_PASSWORD || "Scanner@123";
  const governanceEmail = (
    process.env.GOVERNANCE_EMAIL ||
    process.env.COMISSAO_EMAIL ||
    "governance@opsflow.local"
  ).toLowerCase();
  const governancePassword =
    process.env.GOVERNANCE_PASSWORD || process.env.COMISSAO_PASSWORD || "Governance@123";

  const [adminHash, masterHash, gateHash, scannerHash, governanceHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(masterPassword, 10),
    bcrypt.hash(gatePassword, 10),
    bcrypt.hash(scannerPassword, 10),
    bcrypt.hash(governancePassword, 10)
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
    where: { email: governanceEmail },
    update: {
      nome: "Governance Team",
      passwordHash: governanceHash,
      role: "COMISSAO_ORGANIZADORA",
      ativo: true
    },
    create: {
      email: governanceEmail,
      nome: "Governance Team",
      passwordHash: governanceHash,
      role: "COMISSAO_ORGANIZADORA",
      ativo: true
    }
  });

  const governanceUser = await prisma.adminUser.findUnique({
    where: { email: governanceEmail },
    select: { id: true }
  });

  await prisma.adminUser.upsert({
    where: { email: gateEmail },
    update: {
      nome: "App Gate",
      passwordHash: gateHash,
      role: "OPERADOR_QR",
      standId: "STAND-JACTO-01",
      standName: "Unit A",
      empresaNome: "Organization A",
      empresaVinculadaId: "ORG-A",
      empresaVinculadaNome: "Organization A",
      comissaoResponsavelId: governanceUser?.id || null,
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
      standId: "UNIT-ALPHA-01",
      standName: "Unit Alpha",
      empresaNome: "Organization Alpha",
      empresaVinculadaId: "ORG-ALPHA",
      empresaVinculadaNome: "Organization Alpha",
      comissaoResponsavelId: governanceUser?.id || null,
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
    where: { email: scannerEmail },
    update: {
      nome: "QR Scanner",
      passwordHash: scannerHash,
      role: "OPERADOR_QR",
      comissaoResponsavelId: governanceUser?.id || null,
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
      email: scannerEmail,
      nome: "QR Scanner",
      passwordHash: scannerHash,
      role: "OPERADOR_QR",
      comissaoResponsavelId: governanceUser?.id || null,
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
      nome: "Entry Gate 01",
      localizacao: "Main Gate",
      ativo: true
    },
    create: {
      codigo: "GATE-ENTRADA-01",
      nome: "Entry Gate 01",
      localizacao: "Main Gate",
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

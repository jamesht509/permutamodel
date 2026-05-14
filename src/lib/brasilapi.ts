// BrasilAPI client for fetching municípios by UF.
// Docs: https://brasilapi.com.br/docs#tag/IBGE/paths/~1ibge~1municipios~1v1~1{siglaUF}/get
//
// Strategy: in-memory cache per UF (lives for the page lifetime). On
// timeout/failure, return a small hardcoded fallback so the autocomplete
// doesn't trap the user. The fallback covers all 27 UFs with the top
// cities by population — enough to onboard from a phone with bad signal.

const TIMEOUT_MS = 3000;
const cache = new Map<string, string[]>();

const FALLBACK_CITIES: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul"],
  AL: ["Maceió", "Arapiraca"],
  AP: ["Macapá", "Santana"],
  AM: ["Manaus", "Parintins"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Sobral"],
  DF: ["Brasília", "Taguatinga", "Ceilândia", "Águas Claras"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Luziânia"],
  MA: ["São Luís", "Imperatriz", "Caxias"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas"],
  MG: ["Belo Horizonte", "Contagem", "Uberlândia", "Juiz de Fora", "Betim", "Montes Claros"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá"],
  PB: ["João Pessoa", "Campina Grande"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  PI: ["Teresina", "Parnaíba"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "Petrópolis"],
  RN: ["Natal", "Mossoró", "Parnamirim"],
  RS: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria"],
  RO: ["Porto Velho", "Ji-Paraná"],
  RR: ["Boa Vista"],
  SC: ["Joinville", "Florianópolis", "Blumenau", "Chapecó", "Itajaí"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "Osasco", "Santo André", "São Bernardo do Campo", "Santos", "Ribeirão Preto", "Sorocaba", "São José dos Campos"],
  SE: ["Aracaju", "Nossa Senhora do Socorro"],
  TO: ["Palmas", "Araguaína"],
};

interface BrasilApiMunicipio {
  nome: string;
  codigo_ibge: string;
}

export async function fetchMunicipalities(uf: string): Promise<{ cities: string[]; source: "api" | "fallback" }> {
  const upperUF = uf.toUpperCase();

  const cached = cache.get(upperUF);
  if (cached) return { cities: cached, source: "api" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://brasilapi.com.br/api/ibge/municipios/v1/${upperUF}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`BrasilAPI ${res.status}`);
    const data = (await res.json()) as BrasilApiMunicipio[];
    const cities = data.map((m) => m.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
    cache.set(upperUF, cities);
    return { cities, source: "api" };
  } catch {
    clearTimeout(timeout);
    return { cities: FALLBACK_CITIES[upperUF] ?? [], source: "fallback" };
  }
}

import { Link } from "react-router-dom";

export default function AdminCredenciadosTable({ items, onOpenDetails }) {
  const categoryClass = (categoria) => `badge badge-${(categoria || "").toLowerCase()}`;

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>E-mail</th>
            <th>Celular</th>
            <th>Cidade/UF</th>
            <th>LGPD</th>
            <th>CPF</th>
            <th>CNPJ</th>
            <th>Credencial</th>
            <th>Total entradas</th>
            <th>Ultima entrada</th>
            <th>Cadastro</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nomeCompleto}</td>
              <td>
                <span className={categoryClass(item.categoria)}>{item.categoria}</span>
              </td>
              <td>{item.emailMascarado || "-"}</td>
              <td>{item.celularMascarado || "-"}</td>
              <td>
                {item.municipio}/{item.uf}
              </td>
              <td>
                <span className={item.aceitouLgpd ? "badge badge-success" : "badge badge-danger"}>
                  {item.aceitouLgpd ? "Aceito" : "Nao"}
                </span>
              </td>
              <td>{item.cpfMascarado}</td>
              <td>{item.cnpjMascarado || "-"}</td>
              <td>{item.credencial?.codigoUnico || "N/A"}</td>
              <td>{item.credencial?.totalEntradas ?? 0}</td>
              <td>
                {item.credencial?.ultimaEntrada
                  ? new Date(item.credencial.ultimaEntrada).toLocaleString("pt-BR")
                  : "-"}
              </td>
              <td>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onOpenDetails(item.id)}>
                    Detalhes
                  </button>
                  {item.credencial?.id && (
                    <Link className="link-button" to={`/admin/credenciais/${item.credencial.id}`}>
                      Credencial
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

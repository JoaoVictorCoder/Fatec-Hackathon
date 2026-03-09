import { Link } from "react-router-dom";
import { t } from "../locales";

export default function AdminCredenciadosTable({ items, onOpenDetails }) {
  const getCategoryBadgeClass = (category) => `badge badge-${(category || "").toLowerCase()}`;

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t("table.name")}</th>
            <th>{t("table.category")}</th>
            <th>{t("table.email")}</th>
            <th>{t("table.phone")}</th>
            <th>{t("table.cityState")}</th>
            <th>{t("table.privacy")}</th>
            <th>{t("table.taxId")}</th>
            <th>{t("table.companyTaxId")}</th>
            <th>{t("table.credential")}</th>
            <th>{t("table.totalEntries")}</th>
            <th>{t("table.lastEntry")}</th>
            <th>{t("table.registration")}</th>
            <th>{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nomeCompleto}</td>
              <td>
                <span className={getCategoryBadgeClass(item.categoria)}>{item.categoria}</span>
              </td>
              <td>{item.emailMascarado || "-"}</td>
              <td>{item.celularMascarado || "-"}</td>
              <td>
                {item.municipio}/{item.uf}
              </td>
              <td>
                <span className={item.aceitouLgpd ? "badge badge-success" : "badge badge-danger"}>
                  {item.aceitouLgpd ? t("table.accepted") : t("table.denied")}
                </span>
              </td>
              <td>{item.cpfMascarado}</td>
              <td>{item.cnpjMascarado || "-"}</td>
              <td>{item.credencial?.codigoUnico || t("common.notAvailable")}</td>
              <td>{item.credencial?.totalEntradas ?? 0}</td>
              <td>
                {item.credencial?.ultimaEntrada
                  ? new Date(item.credencial.ultimaEntrada).toLocaleString()
                  : "-"}
              </td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onOpenDetails(item.id)}>
                    {t("table.details")}
                  </button>
                  {item.credencial?.id && (
                    <Link className="link-button" to={`/admin/credenciais/${item.credencial.id}`}>
                      {t("table.credential")}
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

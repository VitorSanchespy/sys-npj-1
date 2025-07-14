export function formatDate(date, withTime = false) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (withTime) {
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${dateStr} ${timeStr}`;
  }
  return dateStr;
}

export function formatCPF(cpf) {
  if (!cpf) return '';
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}
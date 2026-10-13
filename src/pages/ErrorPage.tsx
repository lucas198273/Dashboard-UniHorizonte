import { Link } from 'react-router-dom';

export function ErrorPage() {
  return <section className="py-12 text-center"><h1 className="text-3xl font-bold">Erro inesperado</h1><Link className="mt-4 inline-block text-sm text-blue-600" to="/admin/dashboard">Voltar ao dashboard</Link></section>;
}

import { NavLink } from 'react-router-dom';

const links = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/blog/posts', 'Blog Posts'],
  ['/admin/blog/categories', 'Categorias do blog'],
  ['/admin/products', 'Produtos'],
  ['/admin/products/categories', 'Categorias de produtos'],
] as const;

export function Sidebar() {
  return <aside className="w-64 border-r border-slate-200 bg-white p-4"><nav className="space-y-1">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</NavLink>)}</nav></aside>;
}

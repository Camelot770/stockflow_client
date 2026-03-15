import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/** Карта маршрутов для хлебных крошек */
const routeNames: Record<string, string> = {
  '': 'Главная',
  'products': 'Товары',
  'new': 'Создать',
  'categories': 'Категории',
  'warehouse': 'Склад',
  'operations': 'Операции',
  'inventory': 'Инвентаризация',
  'purchases': 'Закупки',
  'suppliers': 'Поставщики',
  'sales': 'Продажи',
  'returns': 'Возвраты',
  'crm': 'CRM',
  'contacts': 'Контакты',
  'deals': 'Сделки',
  'tasks': 'Задачи',
  'activities': 'Активности',
  'pipelines': 'Воронки',
  'finance': 'Финансы',
  'accounts': 'Счета',
  'transactions': 'Транзакции',
  'reports': 'Отчёты',
  'documents': 'Документы',
  'analytics': 'Аналитика',
  'settings': 'Настройки',
  'users': 'Пользователи',
  'warehouses': 'Склады',
  'units': 'Единицы',
  'price-lists': 'Прайс-листы',
  'audit': 'Журнал аудита',
  'login': 'Вход',
  'register': 'Регистрация',
  'forgot-password': 'Восстановление пароля',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = routeNames[segment] || segment;
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm">
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          {crumb.isLast ? (
            <span className="font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="text-muted-foreground hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

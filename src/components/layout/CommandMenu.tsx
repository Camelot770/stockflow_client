import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Users, Handshake, LayoutDashboard, ShoppingCart,
  TrendingUp, Settings, BarChart3, FileText, Warehouse,
} from 'lucide-react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { useUIStore } from '@/stores/uiStore';

export function CommandMenu() {
  const { commandMenuOpen, setCommandMenuOpen } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandMenuOpen, setCommandMenuOpen]);

  const runCommand = (command: () => void) => {
    setCommandMenuOpen(false);
    command();
  };

  return (
    <CommandDialog open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <CommandInput placeholder="Введите команду или поиск..." />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        <CommandGroup heading="Навигация">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Главная
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/products'))}>
            <Package className="mr-2 h-4 w-4" />
            Товары
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/warehouse'))}>
            <Warehouse className="mr-2 h-4 w-4" />
            Склад
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/purchases'))}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Закупки
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/sales'))}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Продажи
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/crm/contacts'))}>
            <Users className="mr-2 h-4 w-4" />
            Контакты
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/crm/deals'))}>
            <Handshake className="mr-2 h-4 w-4" />
            Сделки
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Быстрые действия">
          <CommandItem onSelect={() => runCommand(() => navigate('/products/new'))}>
            <Package className="mr-2 h-4 w-4" />
            Создать товар
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/sales/new'))}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Создать продажу
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/purchases/new'))}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Создать закупку
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Прочее">
          <CommandItem onSelect={() => runCommand(() => navigate('/documents'))}>
            <FileText className="mr-2 h-4 w-4" />
            Документы
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/analytics'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Аналитика
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            Настройки
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

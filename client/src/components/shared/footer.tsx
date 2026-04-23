import { Link } from "wouter";

/**
 * Footer — подвал сайта.
 * Присутствует на всех страницах через PageWrapper или напрямую.
 * Чтобы изменить ссылки/контакты — редактируй этот файл.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border/50 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Колонки */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Бренд */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="8" fill="hsl(74 78% 58%)" />
                <circle cx="16" cy="16" r="7.5" stroke="hsl(0 0% 8%)" strokeWidth="3" fill="none" />
                <line x1="21" y1="21" x2="23.5" y2="23.5" stroke="hsl(0 0% 8%)" strokeWidth="3" strokeLinecap="round" />
                <line x1="24.5" y1="24.5" x2="30" y2="30" stroke="hsl(0 0% 8%)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2.5" />
                <polyline points="26,30 30,30 30,26" stroke="hsl(0 0% 8%)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span className="font-bold text-base text-foreground">QuestTrip</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Платформа онлайн-квестов — покупай, играй, создавай.
            </p>
            <div className="flex gap-3 mt-1">
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm">Telegram</a>
              <a href="https://vk.com/" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm">ВКонтакте</a>
            </div>
          </div>

          {/* Платформа */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Платформа</span>
            <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Каталог квестов</Link>
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Для создателей</Link>
            <a href="#faq"
              onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">FAQ</a>
            <a href="#about"
              onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">О проекте</a>
          </div>

          {/* Поддержка */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Поддержка</span>
            <a href="mailto:support@questtrip.ru"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">support@questtrip.ru</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Помощь / FAQ</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Сообщить о проблеме</a>
          </div>

          {/* Документы */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Документы</span>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Политика конфиденциальности</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Пользовательское соглашение</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Публичная оферта</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Политика возврата</a>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 QuestTrip. Все права защищены.</span>
          <span>ИП Иванов И.И. · ИНН 000000000000</span>
        </div>
      </div>
    </footer>
  );
}
